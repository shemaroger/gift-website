import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Download, MessageCircle, Calendar, User, Phone, Mail, X, Edit, CheckCircle } from 'lucide-react';
import { fetchContacts, updateContactStatus } from '../../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EnhancedContactView = () => {
    // State management
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectTypeFilter, setSubjectTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [contactsPerPage, setContactsPerPage] = useState(7);

    // Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchContactData();
    }, []);

    const fetchContactData = async () => {
        try {
            const resultdata = await fetchContacts();
            const sortedData = [...resultdata.data].sort((a, b) => {
                return new Date(b.created_at) - new Date(a.created_at);
            });
            setContacts(sortedData);
            setFilteredContacts(sortedData);
        } catch (err) {
            console.error('Error fetching contacts:', err);
            setError('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };


    // Filter contacts based on search term and filters
    useEffect(() => {
        let result = contacts;

        // Apply search filter
        if (searchTerm) {
            result = result.filter(contact =>
                contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply subject type filter
        if (subjectTypeFilter !== 'all') {
            result = result.filter(contact => contact.subject_type === subjectTypeFilter);
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter(contact => contact.status === statusFilter);
        }

        setFilteredContacts(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, subjectTypeFilter, statusFilter, contacts]);

    // Calculate pagination
    const indexOfLastContact = currentPage * contactsPerPage;
    const indexOfFirstContact = indexOfLastContact - contactsPerPage;
    const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);
    const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);

    // Pagination navigation functions
    const goToPage = (pageNumber) => {
        setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
    };

    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

    // Modal handlers
    const openViewModal = (contact) => {
        setSelectedContact(contact);
        setViewModalOpen(true);
    };

    const openStatusModal = (contact) => {
        setSelectedContact(contact);
        setStatusModalOpen(true);
    };

    const closeModals = () => {
        setViewModalOpen(false);
        setStatusModalOpen(false);
        setSelectedContact(null);
    };

    // Update contact status
    const handleStatusUpdate = async (newStatus) => {
        if (!selectedContact) return;

        setUpdatingStatus(true);
        try {
            await updateContactStatus(selectedContact.id, { status: newStatus });



            toast.success('Contact status updated successfully!');
            fetchContactData();
            closeModals();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update contact status.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Export contacts to CSV
    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'Phone', 'Subject Type', 'Subject', 'Message', 'Status', 'Created At'];

        const csvData = filteredContacts.map(contact => [
            contact.name,
            contact.email,
            contact.phone || 'N/A',
            contact.subject_type,
            contact.subject,
            contact.message.replace(/,/g, ';'), // Replace commas to avoid CSV issues
            contact.status,
            new Date(contact.created_at).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'contacts.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Get subject type display name
    const getSubjectTypeDisplay = (type) => {
        const types = {
            'general': 'General Inquiry',
            'support': 'Support',
            'partnership': 'Partnership',
            'feedback': 'Feedback',
            'complaint': 'Complaint'
        };
        return types[type] || type;
    };

    // Get status display and color
    const getStatusDisplay = (status) => {
        const statuses = {
            'new': { label: 'New', color: 'bg-blue-100 text-blue-800' },
            'readed': { label: 'Read', color: 'bg-green-100 text-green-800' }
        };
        return statuses[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
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
                        <MessageCircle className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl font-bold font-display">
                            Contact Management
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
                    Manage and respond to contact inquiries from visitors
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
                                placeholder="Search by name, email, or subject"
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex items-center">
                            <Filter size={18} className="absolute left-3 text-gray-400" />
                            <select
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={subjectTypeFilter}
                                onChange={(e) => setSubjectTypeFilter(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="general">General Inquiry</option>
                                <option value="support">Support</option>
                                <option value="partnership">Partnership</option>
                                <option value="feedback">Feedback</option>
                                <option value="complaint">Complaint</option>
                            </select>
                        </div>

                        <div className="relative flex items-center">
                            <Filter size={18} className="absolute left-3 text-gray-400" />
                            <select
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="new">New</option>
                                <option value="readed">Read</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={contactsPerPage}
                                onChange={(e) => setContactsPerPage(Number(e.target.value))}
                            >
                                <option value="5">5 per page</option>
                                <option value="7">7 per page</option>
                                <option value="10">10 per page</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow max-w-7xl mx-auto">
                    No contact messages found matching your filters
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
                                        Contact Info
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subject & Type
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Message Preview
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
                                {currentContacts.map((contact, index) => (
                                    <tr key={contact.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{indexOfFirstContact + index + 1}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                                                    <div className="text-sm text-gray-500 flex items-center">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        {contact.email}
                                                    </div>
                                                    {contact.phone && (
                                                        <div className="text-xs text-gray-400 flex items-center">
                                                            <Phone className="w-3 h-3 mr-1" />
                                                            {contact.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{contact.subject}</div>
                                            <div className="text-sm text-gray-500">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                                                    {getSubjectTypeDisplay(contact.subject_type)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {contact.message.length > 100 ? contact.message.substring(0, 100) + '...' : contact.message}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusDisplay(contact.status).color}`}>
                                                {getStatusDisplay(contact.status).label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {new Date(contact.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex mt-5 items-center justify-center  space-x-2">
                                            <button
                                                onClick={() => openViewModal(contact)}
                                                className="text-blue-600 hover:text-blue-900 flex justify-center items-center"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => openStatusModal(contact)}
                                                className="text-green-600 hover:text-green-900 flex justify-center items-center"
                                                title="Update Status"
                                            >
                                                <Edit size={16} />
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
                            Showing <span className="font-medium mx-1">{indexOfFirstContact + 1}</span> to <span className="font-medium mx-1">
                                {Math.min(indexOfLastContact, filteredContacts.length)}
                            </span> of <span className="font-medium mx-1">{filteredContacts.length}</span> contacts
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
            {viewModalOpen && selectedContact && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={closeModals} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg border border-gray-200">
                        <div className="max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold font-display text-gray-900">Contact Details</h2>
                                    <button
                                        onClick={closeModals}
                                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Contact Information */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold font-display mb-3 text-gray-900">Contact Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                <p className="text-gray-900">{selectedContact.name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <p className="text-gray-900">{selectedContact.email}</p>
                                            </div>
                                            {selectedContact.phone && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                    <p className="text-gray-900">{selectedContact.phone}</p>
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Type</label>
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                                                    {getSubjectTypeDisplay(selectedContact.subject_type)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                        <p className="text-gray-900 text-lg font-medium">{selectedContact.subject}</p>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                                        </div>
                                    </div>

                                    {/* Status and Date */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusDisplay(selectedContact.status).color}`}>
                                                {getStatusDisplay(selectedContact.status).label}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                                            <p className="text-gray-900">{new Date(selectedContact.created_at).toLocaleString()}</p>
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
                                            openStatusModal(selectedContact);
                                        }}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                    >
                                        Update Status
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {statusModalOpen && selectedContact && (
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
                                <p className="text-gray-600 mb-2">Contact: <span className="font-medium">{selectedContact.name}</span></p>
                                <p className="text-gray-600 mb-4">Subject: <span className="font-medium">{selectedContact.subject}</span></p>

                                <p className="text-sm text-gray-500 mb-4">
                                    Current Status:
                                    <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusDisplay(selectedContact.status).color}`}>
                                        {getStatusDisplay(selectedContact.status).label}
                                    </span>
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleStatusUpdate('new')}
                                    disabled={updatingStatus || selectedContact.status === 'new'}
                                    className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 ${selectedContact.status === 'new'
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : updatingStatus
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'border-blue-200 hover:bg-blue-50 text-blue-700'
                                        }`}
                                >
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span>Mark as New</span>
                                    {selectedContact.status === 'new' && <CheckCircle size={16} className="ml-auto text-blue-500" />}
                                </button>

                                <button
                                    onClick={() => handleStatusUpdate('readed')}
                                    disabled={updatingStatus || selectedContact.status === 'readed'}
                                    className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 ${selectedContact.status === 'readed'
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : updatingStatus
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'border-green-200 hover:bg-green-50 text-green-700'
                                        }`}
                                >
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span>Mark as Read</span>
                                    {selectedContact.status === 'readed' && <CheckCircle size={16} className="ml-auto text-green-500" />}
                                </button>
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
                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
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

export default EnhancedContactView;