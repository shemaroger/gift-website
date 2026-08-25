import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import {
  BookOpen,
  Calendar,
  Camera,
  ChevronDown,
  Eye,
  FileText,
  Gift,
  Heart,
  Image as ImageIcon,
  Instagram,
  LogIn,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Menu,
  Phone,
  Target,
  Twitter,
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
  const [isContactOpen, setIsContactOpen] = useState(false);
  const desktopNavRef = useRef(null);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  const closeMenu = () => {
    setIsOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (key) => setOpenDropdown((prev) => (prev === key ? null : key));

  const hasAnnouncements = !loading && !error && announcements.length > 0;

  const tickerText = announcements
    .map((a) => `${a.title}: ${a.message}`)
    .join('   •   ');

  return (
    <div className="relative">
      {/* Announcement strip — a continuously scrolling ticker, hidden entirely when there's no active announcement */}
      {hasAnnouncements && (
        <div className="fixed top-0 left-0 z-50 w-full bg-green-900 text-white text-sm overflow-hidden">
          <div className="px-4 lg:px-8 py-2 flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1 font-semibold text-orange-300 flex-shrink-0">
              <Megaphone className="w-3.5 h-3.5" /> Announcement
            </span>

            <div className="flex-1 min-w-0 overflow-hidden">
              <div
                className="flex whitespace-nowrap w-max animate-marquee"
                style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
              >
                <span className="pr-16">{tickerText}</span>
                <span className="pr-16" aria-hidden="true">{tickerText}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? 'Resume scrolling' : 'Pause scrolling'}
              className="p-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
            >
              {isPaused ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Social + CTA, mirroring a standard utility-bar layout */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0 pl-3 border-l border-white/15">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="text-white/70 hover:text-white transition-colors"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white/70 hover:text-white transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="ml-1 px-3 py-1 rounded-full border border-white/30 text-xs font-medium hover:bg-white/10 transition-colors"
              >
                Get in Touch
              </button>
            </div>
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

            {/* Mobile: Get in Touch + menu toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                aria-label="Get in touch"
                className="p-2.5 rounded-lg border border-gray-200 text-gray-700 hover:text-orange-600 hover:border-orange-200 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isOpen}
                className="p-2.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

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

      {/* Get in Touch modal */}
      {isContactOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
          onClick={() => setIsContactOpen(false)}
        >
          <div
            className="bg-white rounded-lg border border-gray-100 w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header band */}
            <div className="relative bg-green-900 px-6 pt-6 pb-8">
              <button
                type="button"
                onClick={() => setIsContactOpen(false)}
                aria-label="Close"
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-orange-300 font-semibold text-xs uppercase tracking-wide mb-1">
                Ganza-Inema Fair Trade
              </p>
              <h3 className="font-display text-2xl font-semibold text-white">Get in Touch</h3>
            </div>

            {/* Contact rows */}
            <div className="px-6 -mt-4 pb-2 space-y-2">
              <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3">
                <span className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-orange-600" />
                </span>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900">Kigali, Rwanda</p>
                </div>
              </div>

              <a
                href="tel:+250781546413"
                className="flex items-center gap-3 bg-white border border-gray-100 hover:border-orange-200 rounded-lg px-4 py-3 transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-orange-600" />
                </span>
                <div>
                  <p className="text-xs text-gray-500">Call us</p>
                  <p className="text-sm font-medium text-gray-900">+250 781 546 413</p>
                </div>
              </a>

              <a
                href="mailto:haricbuz@gmail.com"
                className="flex items-center gap-3 bg-white border border-gray-100 hover:border-orange-200 rounded-lg px-4 py-3 transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-orange-600" />
                </span>
                <div>
                  <p className="text-xs text-gray-500">Email us</p>
                  <p className="text-sm font-medium text-gray-900">haricbuz@gmail.com</p>
                </div>
              </a>
            </div>

            {/* Social */}
            <div className="px-6 pt-4 pb-6 mt-2 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Follow us</p>
              <div className="flex gap-2">
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-orange-100 rounded-full transition-colors"
                >
                  <Twitter className="w-4 h-4 text-gray-700" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-orange-100 rounded-full transition-colors"
                >
                  <Instagram className="w-4 h-4 text-gray-700" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
