import { useState } from 'react';
import { ArrowLeft, ArrowRight, Save, Tag, Calendar, User, Mail, Phone, Building } from 'lucide-react';

export default function ModelFormInterface() {
  const [currentModel, setCurrentModel] = useState('event-registration');
  
  // Form state for EventRegistration
  const [eventRegistration, setEventRegistration] = useState({
    event: '',
    full_name: '',
    email: '',
    phone: '',
    organization: ''
  });
  
  // Form state for BlogCategory
  const [blogCategory, setBlogCategory] = useState({
    name: '',
    slug: '',
    icon: ''
  });
  
  // Sample events for dropdown
  const events = [
    { id: 1, title: 'Annual Conference 2025' },
    { id: 2, title: 'Tech Meetup - May' },
    { id: 3, title: 'Workshop: React Fundamentals' }
  ];
  
  // Handle form change for EventRegistration
  const handleEventRegistrationChange = (e) => {
    const { name, value } = e.target;
    setEventRegistration(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form change for BlogCategory
  const handleBlogCategoryChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-generate slug when name changes
    if (name === 'name') {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      setBlogCategory(prev => ({
        ...prev,
        name: value,
        slug: slug
      }));
    } else {
      setBlogCategory(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentModel === 'event-registration') {
      console.log('Submitting Event Registration:', eventRegistration);
      // Here you would typically send this data to your API
      alert('Event Registration submitted successfully!');
      setEventRegistration({
        event: '',
        full_name: '',
        email: '',
        phone: '',
        organization: ''
      });
    } else {
      console.log('Submitting Blog Category:', blogCategory);
      // Here you would typically send this data to your API
      alert('Blog Category submitted successfully!');
      setBlogCategory({
        name: '',
        slug: '',
        icon: ''
      });
    }
  };
  
  // Switch to next model
  const handleNext = () => {
    setCurrentModel('blog-category');
  };
  
  // Switch to previous model
  const handlePrevious = () => {
    setCurrentModel('event-registration');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 sm:py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-orange-600 p-4 text-white flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <h1 className="text-lg sm:text-xl font-bold font-display">
            {currentModel === 'event-registration' ? 'Event Registration Form' : 'Blog Category Form'}
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={handlePrevious}
              disabled={currentModel === 'event-registration'}
              className={`p-1 rounded ${currentModel === 'event-registration' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-500'}`}
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentModel === 'blog-category'}
              className={`p-1 rounded ${currentModel === 'blog-category' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-500'}`}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        
        {/* Form Container */}
        <div className="p-6">
          {currentModel === 'event-registration' ? (
            /* Event Registration Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Calendar className="mr-2 h-4 w-4" /> Event
                  </label>
                  <select 
                    name="event"
                    value={eventRegistration.event}
                    onChange={handleEventRegistrationChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="">Select an event</option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <User className="mr-2 h-4 w-4" /> Full Name
                  </label>
                  <input 
                    type="text"
                    name="full_name"
                    value={eventRegistration.full_name}
                    onChange={handleEventRegistrationChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Mail className="mr-2 h-4 w-4" /> Email
                  </label>
                  <input 
                    type="email"
                    name="email"
                    value={eventRegistration.email}
                    onChange={handleEventRegistrationChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Phone className="mr-2 h-4 w-4" /> Phone (optional)
                  </label>
                  <input 
                    type="tel"
                    name="phone"
                    value={eventRegistration.phone}
                    onChange={handleEventRegistrationChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Building className="mr-2 h-4 w-4" /> Organization (optional)
                  </label>
                  <input 
                    type="text"
                    name="organization"
                    value={eventRegistration.organization}
                    onChange={handleEventRegistrationChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-4">
                <span className="text-sm text-gray-500">All fields marked with * are required</span>
                <button
                  type="submit"
                  className="w-full sm:w-auto justify-center bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                >
                  <Save className="mr-1 h-4 w-4" /> Save Registration
                </button>
              </div>
            </form>
          ) : (
            /* Blog Category Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Tag className="mr-2 h-4 w-4" /> Category Name
                  </label>
                  <input 
                    type="text"
                    name="name"
                    value={blogCategory.name}
                    onChange={handleBlogCategoryChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (auto-generated)</label>
                  <input 
                    type="text"
                    name="slug"
                    value={blogCategory.slug}
                    onChange={handleBlogCategoryChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">URL-friendly version of the name</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon (optional)</label>
                  <input 
                    type="text"
                    name="icon"
                    value={blogCategory.icon}
                    onChange={handleBlogCategoryChange}
                    placeholder="fa-tag, fa-folder, etc."
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Font Awesome icon name or other icon identifier</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-4">
                <span className="text-sm text-gray-500">All fields marked with * are required</span>
                <button
                  type="submit"
                  className="w-full sm:w-auto justify-center bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                >
                  <Save className="mr-1 h-4 w-4" /> Save Category
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* Footer Navigation */}
        <div className="bg-gray-50 px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-2 justify-between">
          <button 
            onClick={handlePrevious}
            disabled={currentModel === 'event-registration'}
            className={`py-2 px-4 rounded-md flex items-center ${
              currentModel === 'event-registration' 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Previous Form
          </button>
          
          <button 
            onClick={handleNext}
            disabled={currentModel === 'blog-category'}
            className={`py-2 px-4 rounded-md flex items-center ${
              currentModel === 'blog-category' 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next Form <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}