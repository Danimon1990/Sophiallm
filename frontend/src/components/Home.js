import React from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon, BookOpenIcon, ChatBubbleLeftRightIcon, LinkIcon } from '@heroicons/react/24/outline';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Sophia AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md text-sm font-medium"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Main Title */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-full">
              <SparklesIcon className="h-16 w-16 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome, I'm Sophia
          </h1>

          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
            Your AI companion dedicated to helping you integrate the profound concepts
            from Robert De Filippis's books into your life.
          </p>

          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            I'm here to guide you through the philosophical depths of consciousness,
            the embodied mind, and unified thinking with wisdom and clarity.
          </p>

          {/* CTA Buttons */}
          <div className="flex justify-center space-x-4 mb-16">
            <Link
              to="/signup"
              className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Create Account - Get 3 Free Questions
            </Link>
            <Link
              to="/login"
              className="bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Log In
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3 Free Questions</h3>
              <p className="text-gray-600">
                Start your journey with three complimentary questions to explore Robert's concepts
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpenIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Unlimited Access</h3>
              <p className="text-gray-600">
                Purchase the books to unlock infinite conversations and deeper philosophical exploration
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Wise Guidance</h3>
              <p className="text-gray-600">
                I'm trained to provide thoughtful insights that help you integrate these teachings
              </p>
            </div>
          </div>

          {/* Books Section */}
          <div className="bg-white p-10 rounded-2xl shadow-xl mb-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Explore Robert's Books</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-blue-50 p-4 rounded-lg mb-3">
                  <BookOpenIcon className="h-12 w-12 text-blue-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-900">Signals in the Noise</h4>
              </div>
              <div className="text-center">
                <div className="bg-green-50 p-4 rounded-lg mb-3">
                  <BookOpenIcon className="h-12 w-12 text-green-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-900">The Unified Mind</h4>
              </div>
              <div className="text-center">
                <div className="bg-purple-50 p-4 rounded-lg mb-3">
                  <BookOpenIcon className="h-12 w-12 text-purple-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-900">The Embodied Mind</h4>
              </div>
            </div>
            <a
              href="https://robertdefilippis.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-semibold text-lg"
            >
              <LinkIcon className="h-5 w-5" />
              <span>Visit Robert's Website to Purchase Books</span>
            </a>
          </div>

          {/* Footer CTA */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">Ready to begin your philosophical journey?</p>
            <Link
              to="/signup"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 px-10 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Get Started with 3 Free Questions
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2025 Sophia AI - Companion for Robert De Filippis's Philosophical Teachings
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
