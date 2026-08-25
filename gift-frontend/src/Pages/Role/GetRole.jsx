import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { fetchRole, updaterole, fetchUserById, deleteRole } from "../../api";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RolesList = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRoles, setTotalRoles] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const rolesPerPage = 10;
    const [users, setUsers] = useState([]);
    const [isSuperuser, setIsSuperuser] = useState(false);

    const fetchRoles = async () => {
        const userString = localStorage.getItem("user");
        let user = null;
        try {
            user = userString ? JSON.parse(userString) : null;
            const response = await fetchUserById(user.id);

            if (response.success) {
                setUsers(response.data);
                setIsSuperuser(response.data.is_superuser);
                console.log(response.data);
                console.log("is user super : ", response.data.is_superuser);
            }

        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
            return;
        }

        try {
            const response = await fetchRole();
            const sortedData = [...response.data.results].sort((a, b) => {
                return new Date(b.created_at) - new Date(a.created_at);
            });
            setRoles(sortedData);
            setTotalRoles(response.data.count);
        } catch (err) {
            console.error('Error fetching roles:', err);
            setError('Failed to load roles data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const filteredRoles = Array.isArray(roles)
        ? roles.filter(role =>
            role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const paginatedRoles = filteredRoles.slice((currentPage - 1) * rolesPerPage, currentPage * rolesPerPage);

    const handleDeleteClick = (roleId) => {
        setSelectedRoleId(roleId);
        setShowConfirmDelete(true);
    };

    const confirmDelete = async () => {
        try {
            const result = await deleteRole(selectedRoleId);
            setShowConfirmDelete(false);
            if (result.success) {
                toast.success(result.message);
                fetchRoles();
            } else {
                toast.error(result.message || 'Failed to delete role. It may be assigned to users.');
            }
        } catch (err) {
            console.error('Error deleting role:', err);
            toast.error('Failed to delete role. It may be assigned to users.');
        }
    };

    const cancelDelete = () => {
        setShowConfirmDelete(false);
        setSelectedRoleId(null);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleEditClick = (role) => {
        setSelectedRole(role);
        setIsEditModalOpen(true);
    };

    const handleSaveRole = async (updatedRole) => {
        try {
            await updaterole(selectedRole.id, updatedRole);
            toast.success('Role updated successfully');
            setIsEditModalOpen(false);
            fetchRoles();
        } catch (err) {
            console.error('Error updating role:', err);
            toast.error('Failed to update role. Please try again later.');
        }
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedRole(null);
    };

    if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>;

    return (
        <div>
            <div className="mb-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h1 className="text-xl sm:text-2xl font-display font-bold">
                        Role Management
                    </h1>
                    {isSuperuser && (
                        <div className="flex space-x-2">
                            <button
                                onClick={() => navigate('/dashboard/addrole')}
                                className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                + New Role
                            </button>
                        </div>
                    )}
                </div>
                <p className="mt-2 text-gray-600">
                    Manage system roles and permissions
                </p>
                <p className="mt-2 text-gray-600">
                    Total Roles: {totalRoles}
                </p>
            </div>

            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className="text-lg font-display font-medium">Roles</h3>
                        <div className="relative w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Search roles..."
                                className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <div className="absolute left-3 top-2.5 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                {isSuperuser && (
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedRoles.length > 0 ? (
                                paginatedRoles.map((role, index) => (
                                    <tr key={role.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{(currentPage - 1) * rolesPerPage + index + 1}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{role.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {role.description || 'No description provided'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${role.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {role.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(role.created_at).toLocaleDateString()}
                                        </td>
                                        {isSuperuser && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditClick(role)} className="text-orange-600 hover:text-orange-900 mr-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleDeleteClick(role.id)} className="text-orange-600 hover:text-orange-900" title="Delete role">
                                                    <Trash2 size={16} className="inline-block" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isSuperuser ? "6" : "5"} className="px-6 py-4 text-center text-sm text-gray-500">
                                        {searchTerm ? 'No roles match your search.' : 'No roles found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4">
                    <div className="text-sm sm:text-base text-center sm:text-left">
                        Showing {Math.min(currentPage * rolesPerPage, totalRoles)} of {totalRoles} roles
                    </div>
                    <div>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 mx-1 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-200 disabled:text-gray-500"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage * rolesPerPage >= totalRoles}
                            className="px-4 py-2 mx-1 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-200 disabled:text-gray-500"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {showConfirmDelete && isSuperuser && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
                    <div className="bg-white rounded-lg w-[calc(100%-2rem)] sm:w-full max-w-md p-6 z-50">
                        <h2 className="text-xl font-display font-bold mb-4">Delete Role</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this role? This cannot be undone.
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 mr-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && isSuperuser && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
                    <div className="bg-white rounded-lg w-[calc(100%-2rem)] sm:w-full max-w-md p-6 z-50">
                        <h2 className="text-xl font-display font-bold mb-4">Edit Role</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={selectedRole ? selectedRole.name : ''}
                                onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={selectedRole ? selectedRole.description : ''}
                                onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={selectedRole ? selectedRole.is_active : true}
                                onChange={(e) => setSelectedRole({ ...selectedRole, is_active: e.target.value === 'true' })}
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 mr-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSaveRole(selectedRole)}
                                className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesList;