import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="relative bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center gap-3">
            {/* Logo */}
            <img
              src="https://robertdefilippis.net/wp-content/uploads/2025/05/cropped-logo-webiste.png"
              alt="Robert De Filippis Logo"
              className="h-10 w-10 object-contain"
            />

            {/* Title */}
            <div>
              <h1 className="text-xl font-bold text-gray-900">SophiaLLM</h1>
              <p className="text-xs text-gray-600">AI-Powered Philosophy Assistant</p>
            </div>
          </div>

          {/* Right Side - Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;






