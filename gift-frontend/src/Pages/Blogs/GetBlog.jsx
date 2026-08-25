import { useState, useEffect } from 'react';
import { Calendar, Clock, Heart, Search, Tag, User, MessageCircle, Eye, ChevronLeft, ChevronRight, Filter, Plus, RefreshCw, X, ChevronDown, ChevronUp, Star, Image as ImageIcon, Trash2, Edit } from 'lucide-react';
import { fetchblogs, fetchCategory, deleteblog } from "../../api";
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function BlogManagement() {
  const [allBlogs, setAllBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sort states - Default to created_at desc
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');

  // Modal state
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Pagination constant
  const ITEMS_PER_PAGE = 6; // Set to 6 rows per page

  // Categories - normally would be fetched from API
  const categories = ['Technology', 'Marketing', 'Design', 'Business', 'Tutorials'];
  const statuses = ['published', 'draft', 'archived'];

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        // Fetch all blogs without filters
        const response = await fetchblogs();
        // Apply default sort by created_at desc
        const sortedData = [...response.data].sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setAllBlogs(sortedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs. Please try again later.");
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  useEffect(() => {
    console.log("All blogs state:", allBlogs); // Log the state before filtering
    filterBlogs();
  }, [allBlogs, searchQuery, selectedCategory, dateFilter, statusFilter, featuredFilter, sortField, sortDirection]);

  const filterBlogs = () => {
    let filtered = allBlogs;

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(blog =>
        blog.category_details?.name === selectedCategory
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(blog =>
        new Date(blog.published_date).toISOString().split('T')[0] === dateFilter
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(blog =>
        blog.status === statusFilter
      );
    }

    // Featured filter
    if (featuredFilter) {
      filtered = filtered.filter(blog =>
        blog.is_featured.toString() === featuredFilter
      );
    }

    // Enhanced Sorting with proper date handling
    filtered = filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date fields specifically
      if (sortField === 'created_at' || sortField === 'updated_at' || sortField === 'published_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);

        // Handle null/undefined dates
        if (!aValue || isNaN(aValue)) aValue = new Date(0); // Very old date
        if (!bValue || isNaN(bValue)) bValue = new Date(0);
      }

      // Handle string comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    console.log("Filtered blogs:", filtered); // Log the filtered data
    setFilteredBlogs(filtered);
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
    setFeaturedFilter('');
    setSortField('created_at'); // Reset to default sort field
    setSortDirection('desc'); // Reset to default sort direction
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

  const openViewModal = (blog) => {
    setSelectedBlog(blog);
    setShowModal(true);
  };

  const closeViewModal = () => {
    setShowModal(false);
    setSelectedBlog(null);
  };

  // NOTE: there is no edit form for blog posts wired up from this list yet
  // (AddBlog.jsx has no edit-mode/route-param support), so only Delete is added here.
  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post? This cannot be undone.')) {
      return;
    }
    try {
      const result = await deleteblog(id);
      if (result.success) {
        setAllBlogs(prev => prev.filter(blog => blog.id !== id));
        if (selectedBlog?.id === id) {
          closeViewModal();
        }
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error('Error deleting blog:', err);
      toast.error('Failed to delete blog post.');
    }
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

  // Get paginated blogs based on current page
  const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-display">Blog Management</h1>
              <p className="mt-1 text-gray-600">
                Manage your blog posts, track engagement, and optimize content strategy
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/dashboard/addblog" className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center">
                <Plus size={16} className="mr-1" /> New Post
              </Link>
              <Link to="/dashboard/addCategory" className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center">
                <Plus size={16} className="mr-1" /> Add Category
              </Link>
            </div>
          </div>
        </div>

        {/* Filters section */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search posts by title..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={featuredFilter}
                onChange={(e) => {
                  setFeaturedFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Posts</option>
                <option value="true">Featured Only</option>
                <option value="false">Non-Featured Only</option>
              </select>

              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
              Showing <span className="font-medium">{paginatedBlogs.length}</span> of <span className="font-medium">{filteredBlogs.length}</span> posts
              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                Sorted by: {sortField === 'created_at' ? 'Created Date' : sortField} ({sortDirection === 'desc' ? 'Newest First' : 'Oldest First'})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Filter size={14} className="mr-1" />
              <span>Filtered by: </span>
              {selectedCategory && (
                <span className="ml-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                  {selectedCategory}
                </span>
              )}
              {statusFilter && (
                <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </span>
              )}
              {featuredFilter && (
                <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  {featuredFilter === "true" ? "Featured" : "Non-Featured"}
                </span>
              )}
              {dateFilter && (
                <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {new Date(dateFilter).toLocaleDateString()}
                </span>
              )}
              {!selectedCategory && !statusFilter && !featuredFilter && !dateFilter && searchQuery === "" && (
                <span className="ml-1">None</span>
              )}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {paginatedBlogs.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredBlogs.length)} of{" "}
              {filteredBlogs.length} blog posts
            </span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>

        {/* Blog Post Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      <span>Title</span>
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('author')}
                  >
                    <div className="flex items-center">
                      <span>Author</span>
                      {getSortIcon('author')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center">
                      <span>Category</span>
                      {getSortIcon('category')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('published_date')}
                  >
                    <div className="flex items-center">
                      <span>Published</span>
                      {getSortIcon('published_date')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      <span>Created At</span>
                      {getSortIcon('created_at')}
                      {sortField === 'created_at' && (
                        <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1 rounded">default</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBlogs.map(blog => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {blog.featured_image ? (
                            <img
                              className="h-10 w-10 rounded object-cover"
                              src={blog.featured_image}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                              <ImageIcon size={16} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {blog.title}
                            </div>
                            {blog.is_featured && (
                              <Star size={16} className="ml-1 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {blog.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{blog.author_details?.first_name + " " + blog.author_details?.last_name || "Anonymous"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                        {blog.category_details?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${blog.status === 'published' ? 'bg-green-100 text-green-800' :
                        blog.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {blog.published_date ? new Date(blog.published_date).toLocaleDateString() : 'Not published'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {new Date(blog.created_at).toLocaleDateString()}
                        <span className="ml-2 text-xs text-gray-400">
                          {new Date(blog.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openViewModal(blog)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          <Eye size={16} />
                        </button>
                        <Link
                          to={`/dashboard/editBlog/${blog.id}`}
                          className="text-orange-600 hover:text-orange-900"
                          title="Edit blog post"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Delete blog post"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedBlogs.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No blog posts found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Enhanced Pagination */}
        <PaginationComponent />
      </div>

      {/* View Details Modal */}
      {showModal && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900 font-display">Blog Details</h3>
              <div className="flex items-center gap-3">
                <Link
                  to={`/dashboard/editBlog/${selectedBlog.id}`}
                  className="px-3 py-1.5 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1"
                >
                  <Edit size={14} /> Edit
                </Link>
                <button
                  onClick={() => handleDeleteBlog(selectedBlog.id)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1"
                >
                  <Trash2 size={14} /> Delete
                </button>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Featured Image */}
              <div className="mb-6 relative">
                {selectedBlog.featured_image ? (
                  <img
                    src={selectedBlog.featured_image}
                    alt={selectedBlog.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon size={40} className="text-gray-400" />
                  </div>
                )}
                {selectedBlog.is_featured && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star size={14} className="mr-1" /> Featured
                  </div>
                )}
              </div>

              {/* Title and Meta */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 font-display">{selectedBlog.title}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User size={16} className="mr-1" />
                    {selectedBlog.author_details?.first_name + " " + selectedBlog.author_details?.last_name || "Anonymous"}
                  </div>
                  <div className="flex items-center">
                    <Tag size={16} className="mr-1" />
                    {selectedBlog.category_details?.name || "Uncategorized"}
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    {selectedBlog.published_date ? new Date(selectedBlog.published_date).toLocaleDateString() : 'Not published'}
                  </div>
                  <div className="flex items-center">
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedBlog.status === 'published' ? 'bg-green-100 text-green-800' :
                      selectedBlog.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {selectedBlog.status.charAt(0).toUpperCase() + selectedBlog.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center text-orange-600 mb-2">
                    <Eye size={24} />
                  </div>
                  <p className="text-center text-2xl font-bold text-orange-700">{selectedBlog.view_count || 0}</p>
                  <p className="text-center text-xs text-orange-600">Views</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center text-orange-600 mb-2">
                    <Heart size={24} />
                  </div>
                  <p className="text-center text-2xl font-bold text-orange-700">{selectedBlog.like_count || 0}</p>
                  <p className="text-center text-xs text-orange-600">Likes</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center text-green-600 mb-2">
                    <MessageCircle size={24} />
                  </div>
                  <p className="text-center text-2xl font-bold text-green-700">{selectedBlog.comment_count || 0}</p>
                  <p className="text-center text-xs text-green-600">Comments</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center text-blue-600 mb-2">
                    <Calendar size={24} />
                  </div>
                  <p className="text-center text-2xl font-bold text-blue-700">
                    {Math.floor((new Date() - new Date(selectedBlog.created_at)) / (1000 * 60 * 60 * 24))}
                  </p>
                  <p className="text-center text-xs text-blue-600">Days Active</p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-2 font-display">Excerpt</h4>
                <p className="text-gray-600 mb-4 bg-gray-50 p-4 rounded-lg ">
                  {selectedBlog.excerpt || "No excerpt available."}
                </p>

                <h4 className="text-lg font-semibold text-gray-800 mb-2 font-display">Content</h4>
                <div className="prose max-w-none bg-gray-50 p-4 rounded-lg">
                  {selectedBlog.content || "No content available."}
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-2 font-display">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <div className="w-0.5 h-full bg-blue-200"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Created</p>
                      <p className="text-xs text-gray-500">{new Date(selectedBlog.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <div className="w-0.5 h-full bg-green-200"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-xs text-gray-500">{new Date(selectedBlog.updated_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedBlog.published_date && (
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Published</p>
                        <p className="text-xs text-gray-500">{new Date(selectedBlog.published_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}