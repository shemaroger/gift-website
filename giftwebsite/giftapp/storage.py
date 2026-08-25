from django.core.files.storage import FileSystemStorage


class LocalVideoStorage(FileSystemStorage):
    """
    Video files are stored on local disk (served from MEDIA_ROOT/MEDIA_URL,
    under the model field's own upload_to='gallery/videos/') instead of
    Cloudinary, since Cloudinary rejects large/unusual video files that
    would otherwise upload fine to local storage.
    """
    pass
