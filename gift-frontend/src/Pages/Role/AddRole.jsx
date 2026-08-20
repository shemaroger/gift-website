import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { CreateRole } from "../../api";

const AddRole = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        if (id) {
            const fetchRole = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`/api/roles/${id}/`);
                    const roleData = response.data;

                    setFormData({
                        name: roleData.name,
                        description: roleData.description,
                        is_active: roleData.is_active
                    });
                } catch (err) {
                    console.error('Error fetching role:', err);
                    setError('Failed to load role data');
                } finally {
                    setLoading(false);
                }
            };

            fetchRole();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (id) {
                await axios.put(`/api/roles/${id}/`, formData);
            } else {
                await CreateRole(formData);
            }

            navigate('/dashboard/getrole');
        } catch (err) {
            console.error('Error saving role:', err);
            setError(err.response?.data?.detail || 'Failed to save role');
        } finally {
            setLoading(false);
        }
    };

    if (loading && id) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>;

    return (
        <div>
            <div className="mb-8 max-w-7xl mx-auto ">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h1 className="text-xl sm:text-2xl font-display font-bold">
                        Role Management
                    </h1>
                    <div className="flex space-x-2">
                        <a href='/dashboard/getrole' className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white">
                            + Back Roles
                        </a>
                    </div>
                </div>
                <p className="mt-2 text-gray-600">
                    Manage system roles and permissions
                </p>
            </div>
            <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl sm:text-2xl font-display font-bold mb-6">{id ? 'Edit Role' : 'Add New Role'}</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="e.g., Admin, Manager, Viewer"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Describe the permissions and responsibilities of this role"
                            />
                        </div>

                        <div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                                    Active
                                </label>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Inactive roles will not be available for assignment to users
                            </p>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row justify-end gap-2 sm:gap-0 sm:space-x-3">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard/getrole')}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Role'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRole;