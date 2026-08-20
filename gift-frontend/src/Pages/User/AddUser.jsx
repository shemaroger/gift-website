// AddUser.js - Modern Redesigned Version
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { registerUser, fetchRole, fetchUserById, updateUser } from "../../api";
import { ArrowLeft, User, Mail, Lock, Shield, Settings, Eye, EyeOff, UserCheck, Users } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        confirmPassword: '',
        is_active: true,
        is_staff: false,
        is_verified: false,
        role_ids: []
    });

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
        }
    }, [id]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetchRole();
                console.log('Fetched roles:', response.data.results);
                setRoles(response.data.results || []);
            } catch (err) {
                console.error('Error fetching roles:', err);
                setError('Failed to load roles');
                toast.error('Failed to load roles');
            }
        };
        fetchRoles();
    }, []);

    // Fetch user data for editing
    useEffect(() => {
        if (id) {
            const fetchUser = async () => {
                setInitialLoading(true);
                try {
                    const response = await fetchUserById(id);
                    const userData = response.data;
                    console.log('Fetched user data:', userData);

                    setFormData({
                        email: userData.email || '',
                        first_name: userData.first_name || '',
                        last_name: userData.last_name || '',
                        password: '',
                        confirmPassword: '',
                        is_active: userData.is_active !== undefined ? userData.is_active : true,
                        is_staff: userData.is_staff !== undefined ? userData.is_staff : false,
                        is_verified: userData.is_verified !== undefined ? userData.is_verified : false,
                        role_ids: Array.isArray(userData.roles)
                            ? userData.roles.map(role => typeof role === 'object' ? role.id : role)
                            : []
                    });
                } catch (err) {
                    console.error('Error fetching user:', err);
                    setError('Failed to load user data');
                    toast.error('Failed to load user data');
                } finally {
                    setInitialLoading(false);
                }
            };

            fetchUser();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleRoleChange = (e) => {
        const roleId = parseInt(e.target.value);
        setFormData(prev => {
            if (e.target.checked) {
                return { ...prev, role_ids: [...prev.role_ids, roleId] };
            } else {
                return { ...prev, role_ids: prev.role_ids.filter(id => id !== roleId) };
            }
        });
    };

    const validateForm = () => {
        // Email validation
        if (!formData.email || !formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }

        // Name validation
        if (!formData.first_name || !formData.last_name) {
            setError('First name and last name are required');
            return false;
        }

        // Password validation for new users
        if (!isEditMode) {
            if (!formData.password) {
                setError('Password is required for new users');
                return false;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters long');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
        } else {
            // For edit mode, only validate password if it's provided
            if (formData.password && formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
            if (formData.password && formData.password.length < 6) {
                setError('Password must be at least 6 characters long');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const submitData = { ...formData };
            delete submitData.confirmPassword;

            // For edit mode, only include password if it's provided
            if (isEditMode && !submitData.password) {
                delete submitData.password;
            }

            console.log('Submitting data:', submitData);

            if (isEditMode) {
                await updateUser(id, submitData);
                toast.success('User updated successfully');
            } else {
                await registerUser(submitData);
                toast.success('User created successfully');
            }

            // Navigate back to users list
            navigate('/dashboard/getuser');
        } catch (err) {
            console.error('Error saving user:', err);
            const errorMessage = err.response?.data?.detail ||
                err.response?.data?.message ||
                `Failed to ${isEditMode ? 'update' : 'create'} user`;
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard/getuser');
    };

    // Show loading spinner while fetching user data for editing
    if (initialLoading) {
        return (
            <div className="min-h-screen bg-orange-50 flex justify-center items-center">
                <div className="bg-white p-8 rounded-2xl border border-gray-200">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-center">Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="">
            <ToastContainer position="top-right" />

            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/dashboard/getuser"
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                                <ArrowLeft size={18} className="mr-2" />
                                Back to Users
                            </Link>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div>
                                <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center">
                                    <Users className="mr-3 text-orange-600" size={28} />
                                    User Management
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {isEditMode ? 'Edit user information and permissions' : 'Add a new user to your organization'}
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center space-x-2">
                            <div className={`px-3 py-1 rounded-full text-x font-medium  ${isEditMode
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-800'
                                }`}>
                                {isEditMode ? 'Edit Mode' : 'Create Mode'}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {/* Form Header */}

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="p-8">
                        {/* Basic Information Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-display font-semibold text-gray-900 mb-4 flex items-center">
                                <User className="mr-2 text-orange-600" size={20} />
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Email */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                            placeholder="user@example.com"
                                        />
                                    </div>
                                </div>

                                {/* First Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                        placeholder="John"
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-display font-semibold text-gray-900 mb-4 flex items-center">
                                <Lock className="mr-2 text-orange-600" size={20} />
                                Security Settings
                            </h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password {isEditMode ? '(Leave blank to keep current)' : '*'}
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required={!isEditMode}
                                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                            placeholder={isEditMode ? "Leave blank to keep current" : "Enter password"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password {!isEditMode && '*'}
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required={!isEditMode}
                                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                            placeholder={isEditMode ? "Confirm new password" : "Confirm password"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Roles Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-display font-semibold text-gray-900 mb-4 flex items-center">
                                <Shield className="mr-2 text-orange-600" size={20} />
                                Role Assignment
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                {Array.isArray(roles) && roles.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {roles.map(role => (
                                            <label key={role.id} className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 cursor-pointer transition-colors duration-200">
                                                <input
                                                    type="checkbox"
                                                    value={role.id}
                                                    checked={formData.role_ids.includes(role.id)}
                                                    onChange={handleRoleChange}
                                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                                />
                                                <span className="ml-3 text-sm font-medium text-gray-700">
                                                    {role.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No roles available</p>
                                )}
                            </div>
                        </div>

                        {/* Account Settings Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-display font-semibold text-gray-900 mb-4 flex items-center">
                                <Settings className="mr-2 text-orange-600" size={20} />
                                Account Settings
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <div className="ml-3">
                                            <span className="text-sm font-medium text-gray-700">Active User</span>
                                            <p className="text-xs text-gray-500">User can access the system</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_staff"
                                            checked={formData.is_staff}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <div className="ml-3">
                                            <span className="text-sm font-medium text-gray-700">Staff Member</span>
                                            <p className="text-xs text-gray-500">Administrative privileges</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_verified"
                                            checked={formData.is_verified}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <div className="ml-3">
                                            <span className="text-sm font-medium text-gray-700">Verified User</span>
                                            <p className="text-xs text-gray-500">Email verified account</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-6 py-3 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {isEditMode ? 'Updating User...' : 'Creating User...'}
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        <UserCheck className="mr-2" size={16} />
                                        {isEditMode ? 'Update User' : 'Create User'}
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddUser;