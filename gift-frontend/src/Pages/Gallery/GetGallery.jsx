import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Search, Tag, User,
  Eye, Filter, Plus, RefreshCw, Trash2,
  Edit, Settings, X, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Image, Film,
  ToggleLeft, ToggleRight, Play, Save, AlertCircle
} from 'lucide-react';

import { fetchGalleryItems, fetchGalleryCategories } from "../../api";

export default function GalleryManagement() {
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Categories
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editCategory, setEditCategory] = useState(null);

  // Sort states
  const [sortField, setSortField] = useState('uploaded_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('');

  // Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Pagination constant
  const ITEMS_PER_PAGE = 6; // Set to 4 rows per page

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch gallery items and categories
        const itemsResponse = await fetchGalleryItems();
        const categoriesResponse = await fetchGalleryCategories();
        setAllItems(itemsResponse.data);
        setCategories(categoriesResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching gallery data:", err);
        setError("Failed to load gallery items. Please try again later.");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [allItems, searchQuery, selectedCategory, dateFilter, statusFilter, mediaTypeFilter, sortField, sortDirection]);

  const filterItems = () => {
    let filtered = allItems;

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(item =>
        item.categories.some(cat => cat.id.toString() === selectedCategory)
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(item =>
        new Date(item.uploaded_at).toISOString().split('T')[0] === dateFilter
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(item =>
        item.is_active.toString() === statusFilter
      );
    }

    // Media type filter
    if (mediaTypeFilter) {
      filtered = filtered.filter(item =>
        item.media_type === mediaTypeFilter
      );
    }

    // Sorting
    filtered = filtered.sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

    setFilteredItems(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE)));

    // Ensure current page is valid
    if (currentPage > Math.ceil(filtered.length / ITEMS_PER_PAGE) && filtered.length > 0) {
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setDateFilter('');
    setStatusFilter('');
    setMediaTypeFilter('');
    setSortField('uploaded_at');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openViewModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeViewModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const confirmDelete = (id) => {
    setDeleteConfirmationId(id);
  };

  const cancelDelete = () => {
    setDeleteConfirmationId(null);
    setDeleteError(null);
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      await deleteGalleryItem(id);
      setAllItems(allItems.filter(item => item.id !== id));
      setDeleteSuccess(true);
      setDeleteConfirmationId(null);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error deleting gallery item:", err);
      setDeleteError("Failed to delete item. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openCategoryModal = (category = null) => {
    setEditCategory(category);
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditCategory(null);
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
      <div className="mt-8 flex justify-center">
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  // Get paginated items based on current page
  const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getMediaTypeIcon = (mediaType) => {
    if (mediaType === 'image') return <Image size={16} className="text-blue-500" />;
    if (mediaType === 'video') return <Film size={16} className="text-green-600" />;
    return <Image size={16} className="text-gray-500" />;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Gallery Management</h1>
              <p className="mt-1 text-gray-600">
                Manage your gallery items, organize by categories, and showcase media content
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/dashboard/addgallery')}
                className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center">
                <Plus size={16} className="mr-1" /> New Item
              </button>
              <button
                onClick={() => navigate('/dashboard/galleryCategory')}
                className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center"
              >
                <Plus size={16} className="mr-1" /> Add Category
              </button>
            </div>
          </div>
        </div>

        {/* Success message */}
        {deleteSuccess && (
          <div className="mb-6 bg-green-50 p-4 rounded-lg flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <RefreshCw size={16} className="text-green-600" />
            </div>
            <p className="text-green-700">Gallery item was successfully deleted.</p>
          </div>
        )}

        {/* Filters section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search gallery items by title..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <button
                    type="submit"
                    className="absolute right-3 top-2 text-orange-600 hover:text-orange-800"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={mediaTypeFilter}
                onChange={(e) => {
                  setMediaTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Media Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter by date"
              />

              <button
                onClick={handleReset}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                <RefreshCw size={16} className="mr-1" /> Reset
              </button>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <div>
              Showing <span className="font-medium">{paginatedItems.length}</span> of <span className="font-medium">{filteredItems.length}</span> items
            </div>
            <div className="flex items-center gap-1">
              <Filter size={14} className="mr-1" />
              <span>Filtered by: </span>
              {selectedCategory && (
                <span className="ml-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                  {categories.find(cat => cat.id.toString() === selectedCategory)?.name || 'Category'}
                </span>
              )}
              {statusFilter && (
                <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  {statusFilter === "true" ? "Active" : "Inactive"}
                </span>
              )}
              {mediaTypeFilter && (
                <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  {mediaTypeFilter.charAt(0).toUpperCase() + mediaTypeFilter.slice(1)}
                </span>
              )}
              {dateFilter && (
                <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {new Date(dateFilter).toLocaleDateString()}
                </span>
              )}
              {!selectedCategory && !statusFilter && !mediaTypeFilter && !dateFilter && searchQuery === "" && (
                <span className="ml-1">None</span>
              )}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {paginatedItems.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} of{" "}
              {filteredItems.length} gallery items
            </span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>

        {/* Gallery Items Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      <span>Media Item</span>
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hidden md:table-cell"
                    onClick={() => handleSort('media_type')}
                  >
                    <div className="flex items-center">
                      <span>Type</span>
                      {getSortIcon('media_type')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hidden md:table-cell"
                  >
                    <div className="flex items-center">
                      <span>Categories</span>
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hidden md:table-cell"
                    onClick={() => handleSort('is_active')}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {getSortIcon('is_active')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('uploaded_at')}
                  >
                    <div className="flex items-center">
                      <span>Uploaded</span>
                      {getSortIcon('uploaded_at')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-full overflow-hidden relative">
                          <img
                            className="h-10 w-10 object-cover"
                            src={item.thumbnail || item.image || "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3C/svg%3E"}
                            alt={item.title}
                          />
                          {item.media_type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                              <Play size={20} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description?.substring(0, 60) || "No description"}
                            {item.description?.length > 60 ? "..." : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center">
                        {getMediaTypeIcon(item.media_type)}
                        <span className="ml-1 text-sm text-gray-900">
                          {item.media_type.charAt(0).toUpperCase() + item.media_type.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {item.categories.map(cat => (
                          <span key={cat.id} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                            {cat.name}
                          </span>
                        ))}
                        {item.categories.length === 0 && (
                          <span className="text-sm text-gray-500">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center">
                        {item.is_active ? (
                          <>
                            <ToggleRight size={16} className="text-green-500 mr-1" />
                            <span className="text-sm text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={16} className="text-gray-500 mr-1" />
                            <span className="text-sm text-gray-600">Inactive</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {new Date(item.uploaded_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openViewModal(item)}
                          className="text-orange-600 hover:text-orange-900"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedItems.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No gallery items found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Enhanced Pagination */}
        <PaginationComponent />
      </div>

      {/* View Details Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-display font-bold text-gray-900">Media Item Details</h3>
              <button
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Media Display */}
              <div className="mb-6 flex justify-center">
                {selectedItem.media_type === 'image' ? (
                  <img
                    src={selectedItem.image || "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='800' height='500' fill='%23e5e7eb'/%3E%3C/svg%3E"}
                    alt={selectedItem.title}
                    className="max-h-96 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full max-w-2xl aspect-video bg-black rounded-lg flex items-center justify-center">
                    {selectedItem.video_url ? (
                      <iframe
                        src={selectedItem.video_url}
                        title={selectedItem.title}
                        className="w-full h-full rounded-lg"
                        frameBorder="0"
                        allowFullScreen
                      />
                    ) : (
                      <div className="text-white flex flex-col items-center">
                        <Film size={48} />
                        <p className="mt-2">Video not available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title and Meta */}
              <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">{selectedItem.title}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User size={16} className="mr-1" />
                    {selectedItem.uploaded_by?.username || "Unknown"}
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    {new Date(selectedItem.uploaded_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    {selectedItem.is_active ? (
                      <>
                        <ToggleRight size={16} className="text-green-500 mr-1" />
                        <span className="text-green-600">Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={16} className="text-gray-500 mr-1" />
                        <span className="text-gray-600">Inactive</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center">
                    {getMediaTypeIcon(selectedItem.media_type)}
                    <span className="ml-1">
                      {selectedItem.media_type.charAt(0).toUpperCase() + selectedItem.media_type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-lg font-display font-medium text-gray-900 mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.categories && selectedItem.categories.length > 0 ? (
                    selectedItem.categories.map(cat => (
                      <span
                        key={cat.id}
                        className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full flex items-center"
                      >
                        <Tag size={14} className="mr-1" />
                        {cat.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No categories assigned</span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-display font-medium text-gray-900 mb-2">Description</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {selectedItem.description ? (
                    <p className="text-gray-700 whitespace-pre-line">{selectedItem.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">No description provided</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-display font-medium text-gray-900 mb-2">File Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Media Type:</p>
                        <p className="font-medium">
                          {selectedItem.media_type.charAt(0).toUpperCase() + selectedItem.media_type.slice(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">File Size:</p>
                        <p className="font-medium">
                          {selectedItem.file_size ? `${(selectedItem.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Dimensions:</p>
                        <p className="font-medium">
                          {selectedItem.dimensions || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Format:</p>
                        <p className="font-medium">
                          {selectedItem.format || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-display font-medium text-gray-900 mb-2">Metadata</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Created:</p>
                        <p className="font-medium">
                          {new Date(selectedItem.uploaded_at).toLocaleDateString()} at {new Date(selectedItem.uploaded_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Updated:</p>
                        <p className="font-medium">
                          {new Date(selectedItem.updated_at).toLocaleDateString()} at {new Date(selectedItem.updated_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status:</p>
                        <p className={`font-medium ${selectedItem.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                          {selectedItem.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ID:</p>
                        <p className="font-medium">
                          {selectedItem.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t">
              <button
                onClick={closeViewModal}
                className="px-4 py-2 text-sm rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-gray-200 w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-display font-bold text-gray-900">
                {editCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={closeCategoryModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter category name"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="enter-slug"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Used in URLs. Only lowercase letters, numbers, and hyphens.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon (Optional)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Icon name (e.g. 'image', 'camera', 'film')"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter a Lucide icon name to use for this category.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={closeCategoryModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
                >
                  <Save size={16} className="mr-1" />
                  {editCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>

              {!editCategory && (
                <>
                  <hr className="my-6" />

                  <h3 className="text-lg font-display font-medium text-gray-900 mb-4">Manage Existing Categories</h3>

                  <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {categories.length > 0 ? (
                        categories.map(cat => (
                          <li key={cat.id} className="p-4 hover:bg-gray-100 flex items-center justify-between">
                            <div className="flex items-center">
                              {cat.icon && (
                                <span className="mr-2 text-orange-600">
                                  <Tag size={16} />
                                </span>
                              )}
                              <span className="font-medium">{cat.name}</span>
                              <span className="ml-2 text-gray-500 text-sm">({cat.slug})</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditCategory(cat);
                                }}
                                className="p-1 text-blue-600 hover:text-blue-800"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="p-1 text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="p-4 text-gray-500 text-center">No categories found</li>
                      )}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}