import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, UserIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { auth } from '../firebase';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm Sophia, Robert De Filippis's AI assistant. I'm here to help you explore the philosophical concepts from his books - 'Signals in the Noise,' 'Unified Mind,' and 'The Embodied Mind.' I can answer questions about consciousness, embodiment, spiritual practices, and unified thinking based directly on what Robert has written. What would you like to know?",
      timestamp: new Date(),
      sources: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

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

    try {
      // Get fresh Firebase auth token (tokens expire after 1 hour)
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      const token = await currentUser.getIdToken(true); // Force refresh

      // Connect to RAG backend with authentication
      const response = await fetch('https://sophiallm-backend-786509496415.us-central1.run.app/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

  const getBookColor = (bookTitle) => {
    if (bookTitle.includes('Signals')) return 'bg-blue-100 text-blue-800';
    if (bookTitle.includes('Unified')) return 'bg-green-100 text-green-800';
    if (bookTitle.includes('Embodied')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Chat with Sophia</h2>
        <p className="text-gray-600">Ask questions about Robert De Filippis's trilogy: <span className="italic">Signals in the Noise, Unified Mind, The Embodied Mind</span></p>
      </div>

      {/* Chat Container with Glassmorphism */}
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200 overflow-hidden mb-8">
        {/* Messages Area */}
        <div className="p-6 h-96 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 message-fade-in ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user'
                  ? 'bg-gray-300 text-gray-600'
                  : 'bg-gradient-to-br from-purple-600 to-blue-500 text-white'
              }`}>
                {message.type === 'user' ? (
                  <UserIcon className="h-4 w-4" />
                ) : (
                  <BookOpenIcon className="h-4 w-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-5 py-3 ${
                  message.type === 'user'
                    ? 'bg-gray-100'
                    : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'
                }`}>
                  <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{message.content}</p>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Sources:</p>
                      <div className="space-y-1">
                        {message.sources.map((source, index) => (
                          <div key={index} className="text-xs">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-2 ${getBookColor(source.book_title)}`}>
                              {source.book_title}
                            </span>
                            <span className="text-gray-600">
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
        <div className="p-4 bg-gray-50/50 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question about the books..."
              className="flex-1 px-5 py-3 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:border-purple-600 focus:ring-3 focus:ring-purple-100 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white hover:scale-105 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>

          {/* Suggested Questions */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 font-medium mb-3">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInputMessage("What is consciousness according to Robert?")}
                className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md transition-all"
              >
                <span>What is consciousness according to Robert?</span>
                <svg
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              <button
                onClick={() => setInputMessage("How does the embodied mind work?")}
                className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md transition-all"
              >
                <span>How does the embodied mind work?</span>
                <svg
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              <button
                onClick={() => setInputMessage("What is the goal of the author's trilogy?")}
                className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md transition-all"
              >
                <span>What is the goal of the author's trilogy?</span>
                <svg
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Book Covers Section - Below Chat */}
      <div className="mt-12 mb-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          SophiaLLM
        </h2>
        <p className="text-center text-lg text-gray-600 mb-8">
          Based on a trilogy by Robert De Filippis
        </p>

        {/* Book Covers */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
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

        {/* Visit Robert's Website Button */}
        <div className="mt-12 text-center">
          <a
            href="https://robertdefilippis.net"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-purple-600 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            <span>Visit Robert's Website</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;






