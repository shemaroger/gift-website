import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAds, deleteAds } from "../../api";
import { EyeIcon, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GetAds = () => {
  // State for ads data
  const [allAds, setAllAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State for filters
  const [filters, setFilters] = useState({
    status: '',
    searchTerm: '',
    dateRange: {
      startDate: '',
      endDate: ''
    }
  });

  // State for modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    const fetchAdData = async () => {
      try {
        setLoading(true);
        // Fetch all ads without filters
        const response = await fetchAds();
        const sortedData = [...response.data.results].sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });


        setAllAds(sortedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching ads:', err);
        setError('Failed to load advertisements');
        setLoading(false);
      }
    };

    fetchAdData();
  }, []);

  useEffect(() => {
    filterAds();
  }, [filters, allAds]);

  const filterAds = () => {
    let results = allAds;

    // Search term filter
    if (filters.searchTerm) {
      results = results.filter(ad =>
        ad.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        ad.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      const today = new Date().toISOString().split('T')[0];
      results = results.filter(ad => {
        if (filters.status === 'active' && ad.is_active && ad.start_date <= today && ad.end_date >= today) {
          return true;
        }
        if (filters.status === 'inactive' && !ad.is_active) {
          return true;
        }
        if (filters.status === 'scheduled' && ad.is_active && ad.start_date > today) {
          return true;
        }
        if (filters.status === 'expired' && ad.is_active && ad.end_date < today) {
          return true;
        }
        return false;
      });
    }

    // Date range filter
    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      results = results.filter(ad =>
        ad.start_date >= filters.dateRange.startDate && ad.end_date <= filters.dateRange.endDate
      );
    }

    setFilteredAds(results);
    setTotalPages(Math.ceil(results.length / pageSize));
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFilters(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      searchTerm: '',
      dateRange: {
        startDate: '',
        endDate: ''
      }
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openAdDetails = (ad) => {
    setSelectedAd(ad);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAd(null);
  };

  const handleDeleteAd = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ad? This cannot be undone.')) {
      return;
    }
    try {
      const result = await deleteAds(id);
      if (result.success) {
        setAllAds(prev => prev.filter(ad => ad.id !== id));
        if (selectedAd?.id === id) {
          closeModal();
        }
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error('Error deleting ad:', err);
      toast.error('Failed to delete advertisement.');
    }
  };

  const getStatusBadge = (ad) => {
    const today = new Date();
    const startDate = new Date(ad.start_date);
    const endDate = new Date(ad.end_date);

    if (!ad.is_active) {
      return { color: 'bg-gray-100 text-gray-800', text: 'Inactive' };
    } else if (today < startDate) {
      return { color: 'bg-yellow-100 text-yellow-800', text: 'Scheduled' };
    } else if (today > endDate) {
      return { color: 'bg-red-100 text-red-800', text: 'Expired' };
    } else {
      return { color: 'bg-green-100 text-green-800', text: 'Active' };
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateCTR = (views, clicks) => {
    if (views === 0) return '0.00%';
    return ((clicks / views) * 100).toFixed(2) + '%';
  };

  const paginatedAds = filteredAds.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading && allAds.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="mb-6 max-w-8xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-display">Advertisement Management</h1>
          <div className="flex space-x-2">
            <Link to="/dashboard/AddAds" className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white">
              + New Ad
            </Link>
          </div>
        </div>
        <p className="mt-2 text-gray-600">
          Manage your advertising campaigns and track performance
        </p>
      </div>

      {/* Filter section */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="searchTerm"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleFilterChange}
              placeholder="Search title or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
            />
          </div>

          {/* Status filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Date filters */}
          <div>
            <label htmlFor="dateRange.startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              id="dateRange.startDate"
              name="dateRange.startDate"
              value={filters.dateRange.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
            />
          </div>

          <div>
            <label htmlFor="dateRange.endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              id="dateRange.endDate"
              name="dateRange.endDate"
              value={filters.dateRange.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
            />
          </div>
        </div>

        {/* Filter actions */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Error handling */}
      {error && (
        <div className="text-center p-4 mb-6 text-red-600 bg-red-50 rounded-lg max-w-7xl mx-auto">
          {error}
        </div>
      )}

      {/* Content section */}
      {filteredAds.length === 0 ? (
        <div className="bg-white rounded-lg shadow max-w-7xl mx-auto p-8 text-center text-gray-500">
          No advertisements found
        </div>
      ) : (
        <div className="overflow-x-auto max-w-7xl mx-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAds.map((ad, index) => {
                const statusBadge = getStatusBadge(ad);

                return (
                  <tr key={ad.id} className='hover:bg-gray-200'>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {ad.image ? (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <img
                              src={ad.image}
                              alt={ad.title}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md mr-3 flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {ad.description ? (
                              ad.description.length > 60 ?
                                `${ad.description.substring(0, 60)}...` :
                                ad.description
                            ) : (
                              <span className="italic text-gray-400">No description</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.color}`}>
                        {statusBadge.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(ad.start_date)} - {formatDate(ad.end_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">{ad.views}</span> views
                      </div>
                      <div className="text-sm">
                        <span className="text-blue-600 font-medium">{ad.clicks}</span> clicks
                      </div>
                      {ad.views > 0 ? (
                        <div className="text-xs text-gray-500">
                          CTR: {calculateCTR(ad.views, ad.clicks)}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openAdDetails(ad)}
                        className="text-orange-600 hover:text-orange-900 mr-4"
                        title="View details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <Link
                        to={`/dashboard/editAds/${ad.id}`}
                        className="text-orange-600 hover:text-orange-900 mr-4"
                        title="Edit ad"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="text-orange-600 hover:text-orange-900"
                        title="Delete ad"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Next
              </button>
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(currentPage * pageSize, filteredAds.length)}</span> of{" "}
                  <span className="font-medium">{filteredAds.length}</span> results
                </p>
              </div>

              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <span className="sr-only">First</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;

                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border ${currentPage === pageNumber
                          ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } text-sm font-medium`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <span className="sr-only">Last</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>

            {/* Page size selector */}
            <div className="hidden sm:block ml-4">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Ad Detail Modal */}
      {modalOpen && selectedAd && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden border border-gray-200 transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              {/* Modal header */}
              <div className="bg-orange-600 px-4 py-3 sm:px-6 flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-white font-display" id="modal-title">
                  Ad Details
                </h3>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal content */}
              <div className="bg-white px-4 pt-5 pb-6 sm:p-6 sm:pb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left column - Image and basic info */}
                  <div className="md:col-span-1">
                    <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden mb-4">
                      {selectedAd.image ? (
                        <img
                          src={selectedAd.image}
                          alt={selectedAd.title}
                          className="w-full h-full object-center object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg className="h-16 w-16 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-500">Status</h4>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(selectedAd).color}`}>
                          {getStatusBadge(selectedAd).text}
                        </span>
                      </div>

                      <div className="mb-2">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Active Period</h4>
                        <p className="text-sm text-gray-900">
                          {formatDate(selectedAd.start_date)} - {formatDate(selectedAd.end_date)}
                        </p>
                      </div>

                      <div className="mb-2">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Created</h4>
                        <p className="text-sm text-gray-900">
                          {formatDate(selectedAd.created_at)}
                        </p>
                      </div>

                      <div className="mb-2">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h4>
                        <p className="text-sm text-gray-900">
                          {formatDate(selectedAd.updated_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Center and right columns */}
                  <div className="md:col-span-2">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2 font-display">{selectedAd.title}</h2>
                      {selectedAd.description && (
                        <p className="text-gray-600 text-sm mb-4">{selectedAd.description}</p>
                      )}
                    </div>

                    {/* Performance stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedAd.views}</div>
                        <div className="text-sm text-gray-500">Views</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedAd.clicks}</div>
                        <div className="text-sm text-gray-500">Clicks</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">{calculateCTR(selectedAd.views, selectedAd.clicks)}</div>
                        <div className="text-sm text-gray-500">CTR</div>
                      </div>
                    </div>

                    {/* Content */}
                    {selectedAd.content && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-display">Ad Content</h3>
                        <div className="bg-gray-50 p-4 rounded-lg text-sm">
                          <div className="prose max-w-none">
                            {selectedAd.content}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Target URL */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 font-display">Target URL</h3>
                      <div className="flex items-center">
                        <a
                          href={selectedAd.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:text-orange-800 truncate flex-1"
                        >
                          {selectedAd.target_url}
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedAd.target_url);
                            // Could add toast notification here
                          }}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                          title="Copy URL"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Link
                  to={`/dashboard/editAds/${selectedAd.id}`}
                  className="w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Edit Ad
                </Link>
                <button
                  type="button"
                  onClick={() => handleDeleteAd(selectedAd.id)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete Ad
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetAds;
