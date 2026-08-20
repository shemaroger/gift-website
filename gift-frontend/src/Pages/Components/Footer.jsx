import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Check, Gift } from 'lucide-react';

const Footer = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const quickLinks = [
    { title: 'Home', href: '/' },
    { title: 'About Us', href: '/Aboutus' },
    { title: 'Photo Gallery', href: '/Gallery' },
    { title: 'Events', href: '/Events' },
    { title: 'Blog Post', href: '/MoreBlogs' },
  ];

  const services = [
    { title: 'Contact Us', href: '/contactus' },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    // TODO: no real submission handler wired up yet — this only updates local
    // state. Needs a real API call / email-service integration before launch.
    setSubscribed(true);
    setName('');
    setEmail('');
  };

  return (
    <footer
      className="relative bg-slate-900 text-white"
      style={{ clipPath: 'polygon(0 3%, 60% 20%, 88% 3%, 100% 7%, 100% 100%, 0 100%)' }}
    >
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-white" />
              </span>
              <span className="font-display text-xl font-semibold leading-tight">
                <span className="text-green-500">Ganza-Inema</span><br />
                <span className="text-orange-500">Fair Trade</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Supporting the Kanombe Sector — savings groups, training, and seed capital funded by every sale.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-sm">Kigali, Rwanda</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-sm">+250781546413</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-sm">haricbuz@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold text-white mb-1">Explore</h4>
            <div className="w-6 h-0.5 bg-orange-600 mb-5" />
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-base font-semibold text-white mb-1">Get in Touch</h4>
            <div className="w-6 h-0.5 bg-orange-600 mb-5" />
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <Link
                    to={service.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-base font-semibold text-white mb-1">Newsletter</h4>
            <div className="w-6 h-0.5 bg-orange-600 mb-5" />

            {subscribed ? (
              <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                <Check className="w-4 h-4 flex-shrink-0" />
                Thanks — you're on the list.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold tracking-wide py-3 rounded-lg transition-colors"
                >
                  SIGN UP
                </button>
                <p className="text-xs text-gray-500">
                  Your email is safe with us. We don't spam.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-14 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-center">
            <span className="text-gray-400 text-sm">
              © {new Date().getFullYear()} <span className="text-green-500">Ganza-Inema</span> <span className="text-orange-500">Fair Trade</span>
            </span>
            <span className="hidden md:inline text-gray-600">•</span>
            <span className="text-gray-500 text-sm">All rights reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
