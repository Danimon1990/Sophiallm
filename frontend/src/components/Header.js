import React from 'react';
import { BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="flex items-center space-x-2">
            <BookOpenIcon className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bob's Books AI</h1>
              <p className="text-sm text-gray-600">Interactive Chat with Bob's Knowledge</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 bg-primary-100 px-3 py-1 rounded-full">
            <SparklesIcon className="h-4 w-4 text-primary-600" />
            <span className="text-xs font-medium text-primary-700">AI Powered</span>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Ask questions about consciousness, embodied mind, unified mind, and signals in the noise
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Signals in the Noise
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Unified Mind
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              The Embodied Mind
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;



