import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Check, AlertCircle, Image, Film, X } from 'lucide-react';
import {
  fetchTestimonialById,
  fetchGalleryItems,
  fetchGalleryCategories,
  updateTestimonial,
} from '../../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditTestimonial() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [galleryItemId, setGalleryItemId] = useState(null);
  const [isActive, setIsActive] = useState(true);

  const [galleryItems, setGalleryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [testimonialRes, itemsRes, catsRes] = await Promise.all([
          fetchTestimonialById(id),
          fetchGalleryItems(),
          fetchGalleryCategories(),
        ]);

        if (itemsRes.success) setGalleryItems(itemsRes.data);
        setCategories(catsRes.data);

        if (testimonialRes.success) {
          const t = testimonialRes.data;
          setName(t.name || '');
          setRole(t.role || '');
          setQuote(t.quote || '');
          setSelectedCategories((t.categories || []).map((c) => c.id));
          setGalleryItemId(t.gallery_item ? t.gallery_item.id : null);
          setIsActive(t.is_active);
        } else {
          setError(testimonialRes.message);
        }
      } catch (err) {
        console.error('Error loading testimonial:', err);
        setError('Failed to load testimonial. Please refresh the page.');
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [id]);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((cid) => cid !== categoryId) : [...prev, categoryId]
    );
  };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Name is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    const payload = {
      name,
      role,
      quote,
      is_active: isActive,
      categories: selectedCategories,
      gallery_item: galleryItemId,
    };

    const result = await updateTestimonial(id, payload);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      toast.success('Testimonial updated successfully!');
      setTimeout(() => navigate('/dashboard/getTestimonials'), 1200);
    } else {
      setError(result.message);
    }
  };

  const selectedItem = galleryItems.find((item) => item.id === galleryItemId);

  if (initialLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-500">Loading testimonial...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Edit Testimonial</h1>
              <p className="mt-1 text-gray-600">Update this testimonial's details or attached media</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/getTestimonials')}
              className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center"
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Testimonials
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 p-4 rounded-lg flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <Check size={16} className="text-green-600" />
            </div>
            <p className="text-green-700 font-medium">Testimonial updated successfully!</p>
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role / Organization
                </label>
                <input
                  type="text"
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-1">
                  Quote / Story
                </label>
                <textarea
                  id="quote"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-display font-medium text-gray-900 mb-4">Photo / Video (Optional)</h2>

              {selectedItem ? (
                <div className="flex items-center gap-3 p-3 border border-green-300 bg-green-50 rounded-lg">
                  {selectedItem.media_type === 'image' ? (
                    <img
                      src={selectedItem.thumbnail_url || selectedItem.media_url}
                      alt={selectedItem.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                      <Film size={24} className="text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{selectedItem.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{selectedItem.media_type}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGalleryItemId(null)}
                    className="p-1 rounded-full hover:bg-gray-200"
                  >
                    <X size={18} className="text-gray-600" />
                  </button>
                </div>
              ) : galleryItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
                  {galleryItems.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setGalleryItemId(item.id)}
                      className="relative border border-gray-200 rounded-lg overflow-hidden hover:border-orange-400 text-left"
                    >
                      {item.media_type === 'image' ? (
                        <img
                          src={item.thumbnail_url || item.media_url}
                          alt={item.title}
                          className="w-full h-24 object-cover"
                        />
                      ) : (
                        <div className="w-full h-24 bg-black flex items-center justify-center">
                          <Film size={22} className="text-white" />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-800 truncate">{item.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg flex items-center">
                  <Image size={16} className="text-yellow-600 mr-2" />
                  <p className="text-yellow-700 text-sm">No gallery items available.</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-display font-medium text-gray-900 mb-4">Categories</h2>
              {categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`px-4 py-2 rounded-full cursor-pointer ${
                        selectedCategories.includes(category.id)
                          ? 'bg-orange-100 text-orange-800 border-2 border-orange-400'
                          : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No categories yet.</p>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-display font-medium text-gray-900 mb-4">Status</h2>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className={`px-4 py-2 rounded-md ${
                    isActive ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className={`px-4 py-2 rounded-md ${
                    !isActive ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/getTestimonials')}
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
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
