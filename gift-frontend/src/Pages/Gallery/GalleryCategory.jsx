import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Edit, Search, ArrowLeft, Image, Video } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createGalleryCategory, fetchGalleryCategories, updateGalleryCategory } from "../../api";

export default function GalleryCategoryManagement() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    icon: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const commonIcons = [
    { name: 'image', label: 'Image' },
    { name: 'video', label: 'Video' },
    { name: 'landscape', label: 'Landscape' },
    { name: 'portrait', label: 'Portrait' },
    { name: 'architecture', label: 'Architecture' },
    { name: 'nature', label: 'Nature' },
    { name: 'people', label: 'People' },
    { name: 'food', label: 'Food' },
    { name: 'art', label: 'Art' },
    { name: 'events', label: 'Events' },
  ];

  const fetchGalleryCategories_data = async () => {
    try {
      setLoading(true);

      const result = await fetchGalleryCategories();
      setCategories(result.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching gallery categories:", err);
      setError(err.message || "Failed to fetch categories. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryCategories_data();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingId) {
        await updateGalleryCategory(editingId, formData);

        setCategories(prev =>
          prev.map(cat => cat.id === editingId ?
            { ...cat, name: formData.name, icon: formData.icon } : cat
          )
        );
        toast.success(`Gallery category "${formData.name}" updated successfully!`);
        setEditingId(null);
      } else {
        const response = await createGalleryCategory(formData);
        const newCategory = {
          id: Math.floor(Math.random() * 1000),
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
          icon: formData.icon
        };

        toast.success(`Gallery category "${formData.name}" created successfully!`);

      }

      setFormData({ name: '', icon: '' });
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error("Error creating/updating gallery category:", err);
      setError(err.message || "Failed to save gallery category. Please try again.");
      setLoading(false);
    }
  };

  const startEditing = (category) => {
    setFormData({
      name: category.name,
      icon: category.icon
    });
    setEditingId(category.id);
    setError(null);
    setSuccess(null);
  };

  const cancelEditing = () => {
    setFormData({ name: '', icon: '' });
    setEditingId(null);
    setError(null);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        setLoading(true);
        // Replace with your actual API call
        // await deleteGalleryCategory(categoryId);

        // Simulating delete behavior
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        toast.success("Gallery category deleted successfully!");
        setLoading(false);
      } catch (err) {
        console.error("Error deleting gallery category:", err);
        toast.error(err.message || "Failed to delete gallery category");
        setLoading(false);
      }
    }
  };

  const filteredCategories = Array.isArray(categories) ? categories.filter(cat =>
    cat.name && cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const renderIconPreview = (iconName) => {
    switch (iconName) {
      case 'image': return <Image size={16} />;
      case 'video': return <Video size={16} />;
      case 'landscape': return <LandscapeIcon size={16} />;
      case 'portrait': return <PortraitIcon size={16} />;
      case 'architecture': return <ArchitectureIcon size={16} />;
      case 'nature': return <NatureIcon size={16} />;
      case 'people': return <PeopleIcon size={16} />;
      case 'food': return <FoodIcon size={16} />;
      case 'art': return <ArtIcon size={16} />;
      case 'events': return <EventsIcon size={16} />;
      default: return <div className="w-4 h-4"></div>;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="mb-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Manage Gallery Categories</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/dashboard/getGallery')}
              className="px-4 py-2 text-md rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center">
              <ArrowLeft size={16} className="mr-1" /> Back to Gallery
            </button>
          </div>
        </div>
        <p className="mt-2 text-gray-600">
          Create and manage categories for your gallery items
        </p>
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Form Section */}
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-display font-medium text-gray-800 mb-4">
                    {editingId ? 'Edit Gallery Category' : 'Add New Gallery Category'}
                  </h2>
                  {error && (
                    <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="mb-4 p-2 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
                      {success}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="e.g. Landscape Photos"
                      />
                    </div>
                    <div>
                      <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
                        Icon
                      </label>
                      <select
                        id="icon"
                        name="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Select an icon</option>
                        {commonIcons.map(icon => (
                          <option key={icon.name} value={icon.name}>
                            {icon.label}
                          </option>
                        ))}
                      </select>
                      {formData.icon && (
                        <div className="mt-2 p-2 flex items-center gap-2 bg-gray-100 rounded">
                          <span className="text-gray-700">Preview:</span>
                          {renderIconPreview(formData.icon)}
                          <span className="text-sm text-gray-600">{formData.icon}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      {editingId && (
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="inline-flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          <>
                            {editingId ? (
                              <>
                                <Save size={16} className="mr-2" /> Update Category
                              </>
                            ) : (
                              <>
                                <Plus size={16} className="mr-2" /> Add Category
                              </>
                            )}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Categories List Section */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-display font-medium text-gray-800">
                      Gallery Categories
                    </h2>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search categories..."
                        className="pl-8 pr-3 py-1 border border-gray-300 rounded-md text-sm"
                      />
                      <Search size={14} className="absolute left-2 top-2 text-gray-400" />
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                    {filteredCategories.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        {searchTerm ? 'No matching categories found' : 'No gallery categories added yet'}
                      </div>
                    ) : (
                      filteredCategories.map(category => (
                        <div key={category.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-3">
                              {renderIconPreview(category.icon)}
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-800">{category.name}</h3>
                              <p className="text-xs text-gray-500">Slug: {category.slug}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => startEditing(category)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            {/* <button
                              onClick={() => handleDelete(category.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button> */}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
                    Total: {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function LandscapeIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  );
}

function PortraitIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function ArchitectureIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
      <rect x="4" y="10" width="16" height="12" rx="2" ry="2"></rect>
      <line x1="12" y1="10" x2="12" y2="22"></line>
    </svg>
  );
}

function NatureIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
      <line x1="6" y1="1" x2="6" y2="4"></line>
      <line x1="10" y1="1" x2="10" y2="4"></line>
      <line x1="14" y1="1" x2="14" y2="4"></line>
    </svg>
  );
}

function PeopleIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

function FoodIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 1 1 0 8h-1"></path>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
      <line x1="6" y1="1" x2="6" y2="4"></line>
      <line x1="10" y1="1" x2="10" y2="4"></line>
      <line x1="14" y1="1" x2="14" y2="4"></line>
    </svg>
  );
}

function ArtIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 8L12 12"></path>
      <path d="M12 16h.01"></path>
    </svg>
  );
}

function EventsIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}