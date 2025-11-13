// components/common/Footer.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleExternalLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center mb-4 cursor-pointer" onClick={() => handleNavigation('/')}>
              <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-lg font-bold text-white">E-Mwananchi</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Empowering Kenyan citizens through transparent governance and community engagement.
            </p>
          </div>

          {/* Platform */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => handleNavigation('/dashboard')}
                  className="text-gray-300 hover:text-green-400 text-sm transition duration-200 hover:underline cursor-pointer"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/browse-reports')}
                  className="text-gray-300 hover:text-green-400 text-sm transition duration-200 hover:underline cursor-pointer"
                >
                  Browse Reports
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/reports/create')}
                  className="text-gray-300 hover:text-green-400 text-sm transition duration-200 hover:underline cursor-pointer"
                >
                  Report Issue
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/government-projects')}
                  className="text-gray-300 hover:text-green-400 text-sm transition duration-200 hover:underline cursor-pointer"
                >
                  Government Projects
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => handleNavigation('/help')}
                  className="text-gray-300 hover:text-green-400 text-sm transition duration-200 hover:underline cursor-pointer"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/contact')}
                  className="text-gray-300 hover:text-green-400 text-sm transition duration-200 hover:underline cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/privacy')}
                  className="text-gray-300 hover:text-green-400 text-sm transition duration-200 hover:underline cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/terms')}
                  className="text-gray-300 hover:text-green-400 text-sm transition duration-200 hover:underline cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Contact
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <p>Email: support@emwananchi.go.ke</p>
              <p>Hotline: 020 123 4567</p>
              <p>Nairobi, Kenya</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} E-Mwananchi Platform. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <span className="text-gray-400 text-sm">
                A Government of Kenya Initiative
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;