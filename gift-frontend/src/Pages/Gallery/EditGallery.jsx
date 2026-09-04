import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save, ArrowLeft, Upload, X, Image,
  Film, AlertCircle, Check, Info
} from 'lucide-react';
import { fetchGalleryCategories, fetchGalleryItemById, updateGalleryItem } from '../../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MAX_VIDEO_SIZE_MB = 500;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

export default function EditGalleryItem() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [mediaType, setMediaType] = useState('image');
  const [imageFile, setImageFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoSource, setVideoSource] = useState('upload');
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesResponse, itemResult] = await Promise.all([
          fetchGalleryCategories(),
          fetchGalleryItemById(id),
        ]);
        setCategories(categoriesResponse.data);

        if (!itemResult.success) {
          setError(itemResult.message || 'Failed to load gallery item.');
          return;
        }

        const item = itemResult.data;
        setTitle(item.title || '');
        setDescription(item.description || '');
        setSelectedCategories((item.categories || []).map((cat) => cat.id));
        setMediaType(item.media_type || 'image');
        setIsActive(item.is_active);
        if (item.media_type === 'image') {
          setImagePreview(item.image || null);
        } else if (item.media_type === 'video') {
          if (item.video_url) {
            setVideoSource('url');
            setVideoUrl(item.video_url);
          } else if (item.video_file) {
            setVideoSource('upload');
          }
        }
        setThumbnailPreview(item.thumbnail || null);
      } catch (err) {
        console.error('Error loading gallery item:', err);
        setError('Failed to load gallery item. Please refresh the page.');
      } finally {
        setFetching(false);
      }
    };

    loadData();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      setValidationErrors((prev) => ({
        ...prev,
        videoFile: `This file is ${sizeMB}MB — over the ${MAX_VIDEO_SIZE_MB}MB limit for a single upload. Try a smaller or compressed video, or use the "Use a URL instead" option.`,
      }));
      e.target.value = '';
      setVideoFile(null);
      return;
    }

    setValidationErrors((prev) => {
      const { videoFile, ...rest } = prev;
      return rest;
    });
    setVideoFile(file);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((cid) => cid !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    }

    // Unlike Add, a file isn't required here — an item already has media,
    // and it's only being replaced if the admin picks a new file.
    if (mediaType === 'video' && videoSource === 'url' && !videoUrl.trim()) {
      errors.videoUrl = 'Video URL is required';
    }
    if (mediaType === 'video' && videoSource === 'upload' && videoFile && videoFile.size > MAX_VIDEO_SIZE_BYTES) {
      errors.videoFile = `This file is over the ${MAX_VIDEO_SIZE_MB}MB limit for a single upload.`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('media_type', mediaType);
      formData.append('is_active', isActive);

      selectedCategories.forEach((categoryId) => {
        formData.append('categories', categoryId);
      });

      // Only send files that were actually replaced — the backend does a
      // partial update, so omitted fields keep their existing value.
      if (mediaType === 'image' && imageFile) {
        formData.append('image', imageFile);
      } else if (mediaType === 'video') {
        if (videoSource === 'upload' && videoFile) {
          formData.append('video_file', videoFile);
        } else if (videoSource === 'url') {
          formData.append('video_url', videoUrl);
        }
      }
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      const result = await updateGalleryItem(id, formData, (progressEvent) => {
        if (progressEvent.total) {
          setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        }
      });
      if (!result.success) {
        toast.error(result.message || 'Failed to update gallery item.');
        setError(result.message || 'Failed to update gallery item.');
        return;
      }

      setSuccess(true);
      toast.success('Gallery item updated successfully!');
      setTimeout(() => navigate('/dashboard/getGallery'), 1200);
    } catch (err) {
      console.error('Error updating gallery item:', err);
      setError('Failed to update gallery item. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (fetching) {
    return (
      <div className="bg-gray-50 min-h-screen py-8 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Edit Gallery Item</h1>
              <p className="mt-1 text-gray-600">
                Update this gallery item's details or replace its media
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/dashboard/getGallery')}
                className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center">
                <ArrowLeft size={16} className="mr-1" /> Back to Gallery
              </button>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 p-4 rounded-lg flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <Check size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-green-700 font-medium">Gallery item was successfully updated!</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-lg flex items-center">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <AlertCircle size={16} className="text-red-600" />
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-display font-medium text-gray-900 mb-4">Basic Information</h2>

              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${validationErrors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter a title for your gallery item"
                />
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Provide a description for your gallery item (optional)"
                />
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-display font-medium text-gray-900 mb-4">Media Type</h2>

              <div className="flex space-x-4">
                <div
                  className={`flex-1 p-4 border rounded-lg cursor-pointer ${mediaType === 'image'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  onClick={() => setMediaType('image')}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Image size={24} className={mediaType === 'image' ? 'text-orange-600' : 'text-gray-500'} />
                  </div>
                  <h3 className="text-center font-medium">Image</h3>
                </div>

                <div
                  className={`flex-1 p-4 border rounded-lg cursor-pointer ${mediaType === 'video'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  onClick={() => setMediaType('video')}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Film size={24} className={mediaType === 'video' ? 'text-orange-600' : 'text-gray-500'} />
                  </div>
                  <h3 className="text-center font-medium">Video</h3>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-display font-medium text-gray-900 mb-4">
                {mediaType === 'image' ? 'Image' : 'Video'}
              </h2>

              {mediaType === 'image' ? (
                <div className="mb-4">
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center ${validationErrors.image
                    ? 'border-red-300 bg-red-50'
                    : imageFile
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 hover:border-orange-300 hover:bg-gray-50'
                    }`}>
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <label htmlFor="image-upload" className="absolute top-2 right-2 bg-gray-900 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 cursor-pointer">
                          <Upload size={16} />
                        </label>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">No image set</p>
                      </div>
                    )}
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-orange-600 hover:text-orange-500">
                        {imagePreview ? 'Click to replace image' : 'Click to upload an image'}
                      </span>
                      <input
                        id="image-upload"
                        name="image"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  {validationErrors.image && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.image}</p>
                  )}
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setVideoSource('upload')}
                      className={`px-3 py-1.5 text-sm rounded-md border ${videoSource === 'upload'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      Upload a file
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSource('url')}
                      className={`px-3 py-1.5 text-sm rounded-md border ${videoSource === 'url'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      Use a URL instead
                    </button>
                  </div>

                  {videoSource === 'upload' ? (
                    <div>
                      <div className={`border-2 border-dashed rounded-lg p-6 text-center ${validationErrors.videoFile
                        ? 'border-red-300 bg-red-50'
                        : videoFile
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300 hover:border-orange-300 hover:bg-gray-50'
                        }`}>
                        {videoFile ? (
                          <div className="flex items-center justify-center gap-3">
                            <Film size={28} className="text-green-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate max-w-xs">{videoFile.name}</span>
                            <button
                              type="button"
                              onClick={() => setVideoFile(null)}
                              className="bg-gray-900 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 flex-shrink-0"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Film className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-1 text-sm text-gray-500">
                              {videoSource === 'upload' ? 'Existing video kept unless replaced' : ''}
                            </p>
                            <div className="mt-2">
                              <label htmlFor="video-upload" className="cursor-pointer">
                                <span className="mt-2 block text-sm font-medium text-orange-600 hover:text-orange-500">
                                  Click to replace video
                                </span>
                                <input
                                  id="video-upload"
                                  name="video_file"
                                  type="file"
                                  accept="video/*"
                                  className="sr-only"
                                  onChange={handleVideoFileChange}
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                      {validationErrors.videoFile && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.videoFile}</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-1">
                        Video URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        id="video-url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${validationErrors.videoUrl ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="https://example.com/video.mp4"
                      />
                      {validationErrors.videoUrl && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.videoUrl}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-md font-display font-medium text-gray-900 mb-2">
                  Thumbnail Image
                </h3>

                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${thumbnailFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-orange-300 hover:bg-gray-50'
                  }`}>
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail Preview"
                        className="h-32 mx-auto rounded-lg"
                      />
                      <label htmlFor="thumbnail-upload" className="absolute top-2 right-2 bg-gray-900 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 cursor-pointer">
                        <Upload size={16} />
                      </label>
                    </div>
                  ) : (
                    <div>
                      <div className="mt-1">
                        <label htmlFor="thumbnail-upload" className="cursor-pointer">
                          <span className="mt-1 block text-sm font-medium text-orange-600 hover:text-orange-500">
                            Upload thumbnail
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                  <label htmlFor="thumbnail-upload" className="cursor-pointer block mt-2">
                    <span className="text-sm font-medium text-orange-600 hover:text-orange-500">
                      {thumbnailPreview ? 'Click to replace thumbnail' : ''}
                    </span>
                    <input
                      id="thumbnail-upload"
                      name="thumbnail"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleThumbnailChange}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-display font-medium text-gray-900 mb-4">Categories</h2>

              {categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`px-4 py-2 rounded-full cursor-pointer ${selectedCategories.includes(category.id)
                        ? 'bg-orange-100 text-orange-800 border-2 border-orange-400'
                        : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                        }`}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg flex items-center">
                  <Info size={16} className="text-yellow-600 mr-2" />
                  <p className="text-yellow-700">No categories found</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-display font-medium text-gray-900 mb-4">Status</h2>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className={`px-4 py-2 rounded-md ${isActive
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className={`px-4 py-2 rounded-md ${!isActive
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t">
            {loading && (mediaType === 'video' || uploadProgress > 0) && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Uploading{mediaType === 'video' ? ' video' : ''}...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard/getGallery')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {uploadProgress > 0 && uploadProgress < 100 ? `Uploading ${uploadProgress}%...` : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
