import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  Calendar,
  Image,
  FileText,
  Megaphone,
  Shield,
  TrendingUp,
  Activity,
  Eye,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';

// Import your actual API functions
import { fetchAnnouncements, fetchRole, fetchUsers, fetchAds, fetchblogs, fetchGalleryItems, fetchEvents } from "../../api";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  // Separate state variables
  const [announcements, setAnnouncements] = useState(0);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const resultannouncements = await fetchAnnouncements();
        const resultroles = await fetchRole();
        const resultusers = await fetchUsers();
        const resultads = await fetchAds();
        const resultblogs = await fetchblogs();
        const resultgalleryItems = await fetchGalleryItems();
        const resultEvents = await fetchEvents();

        // Set data to separate state variables
        setAnnouncements(resultannouncements.data.length);
        setRoles(resultroles.data.results);
        setUsers(resultusers.data);
        setAds(resultads.data.results);
        setBlogs(resultblogs.data);
        setGalleryItems(resultgalleryItems.data);
        setEvents(resultEvents.data.results);

        console.log('Dashboard data loaded:', resultusers.data.results);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate user statistics
  const userStats = React.useMemo(() => {
    if (!Array.isArray(users) || !users.length) {
      return { active: 0, verified: 0, staff: 0, recent: 0 };
    }

    const active = users.filter(user => user.is_active).length;
    const verified = users.filter(user => user.is_verified).length;
    const staff = users.filter(user => user.is_staff).length;
    const recent = users.filter(user => {
      const createdDate = new Date(user.created_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return createdDate > weekAgo;
    }).length;

    return { active, verified, staff, recent };
  }, [users]);

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '...' : value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const UserTable = () => {
    const recentUsers = Array.isArray(users) ? users.slice(0, 5) : [];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-semibold text-gray-900">Recent Users</h3>
          <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-3 px-4">
                      <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : (
                recentUsers.map((user, index) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-25">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                          {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {user.is_active ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <UserCheck className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <UserX className="w-3 h-3 mr-1" />
                            Inactive
                          </span>
                        )}
                        {user.is_verified && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.is_staff ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {user.is_staff ? 'Staff' : 'User'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-sm text-gray-600">
                        {new Date(user.last_login).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const ActivityChart = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">Content Overview</h3>
      <div className="space-y-4">
        {[
          { label: 'Blog Posts', value: Array.isArray(blogs) ? blogs.length : 0, max: 50, color: 'bg-blue-500' },
          { label: 'Gallery Items', value: Array.isArray(galleryItems) ? galleryItems.length : 0, max: 100, color: 'bg-green-500' },
          { label: 'Events', value: Array.isArray(events) ? events.length : 0, max: 30, color: 'bg-green-500' },
          { label: 'Advertisements', value: Array.isArray(ads) ? ads.length : 0, max: 20, color: 'bg-orange-500' },
        ].map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <span className="text-sm text-gray-600">{loading ? '...' : item.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                style={{ width: loading ? '0%' : `${(item.value / item.max) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={Array.isArray(users) ? users.length : 0}
            icon={Users}
            color="bg-blue-500"
            trend="up"
            trendValue={`+${userStats.recent} this week`}
          />
          <StatCard
            title="Active Users"
            value={userStats.active}
            icon={UserCheck}
            color="bg-green-500"
            trend="up"
            trendValue={`${Array.isArray(users) && users.length > 0 ? Math.round((userStats.active / users.length) * 100) : 0}% active`}
          />
          <StatCard
            title="Announcements"
            value={announcements}
            icon={Megaphone}
            color="bg-green-600"
          />
          <StatCard
            title="Total Content"

            value={
              (Array.isArray(blogs) ? blogs.length : 0) +
              (Array.isArray(galleryItems) ? galleryItems.length : 0) +
              (Array.isArray(events) ? events.length : 0)
            }
            icon={Activity}
            color="bg-orange-500"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Blog Posts"
            value={Array.isArray(blogs) ? blogs.length : 0}
            icon={FileText}
            color="bg-orange-600"
          />
          <StatCard
            title="Events"
            value={Array.isArray(events) ? events.length : 0}
            icon={Calendar}
            color="bg-orange-600"
          />
          <StatCard
            title="Gallery + Video Items"
            value={Array.isArray(galleryItems) ? galleryItems.length : 0}
            icon={Image}
            color="bg-green-600"
          />
          <StatCard
            title="Verified Users"
            value={userStats.verified}
            icon={Shield}
            color="bg-green-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UserTable />
          </div>
          <div>
            <ActivityChart />
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-display font-bold text-orange-600">{userStats.staff}</div>
              <div className="text-sm text-gray-600">Staff Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Array.isArray(roles) ? roles.length : 0}</div>
              <div className="text-sm text-gray-600">User Roles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-display font-bold text-green-600">{Array.isArray(ads) ? ads.length : 0}</div>
              <div className="text-sm text-gray-600">Active Ads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{userStats.recent}</div>
              <div className="text-sm text-gray-600">New This Week</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;