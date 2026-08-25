import React from 'react';
import { Mail, Phone, MapPin, Gift } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      className="relative bg-gray-800 text-white"
      style={{ clipPath: 'polygon(0 3%, 60% 20%, 88% 3%, 100% 7%, 100% 100%, 0 100%)' }}
    >
      <div className="container mx-auto px-4 pt-24 pb-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-16">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-white" />
              </span>
              <span className="font-display text-xl font-semibold leading-tight">
                <span className="text-green-300">Ganza-Inema</span><br />
                <span className="text-orange-300">Fair Trade</span>
              </span>
            </div>
            <p className="text-gray-100 text-sm leading-relaxed">
              Supporting the Kanombe Sector — savings groups, training, and seed capital funded by every sale.
            </p>
          </div>

          {/* Contact */}
          <div className="md:text-right">
            <h4 className="text-sm font-semibold text-white mb-1">Get in Touch</h4>
            <div className="w-6 h-0.5 bg-orange-600 mb-4 md:ml-auto" />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 md:justify-end text-gray-100">
                <MapPin className="w-4 h-4 text-orange-300 flex-shrink-0 md:order-2" />
                <span className="text-sm">Kigali, Rwanda</span>
              </div>
              <a href="tel:+250781546413" className="flex items-center gap-2.5 md:justify-end text-gray-100 hover:text-white transition-colors w-fit md:ml-auto">
                <Phone className="w-4 h-4 text-orange-300 flex-shrink-0 md:order-2" />
                <span className="text-sm">+250 781 546 413</span>
              </a>
              <a href="mailto:haricbuz@gmail.com" className="flex items-center gap-2.5 md:justify-end text-gray-100 hover:text-white transition-colors w-fit md:ml-auto">
                <Mail className="w-4 h-4 text-orange-300 flex-shrink-0 md:order-2" />
                <span className="text-sm">haricbuz@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-6 border-t border-white/20 text-center">
          <span className="text-gray-200 text-sm">
            © {new Date().getFullYear()} <span className="text-green-300">Ganza-Inema</span> <span className="text-orange-300">Fair Trade</span>. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
