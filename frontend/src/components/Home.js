import React from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header with Book Covers */}
      <header className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Title */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Answer Chatbot for Books by<br />
              Author Robert De Filippis
            </h1>

            {/* AI Powered Badge */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              <SparklesIcon className="h-6 w-6 text-primary-600" />
              <span className="text-2xl font-semibold text-primary-600">AI Powered</span>
            </div>

            {/* Subtitle */}
            <p className="text-xl text-gray-700 mb-2">
              Ask questions about the books
            </p>
            <p className="text-lg text-gray-600 italic mb-6">
              <span className="font-medium">Signals in the Noise</span>, <span className="font-medium">Unified Mind</span>, <span className="font-medium">The Embodied Mind</span>
            </p>
          </div>

          {/* Book Covers Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
              SophiaLLM
            </h2>
            <p className="text-center text-lg text-gray-600 mb-8">
              Based on a trilogy by Robert De Filippis
            </p>

            {/* Book Covers */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-12">
              <div className="flex flex-col items-center group">
                <div className="relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <img
                    src="https://robertdefilippis.net/wp-content/uploads/2025/05/Signals-in-the-Noise-Robert-Defilipiss.jpg"
                    alt="Signals in the Noise"
                    className="h-64 w-auto object-cover"
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-700">Signals in the Noise</p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <img
                    src="https://robertdefilippis.net/wp-content/uploads/2025/07/TheUnifiedMindEbookCover-scaled.jpg"
                    alt="Unified Mind"
                    className="h-64 w-auto object-cover"
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-700">Unified Mind</p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <img
                    src="https://robertdefilippis.net/wp-content/uploads/2025/08/TheEmbodiedMindEbookCoverRGB-scaled.jpeg"
                    alt="The Embodied Mind"
                    className="h-64 w-auto object-cover"
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-700">The Embodied Mind</p>
              </div>
            </div>

            {/* Authentication Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
              <Link
                to="/signup"
                className="bg-primary-600 text-white hover:bg-primary-700 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto text-center"
              >
                Create Account - Free Access
              </Link>
              <Link
                to="/login"
                className="bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto text-center"
              >
                Log In
              </Link>
            </div>

            {/* Robert's Website Button */}
            <div className="text-center">
              <a
                href="https://robertdefilippis.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-base font-medium shadow-md hover:shadow-lg transition-all"
              >
                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                <span>Visit Robert's Website</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2025 SophiaLLM - AI Chatbot for Robert De Filippis's Philosophical Trilogy
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
