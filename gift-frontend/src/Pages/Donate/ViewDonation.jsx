import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Download, DollarSign, Calendar, User, X, Edit, CheckCircle, Phone, Mail, MessageSquare, Trash2 } from 'lucide-react';
import { fetchDonations, updateDonationStatus, deleteDonation } from '../../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EnhancedDonationView = () => {
    // State management
    const [donations, setDonations] = useState([]);
    const [filteredDonations, setFilteredDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [donationsPerPage, setDonationsPerPage] = useState(5);

    // Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        const fetchDonationData = async () => {
            try {
                const response = await fetchDonations();

                const sortedData = [...response.data].sort((a, b) => {
                    return new Date(b.created_at) - new Date(a.created_at);
                });
                setDonations(sortedData);
                setFilteredDonations(sortedData);
            } catch (err) {
                console.error('Error fetching donations:', err);
                setError('Failed to load donations');
            } finally {
                setLoading(false);
            }
        };

        fetchDonationData();
    }, []);

    useEffect(() => {
        let result = donations;

        // Apply search filter
        if (searchTerm) {
            result = result.filter(donation =>
                donation.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                donation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (donation.organization && donation.organization.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply type filter
        if (typeFilter !== 'all') {
            result = result.filter(donation => donation.donation_type === typeFilter);
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter(donation => donation.status === statusFilter);
        }

        setFilteredDonations(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, typeFilter, statusFilter, donations]);

    // Calculate pagination
    const indexOfLastDonation = currentPage * donationsPerPage;
    const indexOfFirstDonation = indexOfLastDonation - donationsPerPage;
    const currentDonations = filteredDonations.slice(indexOfFirstDonation, indexOfLastDonation);
    const totalPages = Math.ceil(filteredDonations.length / donationsPerPage);

    // Pagination navigation functions
    const goToPage = (pageNumber) => {
        setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
    };

    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

    // Modal handlers
    const openViewModal = (donation) => {
        setSelectedDonation(donation);
        setViewModalOpen(true);
    };

    const openStatusModal = (donation) => {
        setSelectedDonation(donation);
        setStatusModalOpen(true);
    };

    const closeModals = () => {
        setViewModalOpen(false);
        setStatusModalOpen(false);
        setSelectedDonation(null);
    };

    // Update donation status
    const handleStatusUpdate = async (newStatus) => {
        if (!selectedDonation) return;

        setUpdatingStatus(true);
        try {
            await updateDonationStatus(selectedDonation.id, { status: newStatus });

            // Update local state
            const updatedDonations = donations.map(donation =>
                donation.id === selectedDonation.id
                    ? { ...donation, status: newStatus }
                    : donation
            );
            setDonations(updatedDonations);

            toast.success('Donation status updated successfully!');
            closeModals();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update donation status.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Delete a donation
    const handleDeleteDonation = async (id) => {
        if (!window.confirm('Are you sure you want to delete this donation record? This cannot be undone.')) {
            return;
        }
        try {
            const result = await deleteDonation(id);
            if (result.success) {
                setDonations(prev => prev.filter(donation => donation.id !== id));
                toast.success(result.message);
                closeModals();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error deleting donation:', error);
            toast.error('Failed to delete donation.');
        }
    };

    // Export donations to CSV
    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'Organization', 'Type', 'Amount', 'Message', 'Contact Method', 'Created At'];

        const csvData = filteredDonations.map(donation => [
            donation.full_name,
            donation.email,
            donation.organization || 'N/A',
            donation.donation_type,
            donation.estimated_amount || 'N/A',
            donation.message, // Replace commas to avoid CSV issues
            donation.preferred_contact_method,
            new Date(donation.submitted_at).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'donations.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Get donation type display name
    const getDonationTypeDisplay = (type) => {
        const types = {
            'one_time': 'One-time',
            'monthly': 'Monthly',
            'yearly': 'Yearly',
            'project_based': 'Project-based',
            'general': 'General Support'
        };
        return types[type] || type;
    };

    // Get contact method display
    const getContactMethodDisplay = (method) => {
        const methods = {
            'email': 'Email',
            'phone': 'Phone',
            'both': 'Both'
        };
        return methods[method] || method;
    };

    // Get status display and color
    const getStatusDisplay = (status) => {
        const statuses = {
            'new': { label: 'New', color: 'bg-blue-100 text-blue-800' },
            'contacted': { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
            'committed': { label: 'Committed', color: 'bg-orange-100 text-orange-800' },
            'donated': { label: 'Donated', color: 'bg-green-100 text-green-800' },
            'declined': { label: 'Declined', color: 'bg-red-100 text-red-800' }
        };
        return statuses[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    };

    // Get valid transitions for current status
    const getValidTransitions = (currentStatus) => {
        const validTransitions = {
            'new': ['contacted', 'declined'],
            'contacted': ['committed', 'declined'],
            'committed': ['donated', 'declined'],
            'donated': [],  // Final state
            'declined': ['new', 'contacted']  // Can restart process
        };
        return validTransitions[currentStatus] || [];
    };

    // Get status button styling
    const getStatusButtonStyle = (status, currentStatus, isSelected) => {
        const statusColors = {
            'new': 'border-blue-200 hover:bg-blue-50 text-blue-700',
            'contacted': 'border-yellow-200 hover:bg-yellow-50 text-yellow-700',
            'committed': 'border-orange-200 hover:bg-orange-50 text-orange-700',
            'donated': 'border-green-200 hover:bg-green-50 text-green-700',
            'declined': 'border-red-200 hover:bg-red-50 text-red-700'
        };

        if (isSelected) {
            return 'bg-gray-100 text-gray-400 cursor-not-allowed';
        }
        if (updatingStatus) {
            return 'bg-gray-100 text-gray-400 cursor-not-allowed';
        }
        return statusColors[status] || 'border-gray-200 hover:bg-gray-50 text-gray-700';
    };

    // Get status icon color
    const getStatusIconColor = (status) => {
        const colors = {
            'new': 'bg-blue-500',
            'contacted': 'bg-yellow-500',
            'committed': 'bg-orange-500',
            'donated': 'bg-green-500',
            'declined': 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    if (loading) return (
        <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        <h1 className="text-2xl font-bold font-display">
                            Donation Management
                        </h1>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={exportToCSV}
                            className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
                        >
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
                </div>
                <p className="mt-2 text-gray-600">
                    Manage and view donation interests from potential donors
                </p>
            </div>

            {/* Filters Section */}
            <div className="mb-6 max-w-7xl mx-auto bg-white rounded-lg shadow p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, email, or organization"
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex items-center">
                            <Filter size={18} className="absolute left-3 text-gray-400" />
                            <select
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="one_time">One-time</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="project_based">Project-based</option>
                                <option value="general">General Support</option>
                            </select>
                        </div>

                        <div className="relative flex items-center">
                            <Filter size={18} className="absolute left-3 text-gray-400" />
                            <select
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="committed">Committed</option>
                                <option value="donated">Donated</option>
                                <option value="declined">Declined</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={donationsPerPage}
                                onChange={(e) => setDonationsPerPage(Number(e.target.value))}
                            >
                                <option value="5">5 per page</option>
                                <option value="7">7 per page</option>
                                <option value="10">10 per page</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {filteredDonations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow max-w-7xl mx-auto">
                    No donation interests found matching your filters
                </div>
            ) : (
                <div className="max-w-7xl mx-auto">
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Donor Info
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type & Amount
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentDonations.map((donation, index) => (
                                    <tr key={donation.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{indexOfFirstDonation + index + 1}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-green-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{donation.full_name}</div>
                                                    <div className="text-sm text-gray-500 flex items-center">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        {donation.email}
                                                    </div>
                                                    {donation.organization && (
                                                        <div className="text-xs text-gray-400">{donation.organization}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {getDonationTypeDisplay(donation.donation_type)}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {donation.estimated_amount || 'Amount not specified'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{getContactMethodDisplay(donation.preferred_contact_method)}</div>
                                            {donation.phone && (
                                                <div className="text-sm text-gray-500 flex items-center">
                                                    <Phone className="w-3 h-3 mr-1" />
                                                    {donation.phone}
                                                </div>
                                            )}
                                            {donation.best_contact_time && (
                                                <div className="text-xs text-gray-400">{donation.best_contact_time}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusDisplay(donation.status).color}`}>
                                                {getStatusDisplay(donation.status).label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {new Date(donation.submitted_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center justify-center space-x-2">
                                            <button
                                                onClick={() => openViewModal(donation)}
                                                className="text-green-600 hover:text-green-900 flex justify-center items-center"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => openStatusModal(donation)}
                                                className="text-blue-600 hover:text-blue-900 flex justify-center items-center"
                                                title="Update Status"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDonation(donation.id)}
                                                className="text-orange-600 hover:text-orange-900 flex justify-center items-center"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-b-lg border-t border-gray-200 shadow">
                        <div className="flex items-center text-sm text-gray-700">
                            Showing <span className="font-medium mx-1">{indexOfFirstDonation + 1}</span> to <span className="font-medium mx-1">
                                {Math.min(indexOfLastDonation, filteredDonations.length)}
                            </span> of <span className="font-medium mx-1">{filteredDonations.length}</span> donations
                        </div>

                        <div className="flex items-center space-x-1">
                            <button
                                onClick={goToFirstPage}
                                disabled={currentPage === 1}
                                className={`inline-flex items-center px-2 py-2 rounded-md text-sm font-medium ${currentPage === 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <ChevronsLeft size={16} />
                            </button>
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className={`inline-flex items-center px-2 py-2 rounded-md text-sm font-medium ${currentPage === 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* Page number buttons */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => goToPage(pageNum)}
                                        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${currentPage === pageNum
                                            ? 'bg-orange-50 text-orange-600 border border-orange-500'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className={`inline-flex items-center px-2 py-2 rounded-md text-sm font-medium ${currentPage === totalPages
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                onClick={goToLastPage}
                                disabled={currentPage === totalPages}
                                className={`inline-flex items-center px-2 py-2 rounded-md text-sm font-medium ${currentPage === totalPages
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {viewModalOpen && selectedDonation && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={closeModals} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg border border-gray-200">
                        <div className="max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold font-display text-gray-900">Donation Details</h2>
                                    <button
                                        onClick={closeModals}
                                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Donor Information */}
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold font-display mb-3 text-gray-900 flex items-center">
                                            <User className="w-5 h-5 mr-2 text-green-600" />
                                            Donor Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                <p className="text-gray-900">{selectedDonation.full_name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <p className="text-gray-900">{selectedDonation.email}</p>
                                            </div>
                                            {selectedDonation.phone && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                    <p className="text-gray-900">{selectedDonation.phone}</p>
                                                </div>
                                            )}
                                            {selectedDonation.organization && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                                                    <p className="text-gray-900">{selectedDonation.organization}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Donation Details */}
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold font-display mb-3 text-gray-900 flex items-center">
                                            <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                                            Donation Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Donation Type</label>
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {getDonationTypeDisplay(selectedDonation.donation_type)}
                                                </span>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Amount</label>
                                                <p className="text-gray-900">{selectedDonation.estimated_amount || 'Not specified'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Preferences */}
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold font-display mb-3 text-gray-900 flex items-center">
                                            <Phone className="w-5 h-5 mr-2 text-orange-600" />
                                            Contact Preferences
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Method</label>
                                                <p className="text-gray-900">{getContactMethodDisplay(selectedDonation.preferred_contact_method)}</p>
                                            </div>
                                            {selectedDonation.best_contact_time && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Best Contact Time</label>
                                                    <p className="text-gray-900">{selectedDonation.best_contact_time}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2  items-center">
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Message
                                        </label>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-900 whitespace-pre-wrap">{selectedDonation.message}</p>
                                        </div>
                                    </div>

                                    {/* Status and Date */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusDisplay(selectedDonation.status).color}`}>
                                                {getStatusDisplay(selectedDonation.status).label}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                                            <p className="text-gray-900">{new Date(selectedDonation.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        onClick={closeModals}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => {
                                            closeModals();
                                            openStatusModal(selectedDonation);
                                        }}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                    >
                                        Update Status
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDonation(selectedDonation.id)}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-1"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {statusModalOpen && selectedDonation && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={closeModals} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg border border-gray-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold font-display text-gray-900">Update Status</h2>
                                <button
                                    onClick={closeModals}
                                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-600 mb-2">Donor: <span className="font-medium">{selectedDonation.full_name}</span></p>
                                <p className="text-gray-600 mb-2">Type: <span className="font-medium">{getDonationTypeDisplay(selectedDonation.donation_type)}</span></p>
                                <p className="text-gray-600 mb-4">Amount: <span className="font-medium">{selectedDonation.estimated_amount || 'Not specified'}</span></p>

                                <p className="text-sm text-gray-500 mb-4">
                                    Current Status:
                                    <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusDisplay(selectedDonation.status).color}`}>
                                        {getStatusDisplay(selectedDonation.status).label}
                                    </span>
                                </p>

                                {selectedDonation.status === 'donated' && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                        <p className="text-green-800 text-sm font-medium flex items-center"><CheckCircle className="inline w-4 h-4 mr-1" />Donation Complete</p>
                                        <p className="text-green-700 text-sm">This donation has been successfully completed.</p>
                                    </div>
                                )}

                                {getValidTransitions(selectedDonation.status).length === 0 && selectedDonation.status !== 'donated' && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                                        <p className="text-gray-700 text-sm">No status changes available for this donation.</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                {getValidTransitions(selectedDonation.status).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusUpdate(status)}
                                        disabled={updatingStatus}
                                        className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 ${getStatusButtonStyle(status, selectedDonation.status, false)}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full ${getStatusIconColor(status)}`}></div>
                                        <span>Mark as {getStatusDisplay(status).label}</span>
                                    </button>
                                ))}

                                {selectedDonation.status && (
                                    <div className="border-t pt-3 mt-4">
                                        <p className="text-xs text-gray-500 mb-2">Current Status:</p>
                                        <button
                                            disabled
                                            className="w-full p-3 rounded-lg border bg-gray-100 text-gray-400 cursor-not-allowed text-left flex items-center gap-3"
                                        >
                                            <div className={`w-3 h-3 rounded-full ${getStatusIconColor(selectedDonation.status)}`}></div>
                                            <span>{getStatusDisplay(selectedDonation.status).label}</span>
                                            <CheckCircle size={16} className="ml-auto text-gray-400" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={closeModals}
                                    disabled={updatingStatus}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>

                            {updatingStatus && (
                                <div className="mt-4 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
                                    <span className="ml-2 text-sm text-gray-600">Updating status...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover={false}
                theme="light"
                toastStyle={{
                    backgroundColor: '#ffffff',
                    color: '#333333',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    padding: '16px',
                    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
                    maxWidth: '700px',
                    minWidth: '200px',
                    fontSize: '16px',
                }}
            />
        </div>
    );
};

export default EnhancedDonationView;