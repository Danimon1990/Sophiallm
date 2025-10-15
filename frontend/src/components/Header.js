import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
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
    <header className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Logout Button - Top Right */}
        <div className="absolute top-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>

        {/* Main Title */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 leading-tight">
            Answer Chatbot for Books by<br />
            Author Robert De Filippis
          </h1>

          {/* AI Powered Badge */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <SparklesIcon className="h-5 w-5 text-primary-600" />
            <span className="text-xl font-semibold text-primary-600">AI Powered</span>
          </div>

          {/* Subtitle */}
          <p className="text-lg text-gray-700 mb-1">
            Ask questions about the books
          </p>
          <p className="text-base text-gray-600 italic">
            <span className="font-medium">Signals in the Noise</span>, <span className="font-medium">Unified Mind</span>, <span className="font-medium">The Embodied Mind</span>
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;






