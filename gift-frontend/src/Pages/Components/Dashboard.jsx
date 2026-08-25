import React, { useState, useEffect } from "react";

import { ChevronDown, Moon, Sun, Menu, X, PieChart, Folder, Users, BarChart2, Calendar, LogOut, ClipboardList, CalendarDays, BookOpen, User, MessageSquare } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Outlet, Link } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Import your actual API functions
import { logoutUser, fetchUserById } from "../../api";


const Dashboard = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchusers = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser?.id) return;

      const response = await fetchUserById(storedUser.id);
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
  }
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetchusers();
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      navigate("/autho/login");
    } else {
      toast.error(result.message);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { name: 'Dashboard', icon: <PieChart className="w-5 h-5 text-black" />, path: '/dashboard/adminDashboard' },
    { name: 'Role Management', icon: <Users className="w-5 h-5 text-black" />, path: '/dashboard/getrole' },
    { name: 'User Management', icon: <Folder className="w-5 h-5 text-black" />, path: '/dashboard/GetUser' },
    { name: 'Ads management', icon: <BarChart2 className="w-5 h-5 text-black" />, path: '/dashboard/getAds' },
    { name: 'Blogs management', icon: <BookOpen className="w-5 h-5 text-black" />, path: '/dashboard/getBlog' },
    { name: 'Events management', icon: <CalendarDays className="w-5 h-5 text-black" />, path: '/dashboard/getEvent' },
    { name: 'Announcements', icon: <ClipboardList className="w-5 h-5 text-black" />, path: '/dashboard/addAnnouncement' },
    { name: 'Gallery And Video', icon: <Calendar className="w-5 h-5 text-black" />, path: '/dashboard/getGallery' },
    { name: 'Testimonials', icon: <MessageSquare className="w-5 h-5 text-black" />, path: '/dashboard/getTestimonials' },
    { name: 'Donation', icon: <Calendar className="w-5 h-5 text-black" />, path: '/dashboard/viewDonation' },
    { name: 'Contact Messages', icon: <Calendar className="w-5 h-5 text-black" />, path: '/dashboard/viewContact' },
  ];


  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
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
      <header className={`${darkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
        } border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm`}>

        <div className="flex items-center">
          {/* Mobile menu button */}
          <button onClick={toggleMobileMenu} className="md:hidden mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <div className="flex items-center">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center
              ${darkMode
                ? 'bg-orange-500'
                : 'bg-orange-600'}
              text-white mr-3 shadow-lg`}>
              <img
                src="/images/gift.jpg"
                alt="Ganza-Inema Fair Trade Logo"
                className="h-10 w-10 md:h-12 md:w-12 object-contain"
              />
            </div>
            <h1 className={`text-lg font-bold tracking-wide 
              ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <span className="text-green-600">Ganza-Inema</span>
              <span className="text-orange-500 ml-1">Fair Trade</span>
            </h1>
          </div>

        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${darkMode
              ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>



          {/* User profile */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className={`flex items-center space-x-2 focus:outline-none ${dropdownOpen ? (darkMode ? 'bg-gray-700 rounded-lg p-1' : 'bg-gray-100 rounded-lg p-1') : ''
                }`}
              aria-expanded={dropdownOpen}
              aria-label="Open user menu"
            >
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white mr-3 bg-white flex items-center justify-center">
                {/* {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt="User"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '';
                          }}
                        />
                      ) : ( */}
                <span className="text-xl"><User className="w-5 h-5" /></span>
                {/* )} */}
              </div>
              <span className="hidden md:inline text-sm font-medium">{users.first_name} {users.last_name}</span>
              <ChevronDown size={16} className={`hidden md:block transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className={`absolute right-0 mt-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } border rounded-lg shadow-lg w-64 z-30 overflow-hidden`}>
                <div className="p-4 bg-green-600 text-white">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white mr-3 bg-white flex items-center justify-center">
                      {/* {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt="User"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '';
                          }}
                        />
                      ) : ( */}
                      <span className="text-xl"><User className="w-5 h-5" /></span>
                      {/* )} */}
                    </div>

                    <div>
                      <p className="text-sm font-medium"> {users.first_name} {users.last_name}</p>
                      <p className="text-xs text-green-100">{users.email}</p>
                      <div className="flex items-center mt-1">
                        <div className="h-2 w-2 rounded-full bg-orange-300 mr-1"></div>
                        <span className="text-xs text-green-100">Staff</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <button className={`w-full text-left px-4 py-3 text-sm flex items-center ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                    }`}>
                    <svg className="mr-3 w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    My Profile
                  </button>

                  <div className={`my-1 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-50 text-red-600'
                      }`}
                  >
                    <LogOut size={16} className="mr-3 opacity-70" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleMobileMenu}>
            <div
              className={`absolute top-0 left-0 w-72 h-full ${darkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg transform transition-transform duration-300 ease-in-out`}
              onClick={e => e.stopPropagation()}
            >
              {/* Mobile sidebar content */}
              <div className="p-4 bg-green-600 flex items-center justify-between text-white">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-lg overflow-hidden bg-white mr-2">
                    <img src="/images/gift.jpg" alt="Ganza-Inema Fair Trade Logo" className="w-full h-full object-cover" />
                  </div>
                  <h1 className="font-display text-lg font-semibold">
                    Ganza-Inema
                  </h1>
                </div>
                <button onClick={toggleMobileMenu} className="text-white">
                  <X size={20} />
                </button>
              </div>

              {/* User Profile in mobile menu */}
              <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} flex items-center`}>
                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-orange-200 mr-3 bg-white flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{users.last_name} {users.first_name}</p>
                  <p className={`${darkMode ? 'text-orange-300' : 'text-orange-600'} text-xs`}>Staff</p>
                </div>
              </div>

              {/* Mobile menu items */}
              <nav className={`px-2 py-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <ul className="space-y-1">
                  {menuItems.map((item, index) => {
                    const active = isActive(item.path);
                    return (
                      <li key={index}>
                        <Link
                          to={item.path}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${active
                            ? darkMode
                              ? 'bg-orange-500 text-white'
                              : 'bg-orange-100 text-green-800 border-l-4 border-orange-400'
                            : darkMode
                              ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                              : 'text-gray-700 hover:bg-orange-50 hover:text-green-600'
                            }`}
                          onClick={toggleMobileMenu}
                        >
                          <div className="flex items-center">
                            <span className="mr-3">{item.icon}</span>
                            <span>{item.name}</span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-72'
            } ${darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
            } border-r transition-all duration-200 ease-in-out sticky top-16 h-[calc(100vh-4rem)]`}
        >
          {/* Sidebar menu */}
          <nav className="flex-1 py-6 px-3 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item, index) => {
                const active = isActive(item.path);
                return (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden group
                        ${active
                          ? darkMode
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-200/30'
                            : 'bg-orange-100 text-green-800 shadow-md border-l-4 border-orange-400'
                          : darkMode
                            ? 'text-gray-300 hover:bg-gray-700/40 hover:text-white'
                            : 'text-gray-700 hover:bg-orange-50 hover:text-green-600'}
                      `}

                    >
                      {/* Active indicator pill */}
                      {active && !sidebarCollapsed && (
                        <span className="absolute left-0 top-1/2 transform -translate-y-1/2 h-8 w-1 bg-white rounded-full"></span>
                      )}

                      {/* Active indicator dot for collapsed sidebar */}
                      {active && sidebarCollapsed && (
                        <span className="absolute left-0 top-1/2 transform -translate-y-1/2 h-2 w-2 bg-white rounded-full ml-1"></span>
                      )}

                      <div className="flex items-center">
                        <span className={`${sidebarCollapsed ? 'mx-auto text-xl' : 'mr-3 text-lg'} text-black`}>
                          {item.icon}
                        </span>
                        {!sidebarCollapsed && <span>{item.name}</span>}
                      </div>

                      {/* Hover effect - ripple */}
                      <span className={`absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ${active ? 'hidden' : ''}`}></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`flex ${sidebarCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
              {!sidebarCollapsed && (
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Online</span>
                </div>
              )}
              <button
                onClick={toggleSidebar}
                className={`${darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  } p-2 rounded-lg transition-colors duration-150`}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Menu size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
          <div className="py-6 px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;