import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Save, Image, X, Tag, ArrowLeft, Clock, Star } from 'lucide-react';
import { fetchCategory, fetchblogById, updateblog } from "../../api";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    content: '',
    excerpt: '',
    featured_image: null,
    status: 'draft',
    is_featured: false
  });

  const [categories, setCategories] = useState([]);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCategories = async () => {
    try {
      const result = await fetchCategory();
      if (Array.isArray(result.data) && result.data.every(cat => cat.name)) {
        setCategories(result.data);
      } else {
        toast.error("Error fetching categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      getCategories();
      const result = await fetchblogById(id);
      if (result.success) {
        const post = result.data;
        setFormData({
          title: post.title || '',
          slug: post.slug || '',
          category: post.category?.id || post.category || '',
          content: post.content || '',
          excerpt: post.excerpt || '',
          featured_image: null,
          status: post.status || 'draft',
          is_featured: post.is_featured || false
        });
        setExistingImageUrl(post.featured_image || null);
      } else {
        setLoadError(result.message);
      }
      setInitialLoading(false);
    };
    load();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, featured_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // A File can't survive a plain-object JSON put (axios turns it into
      // "{}" when it JSON-stringifies the payload), so build real
      // multipart FormData instead — only appending featured_image when a
      // new one was actually picked.
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'featured_image') {
          if (value) payload.append(key, value);
        } else {
          payload.append(key, value);
        }
      });

      const response = await updateblog(id, payload);
      if (response.success) {
        toast.success("Blog post updated successfully!");
        navigate('/dashboard/getblog');
      } else {
        toast.error(response.message || "Error updating blog post");
      }
    } catch (error) {
      console.error("Error updating blog post:", error);
      toast.error("Error updating blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="bg-gray-50 max-w-7xl mx-auto min-h-screen py-8 text-center text-gray-500">
        Loading blog post...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-gray-50 max-w-7xl mx-auto min-h-screen py-8">
        <div className="bg-red-50 p-4 rounded-lg text-red-700">{loadError}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 max-w-7xl mx-auto min-h-screen py-8">
      <div className="mb-6  mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-display">Edit Blog Post</h1>
          <div className="flex space-x-2">
            <Link to="/dashboard/getblog" className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center">
              <ArrowLeft size={16} className="mr-1" /> Back to Posts
            </Link>
          </div>
        </div>
        <p className="mt-2 text-gray-600">
          Update this post's content and publishing settings
        </p>
      </div>
      <div className="max-w-7xl mx-auto bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter post title"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="post-url-slug"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Write your blog post content here..."
                />
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt (max 300 characters)
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="A short summary of your post for previews..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.excerpt.length}/300 characters
                </p>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3 font-display">Publishing Options</h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Clock size={16} className="text-gray-500" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                      >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Tag size={16} className="text-gray-500" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <Star size={16} className="text-yellow-500 mr-1" /> Featured Post
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>

                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  {imagePreview || existingImageUrl ? (
                    <div className="w-full relative">
                      <img
                        src={imagePreview || existingImageUrl}
                        alt="Preview"
                        className="mx-auto h-40 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setExistingImageUrl(null);
                          setFormData(prev => ({ ...prev, featured_image: null }));
                        }}
                        className="absolute top-0 right-0 bg-orange-600 text-white p-1 rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <div className="flex justify-center">
                        <Image size={36} className="text-gray-400" />
                      </div>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="featured_image" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none">
                          <span>Upload an image</span>
                          <input
                            id="featured_image"
                            name="featured_image"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              to="/dashboard/getblog"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-60"
            >
              <Save size={16} className="mr-2" /> {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
