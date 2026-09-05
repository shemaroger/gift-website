"""
Google Drive-backed Django storage.

Plugs into DEFAULT_FILE_STORAGE (settings.py), so every existing
ImageField/FileField (Ad.image, Event.image/banner, BlogPost.featured_image,
GalleryItem.image/video_file/thumbnail, User.profile_picture, ...) uploads to
Google Drive transparently, with no changes to models/serializers/views.

The Drive file's id is what gets stored as the field's `name` in the
database (e.g. Ad.image.name == "<drive_file_id>"), so the existing
file_id/metadata-in-the-DB requirement falls out of Django's normal
FileField behavior rather than needing a parallel table.

Files are organized on Drive under a configured root folder, split into
`images/` or `videos/` subfolders based on the model field's own
`upload_to` prefix and the file's content type.

Authentication is OAuth 2.0 against a personal Google account (service
accounts have no storage quota on non-Workspace Drive, so they cannot own
uploaded files here). A one-time authorization flow, initiated by an admin
through the app's normal JWT-authenticated API (POST
/api/google-drive/auth/start/, see views.py) and completed by Google
redirecting the browser to GET /api/google-drive/callback/, produces a
refresh token that is persisted to GOOGLE_DRIVE_TOKEN_FILE and
reused/refreshed automatically on every subsequent request.
"""
import io
import json
import mimetypes
import os
import secrets
import threading
from datetime import datetime

from django.conf import settings
from django.core import signing
from django.core.cache import cache
from django.core.files.base import ContentFile
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible

from google.auth.transport.requests import AuthorizedSession, Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload, MediaIoBaseUpload
from googleapiclient.errors import HttpError

# drive.file: the app can only see/manage files *it* creates (or the user
# explicitly opens with it) — not the user's whole Drive. Every file this
# app touches is one it created, so this is the narrowest scope that works.
SCOPES = ["https://www.googleapis.com/auth/drive.file"]


class GoogleDriveError(Exception):
    """Raised when a Drive API call fails (e.g. quota, rejected file, network)."""


class GoogleDriveNotAuthorized(GoogleDriveError):
    """Raised when no OAuth token has been stored yet (the one-time auth flow hasn't run)."""


def drf_exception_handler(exc, context):
    """DRF EXCEPTION_HANDLER: turns any uncaught GoogleDriveError into a clean
    400 instead of the default 500, for views that don't already wrap
    serializer.save() in their own try/except (e.g. plain generics views)."""
    from rest_framework.views import exception_handler as default_exception_handler
    from rest_framework.response import Response
    from rest_framework import status as drf_status

    if isinstance(exc, GoogleDriveError):
        return Response({'error': str(exc)}, status=drf_status.HTTP_400_BAD_REQUEST)
    return default_exception_handler(exc, context)


VIDEO_UPLOAD_PREFIXES = ("gallery/videos/",)
IMAGE_SUBFOLDER = "images"
VIDEO_SUBFOLDER = "videos"

_STATE_SALT = "gdrive-oauth-state"
_STATE_CACHE_PREFIX = "gdrive_oauth_state:"
_STATE_TTL_SECONDS = 600  # 10 minutes to complete the Google consent screen


class InvalidOAuthState(GoogleDriveError):
    """Raised when the callback's `state` param is missing, forged, expired, or reused."""


def generate_oauth_state(admin_id):
    """Creates a one-time, admin-scoped OAuth state token for the auth-start flow.

    The nonce is unguessable (256 bits) and only valid once: a matching
    cache entry is what actually authorizes a callback to proceed, and it's
    deleted the moment it's consumed. The outer signing wrapper additionally
    binds the nonce to `admin_id` and enforces expiry independent of the
    cache backend, so a forged/tampered state is rejected before any cache
    lookup happens.
    """
    nonce = secrets.token_urlsafe(32)
    cache.set(f"{_STATE_CACHE_PREFIX}{nonce}", admin_id, timeout=_STATE_TTL_SECONDS)
    return signing.dumps({"nonce": nonce, "admin_id": admin_id}, salt=_STATE_SALT)


def consume_oauth_state(signed_state):
    """Validates and one-time-consumes a state token from the callback.

    Returns the admin_id that initiated the flow. Raises InvalidOAuthState
    if the state is missing, forged, expired, or already used.
    """
    if not signed_state:
        raise InvalidOAuthState("Missing authorization state.")
    try:
        data = signing.loads(signed_state, salt=_STATE_SALT, max_age=_STATE_TTL_SECONDS)
    except signing.BadSignature:
        raise InvalidOAuthState("Invalid or expired authorization state.")

    nonce = data.get("nonce")
    admin_id = data.get("admin_id")
    cache_key = f"{_STATE_CACHE_PREFIX}{nonce}"
    cached_admin_id = cache.get(cache_key)
    if cached_admin_id is None:
        raise InvalidOAuthState("Authorization state was already used or has expired.")
    cache.delete(cache_key)  # one-time use, regardless of outcome past this point

    if cached_admin_id != admin_id:
        raise InvalidOAuthState("Authorization state does not match the initiating admin.")
    return admin_id


def _client_config():
    client_id = getattr(settings, "GOOGLE_OAUTH_CLIENT_ID", None)
    client_secret = getattr(settings, "GOOGLE_OAUTH_CLIENT_SECRET", None)
    redirect_uri = getattr(settings, "GOOGLE_OAUTH_REDIRECT_URI", None)
    if not (client_id and client_secret and redirect_uri):
        raise ValueError(
            "GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET and "
            "GOOGLE_OAUTH_REDIRECT_URI must all be configured."
        )
    return {
        "web": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [redirect_uri],
        }
    }, redirect_uri


def get_authorization_url(state=None):
    """Builds the URL to send the browser to for the one-time consent flow."""
    client_config, redirect_uri = _client_config()
    flow = Flow.from_client_config(client_config, scopes=SCOPES, state=state)
    flow.redirect_uri = redirect_uri
    auth_url, state = flow.authorization_url(
        access_type="offline",  # required to get a refresh_token back
        include_granted_scopes="true",
        prompt="consent",  # forces a refresh_token even on repeat authorizations
    )
    return auth_url, state


def exchange_code_for_token(code, state=None):
    """Exchanges the one-time authorization code for credentials and persists them."""
    client_config, redirect_uri = _client_config()
    flow = Flow.from_client_config(client_config, scopes=SCOPES, state=state)
    flow.redirect_uri = redirect_uri
    flow.fetch_token(code=code)
    _save_credentials(flow.credentials)
    return flow.credentials


def _token_file_path():
    token_file = getattr(settings, "GOOGLE_DRIVE_TOKEN_FILE", None)
    if not token_file:
        raise ValueError("GOOGLE_DRIVE_TOKEN_FILE is not configured.")
    return token_file


def _save_credentials(credentials):
    path = _token_file_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    # Merge onto whatever's already there (e.g. root_folder_id) rather than
    # clobbering it — this runs on every token refresh, not just first auth.
    data = _read_token_data() if os.path.exists(path) else {}
    data.update({
        "token": credentials.token,
        "refresh_token": credentials.refresh_token or data.get("refresh_token"),
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": credentials.scopes,
        # Without this, a reloaded Credentials object never knows it's
        # stale (`.expired` needs `.expiry` to mean anything), so our
        # proactive refresh in _get_valid_credentials silently never
        # fires — every single request then pays for an extra full round
        # trip via AuthorizedSession's reactive 401-retry-refresh instead.
        "expiry": credentials.expiry.isoformat() if credentials.expiry else None,
    })
    # Written with 0600 permissions since this file holds a live refresh
    # token equivalent to a long-lived password for the authorized account.
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        json.dump(data, f)


def _load_credentials():
    path = _token_file_path()
    if not os.path.exists(path):
        return None
    with open(path) as f:
        data = json.load(f)
    credentials = Credentials(
        token=data.get("token"),
        refresh_token=data.get("refresh_token"),
        token_uri=data.get("token_uri"),
        client_id=data.get("client_id"),
        client_secret=data.get("client_secret"),
        scopes=data.get("scopes"),
    )
    expiry = data.get("expiry")
    if expiry:
        credentials.expiry = datetime.fromisoformat(expiry)
    return credentials


def is_authorized():
    return _load_credentials() is not None


def _read_token_data():
    path = _token_file_path()
    if not os.path.exists(path):
        return {}
    with open(path) as f:
        return json.load(f)


def _get_stored_root_folder_id():
    return _read_token_data().get("root_folder_id")


def _store_root_folder_id(folder_id):
    path = _token_file_path()
    data = _read_token_data()
    data["root_folder_id"] = folder_id
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        json.dump(data, f)


class GoogleDriveClient:
    """Thin, lazily-initialized wrapper around the Drive v3 API.

    One instance is shared process-wide (see `get_drive_client` below);
    the underlying googleapiclient service object is not thread-safe to
    share across threads doing concurrent requests, so a lock guards
    folder-creation/lookup, which is the only stateful, cacheable part.
    """

    def __init__(self):
        self._service = None
        self._credentials = None
        self._lock = threading.Lock()
        self._folder_cache = {}

    def _get_valid_credentials(self):
        # Cached on the instance so a live process (this client is a
        # module-level singleton, see get_drive_client()) doesn't re-read
        # the token file from disk on every single request — that file
        # lives on an iCloud-synced volume in dev, where disk reads carry
        # real, noticeable latency.
        if self._credentials is None:
            self._credentials = _load_credentials()
            if self._credentials is None:
                raise GoogleDriveNotAuthorized(
                    "Google Drive isn't authorized yet. As an admin, use the 'Connect Google "
                    "Drive' button in the dashboard (POST /api/google-drive/auth/start/) to "
                    "complete the one-time consent flow."
                )
        if self._credentials.expired and self._credentials.refresh_token:
            self._credentials.refresh(Request())
            _save_credentials(self._credentials)
        return self._credentials

    def _get_service(self):
        if self._service is None:
            credentials = self._get_valid_credentials()
            self._service = build("drive", "v3", credentials=credentials, cache_discovery=False)
        return self._service

    def _get_or_create_subfolder(self, name, parent_id):
        cache_key = (name, parent_id)
        if cache_key in self._folder_cache:
            return self._folder_cache[cache_key]

        with self._lock:
            if cache_key in self._folder_cache:
                return self._folder_cache[cache_key]

            service = self._get_service()
            query = (
                f"name = '{name}' and '{parent_id}' in parents "
                "and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
            )
            results = service.files().list(
                q=query, spaces="drive", fields="files(id, name)"
            ).execute()
            files = results.get("files", [])
            if files:
                folder_id = files[0]["id"]
            else:
                metadata = {
                    "name": name,
                    "mimeType": "application/vnd.google-apps.folder",
                    "parents": [parent_id],
                }
                folder = service.files().create(body=metadata, fields="id").execute()
                folder_id = folder["id"]

            self._folder_cache[cache_key] = folder_id
            return folder_id

    def _get_or_create_root_folder(self):
        # With the drive.file scope, the app can only see folders it created
        # itself — a folder created by hand in the Drive UI (as for the old
        # service-account setup) is invisible to it. So instead of pointing
        # at a pre-existing folder id, the app creates its own root folder
        # on first use and remembers the id alongside the OAuth token.
        if "__root__" in self._folder_cache:
            return self._folder_cache["__root__"]

        with self._lock:
            if "__root__" in self._folder_cache:
                return self._folder_cache["__root__"]

            stored_id = _get_stored_root_folder_id()
            if stored_id:
                self._folder_cache["__root__"] = stored_id
                return stored_id

            service = self._get_service()
            name = getattr(settings, "GOOGLE_DRIVE_ROOT_FOLDER_NAME", "GiftApp Storage")
            metadata = {"name": name, "mimeType": "application/vnd.google-apps.folder"}
            folder = service.files().create(body=metadata, fields="id").execute()
            folder_id = folder["id"]
            _store_root_folder_id(folder_id)
            self._folder_cache["__root__"] = folder_id
            return folder_id

    def folder_for(self, subfolder):
        """Returns the Drive folder id for 'images' or 'videos' under the root folder."""
        root_folder_id = self._get_or_create_root_folder()
        return self._get_or_create_subfolder(subfolder, root_folder_id)

    def upload(self, name, fileobj, mime_type, subfolder):
        """Uploads `fileobj` (any file-like object positioned at 0) to Drive.

        Resumable + chunked, matching Google's own recommendation for
        anything over ~5MB: each chunk gets its own retry rather than the
        whole (possibly hundreds-of-MB) upload failing and restarting from
        scratch on a single transient error. `fileobj` is streamed directly
        rather than read fully into memory first — for Django's own
        uploaded-file objects (used via GoogleDriveStorage._save) that
        avoids doubling memory usage on top of whatever Django's own
        upload handling already buffered.
        """
        service = self._get_service()
        try:
            parent_id = self.folder_for(subfolder)
            media = MediaIoBaseUpload(
                fileobj, mimetype=mime_type, chunksize=4 * 1024 * 1024, resumable=True
            )
            metadata = {"name": name, "parents": [parent_id]}
            request = service.files().create(
                body=metadata, media_body=media, fields="id, webContentLink, webViewLink"
            )
            response = None
            while response is None:
                _, response = request.next_chunk()
            file_id = response["id"]
            # Files uploaded by the service account are private by default; make
            # them readable via link so the stored URL actually resolves.
            service.permissions().create(
                fileId=file_id, body={"type": "anyone", "role": "reader"}
            ).execute()
            return file_id
        except HttpError as exc:
            raise GoogleDriveError(str(exc)) from exc

    def download(self, file_id):
        service = self._get_service()
        request = service.files().get_media(fileId=file_id)
        buffer = io.BytesIO()
        downloader = MediaIoBaseDownload(buffer, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()
        buffer.seek(0)
        return buffer

    def delete(self, file_id):
        service = self._get_service()
        try:
            service.files().delete(fileId=file_id).execute()
        except HttpError as exc:
            if exc.resp.status != 404:
                raise

    def exists(self, file_id):
        service = self._get_service()
        try:
            service.files().get(fileId=file_id, fields="id").execute()
            return True
        except HttpError as exc:
            if exc.resp.status == 404:
                return False
            raise

    def get_metadata(self, file_id):
        service = self._get_service()
        return service.files().get(
            fileId=file_id, fields="id, name, mimeType, size, webViewLink, webContentLink, createdTime"
        ).execute()

    def stream_download(self, file_id, range_header=None):
        """Returns a `requests.Response` streamed (not buffered) from Drive's
        alt=media endpoint, for piping straight into a Django
        StreamingHttpResponse without loading the whole file into memory —
        important for large (up to hundreds of MB) videos. Skips building the
        full googleapiclient discovery-based service (unnecessary overhead
        for a plain authenticated GET) — just refreshes credentials and
        makes the request directly.

        `range_header`, if given, is forwarded verbatim to Drive (which
        supports byte-range requests) so the proxy can honor a browser's
        Range request — required for <video> playback/seeking; without it,
        browsers won't reliably play a large video served as one big 200."""
        credentials = self._get_valid_credentials()
        session = AuthorizedSession(credentials)
        url = f"https://www.googleapis.com/drive/v3/files/{file_id}"
        headers = {"Range": range_header} if range_header else None
        response = session.get(url, params={"alt": "media"}, stream=True, headers=headers)
        if response.status_code == 404:
            raise GoogleDriveError(f"File {file_id} not found on Drive.")
        if not response.ok and response.status_code != 206:
            raise GoogleDriveError(f"Drive download failed with status {response.status_code}.")
        return response


_client = None
_client_lock = threading.Lock()


def get_drive_client():
    global _client
    if _client is None:
        with _client_lock:
            if _client is None:
                _client = GoogleDriveClient()
    return _client


@deconstructible
class GoogleDriveStorage(Storage):
    """Django Storage backend that stores files on Google Drive.

    The stored `name` for a file is its Drive file id. `url()` returns a
    direct-content Drive URL built from that id, so existing template/
    frontend code that just does `<img src={field.url}>` keeps working.
    """

    def _subfolder_for(self, name, content):
        if name.startswith(VIDEO_UPLOAD_PREFIXES):
            return VIDEO_SUBFOLDER
        mime_type, _ = mimetypes.guess_type(name)
        if mime_type and mime_type.startswith("video/"):
            return VIDEO_SUBFOLDER
        return IMAGE_SUBFOLDER

    def _open(self, name, mode="rb"):
        client = get_drive_client()
        buffer = client.download(name)
        return ContentFile(buffer.read())

    def _save(self, name, content):
        client = get_drive_client()
        mime_type, _ = mimetypes.guess_type(name)
        mime_type = mime_type or "application/octet-stream"
        content.seek(0)
        subfolder = self._subfolder_for(name, content)
        display_name = name.rsplit("/", 1)[-1]
        # `content` (Django's UploadedFile) is streamed straight into the
        # resumable upload rather than fully read into a bytes buffer first.
        file_id = client.upload(display_name, content, mime_type, subfolder)
        return file_id

    def get_available_name(self, name, max_length=None):
        # Drive allows duplicate filenames (it distinguishes files by id,
        # not path), so there is no collision to resolve here.
        return name

    def exists(self, name):
        # `name` is empty for a not-yet-saved field, and becomes the Drive
        # file id afterwards; a non-id string never collides with a real id.
        if not name:
            return False
        try:
            return get_drive_client().exists(name)
        except ValueError:
            return False

    def delete(self, name):
        if not name:
            return
        get_drive_client().delete(name)

    def size(self, name):
        metadata = get_drive_client().get_metadata(name)
        return int(metadata.get("size", 0))

    def url(self, name):
        if not name:
            return ""
        # Drive's public "uc?export=view" links are unreliable for <img>/
        # <video> embedding (Google's anti-hotlink heuristics intermittently
        # block them even when the file is shared "anyone with the link").
        # Proxying through our own backend (see GoogleDriveMediaProxyView)
        # is what actually renders reliably.
        backend_url = settings.BACKEND_BASE_URL.rstrip('/')
        return f"{backend_url}/api/media/drive/{name}/"
