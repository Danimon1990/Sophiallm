import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, UserIcon, BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline';
import RedeemCode from './RedeemCode';

const ChatInterface = () => {
  // Get user from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : {
      questionsAsked: 0,
      questionsRemaining: 3,
      hasUnlimitedAccess: false,
      ownedBooks: []
    };
  });

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm Sophia, your AI companion for exploring Robert De Filippis's philosophical teachings. I'm here to help you integrate the profound concepts from his books into your life. What would you like to explore today?",
      timestamp: new Date(),
      sources: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Handler for successful code redemption
  const handleRedeemSuccess = (updatedUser) => {
    setUser(updatedUser);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    // Check question limit (unless they have unlimited access)
    if (!user.hasUnlimitedAccess && user.questionsAsked >= 3) {
      const limitMessage = {
        id: Date.now(),
        type: 'bot',
        content: "You've used your 3 free questions! To continue exploring Robert's philosophical teachings, please redeem a book access code above or purchase one of his books to unlock unlimited access.",
        timestamp: new Date(),
        sources: []
      };
      setMessages(prev => [...prev, limitMessage]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      sources: []
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Update user question tracking
    const updatedUser = {
      ...user,
      questionsAsked: user.questionsAsked + 1,
      questionsRemaining: user.hasUnlimitedAccess ? 999 : Math.max(0, 3 - (user.questionsAsked + 1))
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    try {
      // Connect to RAG backend
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: inputMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.answer || "I'm sorry, I couldn't process your question. Please try again.",
        timestamp: new Date(),
        sources: data.sources || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm having trouble connecting to the knowledge base. Please make sure the RAG backend is running and try again.",
        timestamp: new Date(),
        sources: []
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getBookColor = (bookTitle) => {
    if (bookTitle.includes('Signals')) return 'bg-blue-100 text-blue-800';
    if (bookTitle.includes('Unified')) return 'bg-green-100 text-green-800';
    if (bookTitle.includes('Embodied')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Redeem Code Component */}
      <RedeemCode user={user} onRedeemSuccess={handleRedeemSuccess} />

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Question Counter Banner */}
        {!user.hasUnlimitedAccess && (
          <div className={`px-6 py-3 text-center text-sm font-medium ${
            user.questionsAsked >= 3
              ? 'bg-red-50 text-red-700'
              : user.questionsAsked >= 2
              ? 'bg-yellow-50 text-yellow-700'
              : 'bg-indigo-50 text-indigo-700'
          }`}>
            {user.questionsAsked >= 3 ? (
              <>
                <span className="font-semibold">No questions remaining.</span> Redeem a book code above for unlimited access!
              </>
            ) : (
              <>
                <SparklesIcon className="inline h-4 w-4 mr-1" />
                <span className="font-semibold">{user.questionsRemaining} free question{user.questionsRemaining !== 1 ? 's' : ''} remaining</span>
              </>
            )}
          </div>
        )}

        {/* Unlimited Access Banner */}
        {user.hasUnlimitedAccess && (
          <div className="px-6 py-3 text-center text-sm font-medium bg-green-50 text-green-700">
            <SparklesIcon className="inline h-4 w-4 mr-1" />
            <span className="font-semibold">Unlimited Access</span> - Thank you for your support!
          </div>
        )}

        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {message.type === 'user' ? (
                    <UserIcon className="h-5 w-5" />
                  ) : (
                    <BookOpenIcon className="h-5 w-5" />
                  )}
                </div>
                <div className={`px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </p>
                  
                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-2">Sources:</p>
                      <div className="space-y-1">
                        {message.sources.map((source, index) => (
                          <div key={index} className="text-xs">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-2 ${getBookColor(source.book_title)}`}>
                              {source.book_title}
                            </span>
                            <span className="text-gray-500">
                              {source.chapter && `Chapter: ${source.chapter}`}
                              {source.similarity && ` (${(source.similarity * 100).toFixed(1)}% match)`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex space-x-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <BookOpenIcon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question about Bob's books..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              <span>Send</span>
            </button>
          </form>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Try asking:</span>
            <button
              onClick={() => setInputMessage("What is consciousness according to Bob?")}
              className="text-xs text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-1 rounded"
            >
              "What is consciousness according to Bob?"
            </button>
            <button
              onClick={() => setInputMessage("How does the embodied mind work?")}
              className="text-xs text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-1 rounded"
            >
              "How does the embodied mind work?"
            </button>
            <button
              onClick={() => setInputMessage("What are signals in the noise?")}
              className="text-xs text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-1 rounded"
            >
              "What are signals in the noise?"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;



