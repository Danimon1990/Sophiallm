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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
      </div>
    </div>
  );
};

export default ChatInterface;






