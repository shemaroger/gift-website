import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, Edit, ChevronsRight, Eye, Download, Check, X, Trash2 } from 'lucide-react';
import { fetchUsers, deleteUser } from "../../api";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const UserList = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(7);
  const navigate = useNavigate();

  // Fetch users data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchUsers();
        const sortedData = [...response.data].sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setUsers(sortedData);
        setFilteredUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Filter users based on search term and filters
  useEffect(() => {
    let result = users;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(user =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => {
        if (statusFilter === 'active') return user.is_active;
        if (statusFilter === 'inactive') return !user.is_active;
        if (statusFilter === 'verified') return user.is_verified;
        return true;
      });
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => {
        if (roleFilter === 'staff') return user.is_staff;
        if (roleFilter === 'regular') return !user.is_staff;
        return true;
      });
    }

    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, roleFilter, users]);

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Pagination navigation functions
  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

  // Handle user deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      return;
    }
    try {
      const result = await deleteUser(id);
      if (result.success) {
        setUsers(users.filter(user => user.id !== id));
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user.');
    }
  };

  // Export users to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Status', 'Role', 'Created At'];

    const csvData = filteredUsers.map(user => [
      `${user.first_name} ${user.last_name}`,
      user.username,
      user.is_active ? 'Active' : 'Inactive',
      user.is_staff ? 'Staff' : 'Regular',
      new Date(user.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'users.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">
            User Management
          </h1>
          <div className="flex space-x-2">

            <button

              onClick={() => navigate('/dashboard/adduser')}
              className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white">
              + New User
            </button>
          </div>
        </div>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your projects today
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
                placeholder="Search by name or email"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex items-center">
              <Filter size={18} className="absolute left-3 text-gray-400" />
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="verified">Verified</option>
              </select>
            </div>

            <div className="relative flex items-center">
              <Filter size={18} className="absolute left-3 text-gray-400" />
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="staff">Staff</option>
                <option value="regular">Regular</option>
              </select>
            </div>

            <div className="flex items-center">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={usersPerPage}
                onChange={(e) => setUsersPerPage(Number(e.target.value))}
              >
                <option value="5">5 per page</option>
                <option value="7">7 per page</option>

              </select>
            </div>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow max-w-7xl mx-auto">
          No users found matching your filters
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
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-center  text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user, index) => (
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.is_active ? <><Check className="inline w-3 h-3 mr-1" />Active</> : <><X className="inline w-3 h-3 mr-1" />Inactive</>}
                        </span>
                        {user.is_verified && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        )}
                        {user.is_staff && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Staff
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap  text-sm font-medium flex items-center justify-center space-x-1">
                      <Link to={`/dashboard/userDetails/${user.id}`} className="text-orange-600 hover:text-orange-900 mr-4 flex justify-center items-center">
                        <Eye size={16} />
                      </Link>
                      <Link to={`/dashboard/adduser/${user.id}`} className="text-orange-600 hover:text-orange-900 mr-4 flex justify-center items-center">
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-orange-600 hover:text-orange-900 flex justify-center items-center"
                        title="Delete user"
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
              Showing <span className="font-medium mx-1">{indexOfFirstUser + 1}</span> to <span className="font-medium mx-1">
                {Math.min(indexOfLastUser, filteredUsers.length)}
              </span> of <span className="font-medium mx-1">{filteredUsers.length}</span> users
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
                // Calculate which page numbers to show
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
    </div>
  );
};

export default UserList;