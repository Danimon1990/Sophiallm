import React, { useState } from 'react';
import { KeyIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const RedeemCode = ({ user, onRedeemSuccess }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Book codes mapping - In production, this should be validated on the backend
  const BOOK_CODES = {
    'SIGNALS2024': {
      id: 'signals-in-noise',
      name: 'Signals in the Noise',
      color: 'blue'
    },
    'UNIFIED2024': {
      id: 'unified-mind',
      name: 'Unified Mind',
      color: 'green'
    },
    'EMBODIED2024': {
      id: 'embodied-mind',
      name: 'The Embodied Mind',
      color: 'purple'
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const upperCode = code.toUpperCase().trim();

      // Validate code
      const bookData = BOOK_CODES[upperCode];

      if (!bookData) {
        setMessage({
          type: 'error',
          text: 'Invalid code. Please check and try again.'
        });
        setLoading(false);
        return;
      }

      // Check if already redeemed
      if (user.ownedBooks && user.ownedBooks.includes(bookData.id)) {
        setMessage({
          type: 'error',
          text: `You already have access to "${bookData.name}"!`
        });
        setLoading(false);
        return;
      }

      // Update user data
      const updatedUser = {
        ...user,
        ownedBooks: [...(user.ownedBooks || []), bookData.id],
        hasUnlimitedAccess: true // Grant unlimited access when any book is purchased
      };

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage({
        type: 'success',
        text: `Success! You now have unlimited access to "${bookData.name}"!`
      });

      setCode('');

      // Notify parent component
      if (onRedeemSuccess) {
        onRedeemSuccess(updatedUser);
      }

      // Reload page after 2 seconds to update UI
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Redeem error:', error);
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <KeyIcon className="h-6 w-6 text-indigo-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Redeem Book Access Code</h2>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Enter the code from your purchased book to unlock unlimited access.
      </p>

      {/* Owned Books Display */}
      {user.ownedBooks && user.ownedBooks.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-800 mb-2">Your Books:</p>
          <div className="flex flex-wrap gap-2">
            {user.ownedBooks.map((bookId) => {
              const book = Object.values(BOOK_CODES).find(b => b.id === bookId);
              return book ? (
                <span
                  key={bookId}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${book.color}-100 text-${book.color}-800`}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  {book.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      <form onSubmit={handleRedeem} className="space-y-4">
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your book code"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
            disabled={loading}
            required
          />
        </div>

        {message.text && (
          <div className={`p-3 rounded-lg flex items-center ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 mr-2" />
            ) : (
              <XCircleIcon className="h-5 w-5 mr-2" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Redeeming...' : 'Redeem Code'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Where to find your code:</strong> Your unique access code is included with your book purchase.
          Check the inside cover or your purchase confirmation email.
        </p>
      </div>
    </div>
  );
};

export default RedeemCode;
