import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchUserById } from "../../api";
import { Check, X, Star } from 'lucide-react';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      console.log(" User Id", id)
      try {
        const userResponse = await fetchUserById(id);
        setUser(userResponse.data);
        setLoading(false);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Helper function to get user initials
  const getUserInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-600"></div>
                  </div>
        <p className="text-gray-600 font-medium">Loading user details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-xl border border-gray-200 max-w-md mx-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading User</h3>
        <p className="text-red-600">{error}</p>
        <Link to="/users" className="inline-block mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          Back to Users
        </Link>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-xl border border-gray-200 max-w-md mx-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">User Not Found</h3>
        <p className="text-gray-600">The requested user could not be found.</p>
        <Link to="/users" className="inline-block mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          Back to Users
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Remove the fixed floating navigation since we now have it in the header */}

      <div className="container mx-auto px-4 py-12">
        {/* Hero Profile Section */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header with Clean White Background */}
            <div className="relative bg-white px-8 py-12">
              {/* Back Button - Top Right */}
              <div className="absolute top-6 right-8">
                <Link
                  to="/dashboard/GetUser"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Users
                </Link>
              </div>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="relative h-32 w-32 rounded-full bg-orange-600 text-white flex items-center justify-center text-4xl font-display font-bold border-4 border-gray-100">
                      {getUserInitials(user.first_name, user.last_name)}
                    </div>
                    {user.is_verified && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-white">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-2 tracking-tight">
                      {user.first_name} {user.last_name}
                    </h1>
                    <p className=" text-gray-600 mb-1">{user.email}</p>


                    {/* Status Badges */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                      <span className={`px-4 py-2 text-sm font-semibold rounded-full ${user.is_active
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                        {user.is_active ? <><Check className="inline w-4 h-4 mr-1" />Active</> : <><X className="inline w-4 h-4 mr-1" />Inactive</>}
                      </span>

                      {user.is_staff && (
                        <span className="px-4 py-2 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                          <Star className="inline w-4 h-4 mr-1" />Staff Member
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="p-8 md:p-12">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Basic Information Card */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-300">
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-orange-100 rounded-lg mr-4">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-display font-bold text-gray-900">Personal Info</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="group">
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Email Address</label>
                        <div className="bg-gray-50 p-3 rounded-lg group-hover:bg-gray-100 transition-colors">
                          <p className="text-gray-900 font-medium break-all">{user.email}</p>
                        </div>
                      </div>

                      {user.username && (
                        <div className="group">
                          <label className="text-sm font-medium text-gray-500 mb-1 block">Username</label>
                          <div className="bg-gray-50 p-3 rounded-lg group-hover:bg-gray-100 transition-colors">
                            <p className="text-gray-900 font-medium">@{user.username}</p>
                          </div>
                        </div>
                      )}

                      <div className="group">
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Full Name</label>
                        <div className="bg-gray-50 p-3 rounded-lg group-hover:bg-gray-100 transition-colors">
                          <p className="text-gray-900 font-medium">{user.first_name} {user.last_name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Roles Card */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-300 mt-6">
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-green-100 rounded-lg mr-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-display font-bold text-gray-900">Roles</h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role, index) => (
                          <span
                            key={index}
                            className="px-3 py-2 text-sm font-medium bg-green-100 text-green-800 rounded-full border border-green-200"
                          >
                            {typeof role === 'object' ? role.name : role}
                          </span>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500 italic">
                          <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          No roles assigned
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Security & Timeline */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Security Information */}
                  {(user.failed_login_attempts > 0 || user.account_locked_until || user.otp) && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-300">
                      <div className="flex items-center mb-6">
                        <div className="p-3 bg-red-100 rounded-lg mr-4">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-display font-bold text-gray-900">Security Alerts</h3>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {user.failed_login_attempts > 0 && (
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center mb-2">
                              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <label className="text-sm font-semibold text-red-700">Failed Attempts</label>
                            </div>
                            <p className="text-red-800 font-bold text-2xl">{user.failed_login_attempts}</p>
                          </div>
                        )}

                        {user.account_locked_until && (
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center mb-2">
                              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              </svg>
                              <label className="text-sm font-semibold text-red-700">Account Locked Until</label>
                            </div>
                            <p className="text-red-800 font-medium text-sm">
                              {new Date(user.account_locked_until).toLocaleString()}
                            </p>
                          </div>
                        )}

                        {user.otp && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center mb-2">
                              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <label className="text-sm font-semibold text-orange-700">OTP Active</label>
                            </div>
                            <p className="text-blue-800 font-medium">Two-factor authentication enabled</p>
                            {user.otp_created_at && (
                              <p className="text-blue-600 text-xs mt-1">
                                Created: {new Date(user.otp_created_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timeline Card */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-300">
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-green-100 rounded-lg mr-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-display font-bold text-gray-900">Account Timeline</h3>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-orange-100 p-4 rounded-lg border border-orange-200">
                        <label className="text-sm font-medium text-orange-700 mb-1 block">Account Created</label>
                        <p className="text-orange-900 font-semibold text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                        <p className="text-orange-700 text-xs">{new Date(user.created_at).toLocaleTimeString()}</p>
                      </div>

                      <div className="bg-green-100 p-4 rounded-lg border border-green-200">
                        <label className="text-sm font-medium text-green-700 mb-1 block">Last Updated</label>
                        <p className="text-green-900 font-semibold text-sm">{new Date(user.updated_at).toLocaleDateString()}</p>
                        <p className="text-green-700 text-xs">{new Date(user.updated_at).toLocaleTimeString()}</p>
                      </div>

                      <div className="bg-green-100 p-4 rounded-lg border border-green-200 md:col-span-2 lg:col-span-1">
                        <label className="text-sm font-medium text-green-700 mb-1 block">Last Login</label>
                        {user.last_login ? (
                          <>
                            <p className="text-green-900 font-semibold text-sm">{new Date(user.last_login).toLocaleDateString()}</p>
                            <p className="text-green-700 text-xs">{new Date(user.last_login).toLocaleTimeString()}</p>
                          </>
                        ) : (
                          <p className="text-green-700 italic text-sm">Never logged in</p>
                        )}
                      </div>

                      {user.verification_token_expires && (
                        <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-200 md:col-span-2 lg:col-span-3">
                          <label className="text-sm font-medium text-yellow-700 mb-1 block">Verification Token Expires</label>
                          <p className="text-yellow-900 font-semibold text-sm">{new Date(user.verification_token_expires).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;