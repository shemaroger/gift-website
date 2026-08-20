import { useState } from 'react';
import { Calendar, Clock, MapPin, Image, Plus, Save, Users, Tag, Gift, Bell, Flag, Info, ArrowLeft, X } from 'lucide-react';
import { createEvent } from "../../api";
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EventForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'offline',
    location: '',
    online_link: '',
    start_date: '',
    end_date: '',
    image: null,
    banner: null,
    is_public: true,
    is_active: true
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const EVENT_TYPE_CHOICES = [
    { value: 'offline', label: 'In-Person Event' },
    { value: 'online', label: 'Online Event' },
    { value: 'hybrid', label: 'Hybrid Event' }
  ];

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
      console.log('Image file selected:', file);
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange1 = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Image file selected:', file);
      setFormData(prev => ({ ...prev, banner: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("The data", formData);
      const result = await createEvent(formData);

      if (result.success) {
        toast.success('Event created successfully!');
      } else {
        toast.error(`Error creating event: ${result.message}`);
      }
    } catch (error) {
      console.error('Unexpected error during event creation:', error);
      toast.error('An unexpected error occurred while creating the event.');
    }
  };

  return (
    <div className="bg-gray-50 max-w-7xl mx-auto min-h-screen py-8">
      <div className="mb-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-display">Manage Events</h1>
          <div className="flex space-x-2">
            <Link to='/dashboard/getevent'
              className="px-4 py-2 text-md rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center"
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Events
            </Link>
          </div>
        </div>
        <p className="mt-2 text-gray-600">
          Create and manage announcements for your site visitors
        </p>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-xl p-6 max-w-6xl mx-auto border border-gray-100">
          <div className="mb-8 border-b pb-4">
            <h1 className="text-3xl font-bold font-display text-gray-800">Create New Event</h1>
            <p className="text-gray-500 mt-2">Fill in the details below to set up your event</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center mb-6">
                <Info className="text-blue-600 mr-3 h-5 w-5" />
                <h2 className="text-xl font-semibold font-display text-gray-800">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter event title"
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your event"
                  />
                </div>

                <div>
                  <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    id="event_type"
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {EVENT_TYPE_CHOICES.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <div className="flex items-center mb-6">
                <MapPin className="text-green-600 mr-3 h-5 w-5" />
                <h2 className="text-xl font-semibold font-display text-gray-800">Location Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.event_type !== 'online' && (
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="inline-block mr-2 w-4 h-4" />
                      Physical Location
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter venue address"
                    />
                  </div>
                )}

                {formData.event_type !== 'offline' && (
                  <div>
                    <label htmlFor="online_link" className="block text-sm font-medium text-gray-700 mb-1">
                      <Link className="inline-block mr-2 w-4 h-4" />
                      Meeting Link
                    </label>
                    <input
                      id="online_link"
                      name="online_link"
                      type="url"
                      value={formData.online_link}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="https://meeting-link.com"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
              <div className="flex items-center mb-6">
                <Calendar className="text-orange-600 mr-3 h-5 w-5" />
                <h2 className="text-xl font-semibold font-display text-gray-800">Date and Time</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="inline-block mr-2 w-4 h-4" />
                    Start Date and Time
                  </label>
                  <input
                    id="start_date"
                    name="start_date"
                    type="datetime-local"
                    required
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="inline-block mr-2 w-4 h-4" />
                    End Date and Time
                  </label>
                  <input
                    id="end_date"
                    name="end_date"
                    type="datetime-local"
                    required
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
              <div className="flex items-center mb-6">
                <Image className="text-amber-600 mr-3 h-5 w-5" />
                <h2 className="text-xl font-semibold font-display text-gray-800">Media</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="banner" className="block text-sm font-medium text-gray-700 mb-2">
                    <Image className="inline-block mr-2 w-4 h-4" />
                    Event Banner
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {bannerPreview ? (
                      <div className="w-full relative">
                        <img
                          src={bannerPreview}
                          alt="Banner Preview"
                          className="mx-auto h-40 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setBannerPreview(null);
                            setFormData(prev => ({ ...prev, banner: null }));
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
                          <label htmlFor="banner" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none">
                            <span>Upload an image</span>
                            <input
                              id="banner"
                              name="banner"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => handleImageChange1(e)}
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

                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                    <Image className="inline-block mr-2 w-4 h-4" />
                    Event Thumbnail
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {imagePreview ? (
                      <div className="w-full relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto h-40 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, image: null }));
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
                          <label htmlFor="image" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none">
                            <span>Upload an image</span>
                            <input
                              id="image"
                              name="image"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => handleImageChange(e)}
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

            {/* Settings */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center mb-6">
                <Flag className="text-gray-600 mr-3 h-5 w-5" />
                <h2 className="text-xl font-semibold font-display text-gray-800">Event Settings</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    id="is_public"
                    name="is_public"
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_public" className="ml-3 block text-sm text-gray-700 font-medium">
                    Public Event (visible to everyone)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-3 block text-sm text-gray-700 font-medium">
                    Active Event
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
              >
                <Save className="h-5 w-5 mr-2" />
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
