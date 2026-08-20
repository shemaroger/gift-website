import { useState, useEffect } from 'react';
import { Save, Plus, Edit, Search, ArrowLeft } from 'lucide-react';
import { CreateCategortblogs, fetchCategory, updatecategory } from "../../api";
import { toast, } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

export default function CategoryCreationForm() {
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
    { name: 'computer', label: 'Computer' },
    { name: 'coffee', label: 'Coffee' },
    { name: 'heart', label: 'Heart' },
    { name: 'map', label: 'Map' },
    { name: 'book', label: 'Book' },
    { name: 'music', label: 'Music' },
    { name: 'camera', label: 'Camera' },
    { name: 'briefcase', label: 'Briefcase' },
    { name: 'shopping-bag', label: 'Shopping' },
    { name: 'dollar-sign', label: 'Finance' },
  ];

  const getCategories = async () => {
    try {
      setLoading(true);
      const result = await fetchCategory();
      if (Array.isArray(result.data) && result.data.every(cat => cat.name)) {
        setCategories(result.data);
      } else {
        setError("Fetched data is not valid");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Failed to fetch categories. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {

    getCategories();
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
        await updatecategory(editingId, formData);
        setCategories(prev =>
          prev.map(cat => cat.id === editingId ?
            { ...cat, name: formData.name, icon: formData.icon } : cat
          )
        );
        toast.success(`Category "${formData.name}" updated successfully!`);
        getCategories();
        setEditingId(null);
      } else {
        console.log("Creating category with data:", formData);
        const response = await CreateCategortblogs(formData);
        toast.success(`Category "${formData.name}" created successfully!`);
        getCategories()
        setCategories(prev => [...prev, response]);
        setFormData({ name: '', icon: '' });
      }

      setFormData({ name: '', icon: '' });
      setLoading(false);

      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error("Error creating/updating category:", err);
      setError(err.message || "Failed to save category. Please try again.");
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

  const filteredCategories = Array.isArray(categories) ? categories.filter(cat =>
    cat.name && cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const renderIconPreview = (iconName) => {
    switch (iconName) {
      case 'computer': return <ComputerIcon size={16} />;
      case 'coffee': return <CoffeeIcon size={16} />;
      case 'heart': return <HeartIcon size={16} />;
      case 'map': return <MapIcon size={16} />;
      case 'book': return <BookIcon size={16} />;
      case 'music': return <MusicIcon size={16} />;
      case 'camera': return <CameraIcon size={16} />;
      case 'briefcase': return <BriefcaseIcon size={16} />;
      case 'shopping-bag': return <ShoppingBagIcon size={16} />;
      case 'dollar-sign': return <DollarSignIcon size={16} />;
      default: return <div className="w-4 h-4"></div>;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="mb-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-display">Manage Blog Categories</h1>
          <div className="flex space-x-2">
            <Link to="/dashboard/getblog" className="px-4 py-2 text-md rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center">
              <ArrowLeft size={16} className="mr-1" /> Back Posts
            </Link>
          </div>
        </div>
        <p className="mt-2 text-gray-600">
          Manage your blog posts, track engagement
        </p>
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Form Section */}
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800 mb-4 font-display">
                    {editingId ? 'Edit Category' : 'Add New Category'}
                  </h2>
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
                        placeholder="e.g. Technology"
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
                        className="flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none"
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
                    <h2 className="text-lg font-medium text-gray-800 font-display">
                      Categories
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
                        {searchTerm ? 'No matching categories found' : 'No categories added yet'}
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
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startEditing(category)}
                              className="p-1 text-orange-600 hover:text-orange-800"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>

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
function ComputerIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  );
}

function CoffeeIcon({ size }) {
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

function HeartIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );
}

function MapIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
      <line x1="8" y1="2" x2="8" y2="18"></line>
      <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
  );
}

function BookIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  );
}

function MusicIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"></path>
      <circle cx="6" cy="18" r="3"></circle>
      <circle cx="18" cy="16" r="3"></circle>
    </svg>
  );
}

function CameraIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  );
}

function BriefcaseIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  );
}

function ShoppingBagIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  );
}

function DollarSignIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}
