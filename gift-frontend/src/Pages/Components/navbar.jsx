import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import {
  BookOpen,
  Calendar,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Gift,
  Heart,
  Image as ImageIcon,
  LogIn,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Menu,
  Target,
  Users,
  Video,
  VolumeX,
  Volume2,
  X,
} from 'lucide-react';
import { fetchAnnouncements } from '../../publicApi';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  {
    key: 'about',
    label: 'About Us',
    icon: Users,
    items: [
      { to: '/#mission', hash: true, label: 'Our Mission', description: 'What drives us', icon: Target },
      { to: '/#vision', hash: true, label: 'Our Vision', description: 'Future we see', icon: Eye },
      { to: '/History', label: 'Our History', description: 'Where we began', icon: BookOpen },
      { to: '/Team', label: 'Our Team', description: 'Who we are', icon: Users },
    ],
  },
  {
    key: 'gallery',
    label: 'Gallery',
    icon: ImageIcon,
    items: [
      { to: '/Videos', label: 'Video Gallery', description: 'Watch our impact', icon: Video },
      { to: '/Gallery', label: 'Photo Gallery', description: 'See our moments', icon: Camera },
      { to: '/Documents', label: 'Documents', description: 'Reports & files', icon: FileText },
      { to: '/Testimonials', label: 'Testimonials', description: 'Voices of impact', icon: MessageSquare },
    ],
  },
  { to: '/Events', label: 'Events' },
  { to: '/contactus', label: 'Contact' },
  { to: '/MoreBlogs', label: 'Blogs' },
  { to: '/autho/login', label: 'Login', icon: LogIn },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const desktopNavRef = useRef(null);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the "About Us"/"Gallery" dropdown when clicking anywhere outside it
  useEffect(() => {
    if (!openDropdown) return;

    const handleClickOutside = (e) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  useEffect(() => {
    let isMounted = true;

    const loadAnnouncements = async () => {
      setLoading(true);
      try {
        const result = await fetchAnnouncements();
        if (!isMounted) return;

        if (Array.isArray(result.data)) {
          const now = new Date();
          const visible = result.data.filter((ann) => {
            const showUntil = ann.show_until ? new Date(ann.show_until) : null;
            return ann.is_active && (!showUntil || showUntil > now);
          });
          setAnnouncements(visible);
        } else {
          setError('Fetched data is not valid');
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to fetch announcements. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAnnouncements();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (announcements.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === announcements.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [announcements.length, isPaused]);

  const closeMenu = () => {
    setIsOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (key) => setOpenDropdown((prev) => (prev === key ? null : key));

  const nextAnnouncement = () =>
    setCurrentIndex((prev) => (prev === announcements.length - 1 ? 0 : prev + 1));
  const prevAnnouncement = () =>
    setCurrentIndex((prev) => (prev === 0 ? announcements.length - 1 : prev - 1));

  const renderAnnouncementBody = () => {
    const current = announcements[currentIndex];
    return (
      <span className="flex items-center gap-2 truncate">
        <span className="inline-flex items-center gap-1 font-semibold text-orange-300 flex-shrink-0">
          <Megaphone className="w-3.5 h-3.5" /> Announcement
        </span>
        <span className="truncate">{current.title}: {current.message}</span>
      </span>
    );
  };

  const hasAnnouncements = !loading && !error && announcements.length > 0;

  return (
    <div className="relative">
      {/* Announcement strip — hidden entirely when there's no active announcement */}
      {hasAnnouncements && (
        <div className="fixed top-0 left-0 z-50 w-full bg-slate-900 text-white text-sm">
          <div className="px-4 lg:px-8 py-2.5 flex items-center justify-center gap-3">
            {announcements.length > 1 && (
              <button
                type="button"
                onClick={prevAnnouncement}
                aria-label="Previous announcement"
                className="p-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="max-w-2xl min-w-0 text-center">{renderAnnouncementBody()}</div>

            {announcements.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={nextAnnouncement}
                  aria-label="Next announcement"
                  className="p-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  aria-label={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
                >
                  {isPaused ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main nav */}
      <nav
        className={`fixed left-0 z-40 w-full transition-shadow duration-300 ${hasAnnouncements ? 'top-9' : 'top-0'} ${
          isScrolled ? 'bg-white shadow-sm border-b border-gray-100' : 'bg-white border-b border-transparent'
        }`}
      >
        <div className="px-4 lg:px-8">
          <div className="flex items-center justify-between py-3 lg:py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0" onClick={closeMenu}>
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-lg overflow-hidden flex-shrink-0">
                <img src="/images/gift.jpg" alt="Ganza-Inema Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-lg lg:text-xl font-semibold text-green-600">Ganza-Inema</span>
                <span className="text-xs text-orange-600 font-medium">Fair Trade</span>
              </div>
            </Link>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              className="lg:hidden p-2.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop menu */}
            <div className="hidden lg:flex items-center gap-1" ref={desktopNavRef}>
              {NAV_LINKS.map((item) =>
                item.items ? (
                  <div key={item.key} className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown(item.key)}
                      aria-expanded={openDropdown === item.key}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          openDropdown === item.key ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {openDropdown === item.key && (
                      <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                        {item.items.map((subItem) => {
                          const LinkComponent = subItem.hash ? HashLink : NavLink;
                          return (
                            <LinkComponent
                              key={subItem.to}
                              to={subItem.to}
                              smooth={subItem.hash}
                              onClick={closeMenu}
                              className="flex items-start gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors"
                            >
                              <subItem.icon className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                              <span>
                                <span className="block text-sm font-medium">{subItem.label}</span>
                                <span className="block text-xs text-gray-500">{subItem.description}</span>
                              </span>
                            </LinkComponent>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpenDropdown(null)}
                    className={({ isActive }) =>
                      `px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                        isActive ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                )
              )}
            </div>

            <Link
              to="/donate"
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-full font-semibold text-sm hover:bg-orange-700 transition-colors flex-shrink-0"
            >
              <Heart className="w-4 h-4" />
              <span>Donate Now</span>
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[calc(100vh-2.25rem)] overflow-y-auto' : 'max-h-0'}`}>
          <div className="px-4 py-4 bg-white border-t border-gray-100 space-y-1">
            {NAV_LINKS.map((item) =>
              item.items ? (
                <div key={item.key}>
                  <button
                    type="button"
                    onClick={() => toggleDropdown(item.key)}
                    aria-expanded={openDropdown === item.key}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openDropdown === item.key ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${openDropdown === item.key ? 'max-h-96 mt-1' : 'max-h-0'}`}>
                    <div className="pl-3 space-y-1">
                      {item.items.map((subItem) => {
                        const linkClassName = ({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                            isActive ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-50'
                          }`;
                        if (subItem.hash) {
                          return (
                            <HashLink
                              key={subItem.to}
                              to={subItem.to}
                              smooth
                              onClick={closeMenu}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-gray-600 hover:bg-gray-50"
                            >
                              <subItem.icon className="w-4 h-4 text-gray-400" />
                              <span>{subItem.label}</span>
                            </HashLink>
                          );
                        }
                        return (
                        <NavLink
                          key={subItem.to}
                          to={subItem.to}
                          onClick={closeMenu}
                          className={linkClassName}
                        >
                          <subItem.icon className="w-4 h-4 text-gray-400" />
                          <span>{subItem.label}</span>
                        </NavLink>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block px-3 py-3 rounded-lg font-medium transition-colors ${
                      isActive ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}

            <div className="pt-3 mt-2 border-t border-gray-100">
              <Link
                to="/donate"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>Donate Now</span>
                <Gift className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
