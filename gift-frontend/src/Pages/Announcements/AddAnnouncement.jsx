import { useState, useEffect } from 'react';
import { Save, Plus, Edit, Search, Bell, AlertCircle, Calendar, Eye, EyeOff, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { createAnnouncement, fetchAnnouncements, UpdateAnnouncement } from "../../api";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AnnouncementManagementForm() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    is_active: true,
    show_until: ''
  });
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 4; // Set to 6 rows per page

  const getAnnouncements = async () => {
    try {
      setLoading(true);
      const result = await fetchAnnouncements();
      if (Array.isArray(result.data)) {
        setAnnouncements(result.data);
      } else {
        setError("Fetched data is not valid");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError(err.message || "Failed to fetch announcements. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    getAnnouncements();
  }, []);

  // Filter and paginate announcements
  useEffect(() => {
    let filtered = Array.isArray(announcements) ? announcements.filter(announcement =>
      announcement.title &&
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!showActiveOnly || announcement.is_active)
    ) : [];

    setFilteredAnnouncements(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE)));

    // Ensure current page is valid
    if (currentPage > Math.ceil(filtered.length / ITEMS_PER_PAGE) && filtered.length > 0) {
      setCurrentPage(1);
    }
  }, [announcements, searchTerm, showActiveOnly, currentPage]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().substring(0, 16);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError("Announcement title is required");
      return;
    }

    if (!formData.message.trim()) {
      setError("Announcement message is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingId) {
        setAnnouncements(prev =>
          prev.map(announcement => announcement.id === editingId ?
            { ...announcement, ...formData } : announcement
          )
        );
        const response = await UpdateAnnouncement(editingId, formData);
        toast.success(`Announcement "${formData.title}" updated successfully!`);
        getAnnouncements();
        setEditingId(null);
      } else {
        console.log(formData);
        const response = await createAnnouncement(formData);
        toast.success(`Announcement "${formData.title}" created successfully!`);
        getAnnouncements();
        setAnnouncements(prev => [...prev, response]);
      }

      setFormData({
        title: '',
        message: '',
        is_active: true,
        show_until: ''
      });
      setLoading(false);
      setShowForm(false);

      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error("Error creating/updating announcement:", err);
      setError(err.message || "Failed to save announcement. Please try again.");
      setLoading(false);
    }
  };

  const startEditing = (announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      is_active: announcement.is_active,
      show_until: formatDateForInput(announcement.show_until)
    });
    setEditingId(announcement.id);
    setError(null);
    setSuccess(null);
    setShowForm(true);
  };

  const cancelEditing = () => {
    setFormData({
      title: '',
      message: '',
      is_active: true,
      show_until: ''
    });
    setEditingId(null);
    setError(null);
    setShowForm(false);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleActiveFilterChange = (e) => {
    setShowActiveOnly(e.target.checked);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Enhanced Pagination Component
  const PaginationComponent = () => {
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="mt-6 flex justify-center">
        <nav className="flex items-center space-x-1">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === 1
              ? "text-gray-400 cursor-not-allowed bg-gray-100"
              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-orange-300"
              }`}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>

          {/* Page Numbers */}
          <div className="hidden sm:flex space-x-1">
            {getVisiblePages().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`dots-${index}`}
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${currentPage === page
                    ? "bg-orange-600 text-white border border-orange-600 transform scale-105"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600"
                    }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Mobile: Show current page info */}
          <div className="sm:hidden">
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">
              {currentPage} of {totalPages}
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed bg-gray-100"
              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-orange-300"
              }`}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </nav>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiration';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  // Get paginated announcements based on current page
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="mb-6 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-display">Manage Announcements</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-md rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center"
            >
              <Plus size={16} className="mr-1" /> Add Announcement
            </button>
          </div>
        </div>
        <p className="mt-2 text-gray-600">
          Create and manage announcements for your site visitors
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="rounded-lg overflow-hidden">
          <div className="p-6">
            {/* Form overlay when active */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg border border-gray-200 max-w-lg w-full p-6 relative">
                  <button
                    onClick={() => setShowForm(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    title="Close form"
                  >
                    <X size={20} />
                  </button>
                  <h2 className="text-xl font-medium text-gray-800 mb-4 font-display">
                    {editingId ? 'Edit Announcement' : 'Add New Announcement'}
                  </h2>
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      <div className="flex items-center">
                        <AlertCircle size={16} className="mr-2" />
                        <span>{error}</span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="e.g. Site Maintenance"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter announcement message"
                      />
                    </div>
                    <div className="flex flex-col space-y-4">
                      <div>
                        <label htmlFor="show_until" className="block text-sm font-medium text-gray-700 mb-1">
                          Show Until (Optional)
                        </label>
                        <div className="relative">
                          <input
                            type="datetime-local"
                            id="show_until"
                            name="show_until"
                            value={formData.show_until}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Leave blank for no expiration date</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_active"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                          Active
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
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
                                <Save size={16} className="mr-2" /> Update Announcement
                              </>
                            ) : (
                              <>
                                <Plus size={16} className="mr-2" /> Add Announcement
                              </>
                            )}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Announcements List */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-800 flex items-center font-display">
                  <Bell size={18} className="mr-2 text-orange-600" /> Announcements
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showActiveOnly"
                      checked={showActiveOnly}
                      onChange={handleActiveFilterChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showActiveOnly" className="text-sm text-gray-600">
                      Active only
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Search announcements..."
                      className="pl-8 pr-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                    <Search size={14} className="absolute left-2 top-2 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>
                    Showing {paginatedAnnouncements.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} to{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredAnnouncements.length)} of{" "}
                    {filteredAnnouncements.length} announcements
                  </span>
                  <span>Page {currentPage} of {totalPages}</span>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading announcements...</p>
                  </div>
                ) : paginatedAnnouncements.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    {searchTerm || showActiveOnly ? 'No matching announcements found' : 'No announcements added yet'}
                  </div>
                ) : (
                  paginatedAnnouncements.map(announcement => (
                    <div key={announcement.id} className={`p-4 hover:bg-gray-50 ${!announcement.is_active ? 'bg-gray-50' : ''}`}>
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h3 className="text-md font-medium text-gray-800 mr-2">{announcement.title}</h3>
                            {announcement.is_active ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center">
                                <Eye size={12} className="mr-1" /> Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 flex items-center">
                                <EyeOff size={12} className="mr-1" /> Inactive
                              </span>
                            )}
                            {announcement.show_until && isExpired(announcement.show_until) && (
                              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                Expired
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{announcement.message}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <div className="flex items-center mr-4">
                              <Clock size={12} className="mr-1" />
                              Created: {formatDate(announcement.created_at)}
                            </div>
                            {announcement.show_until && (
                              <div className="flex items-center">
                                <Calendar size={12} className="mr-1" />
                                Expires: {formatDate(announcement.show_until)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start space-x-2 ml-4">
                          <button
                            onClick={() => startEditing(announcement)}
                            className="p-1 text-orange-600 hover:text-orange-800"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer with pagination info */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
                Total: {filteredAnnouncements.length} {filteredAnnouncements.length === 1 ? 'announcement' : 'announcements'}
              </div>
            </div>

            {/* Enhanced Pagination */}
            <PaginationComponent />
          </div>
        </div>
      </div>
    </div>
  );
}