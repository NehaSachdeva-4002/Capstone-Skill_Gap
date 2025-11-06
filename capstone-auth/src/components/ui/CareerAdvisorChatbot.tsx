// src/components/CareerAdvisorChatbot.tsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{ type: string; preview: string }>;
}

interface ChatbotProps {
  userId: string;
  context: {
    resumeText?: string;
    jobDescription?: string;
    skillGapAnalysis?: any;
    learningRoadmap?: any;
  };
}

const CareerAdvisorChatbot: React.FC<ChatbotProps> = ({ userId, context }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://capstone-backend-env.eba-enkzsfa3.us-east-1.elasticbeanstalk.com/api';

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat session
  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(`${API_BASE_URL}/chatbot/init`, {
          userId,
          context
        });

        setSessionReady(true);
        setSuggestedQuestions(response.data.suggestedQuestions || []);
        
        // Add welcome message
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: "👋 Hi! I'm your AI career advisor. I've reviewed your resume, the job description, and your skill gap analysis. Ask me anything about improving your skills, learning roadmap, or career strategy!",
          timestamp: new Date()
        }]);

      } catch (err: any) {
        setError('Failed to initialize chat. Please try refreshing.');
        console.error('Chat init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && context) {
      initChat();
    }
  }, [userId, context]);

  // Send message with streaming
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: messageText })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      const assistantId = Date.now().toString();
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.token) {
              assistantMessage += data.token;
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantId 
                    ? { ...msg, content: assistantMessage }
                    : msg
                )
              );
            }

            if (data.done) {
              setIsStreaming(false);
              return;
            }

            if (data.error) {
              throw new Error(data.error);
            }
          }
        }
      }

    } catch (err: any) {
      setError('Failed to send message. Please try again.');
      console.error('Send message error:', err);
      setIsStreaming(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
    sendMessage(question);
  };

  if (!sessionReady && isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing your career advisor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20 rounded-xl shadow-2xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden transition-all duration-300 hover:shadow-purple-500/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-shimmer"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <span className="text-3xl animate-bounce">🤖</span>
            <span>AI Career Advisor</span>
            <span className="ml-auto text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/30">
              ✨ LIVE
            </span>
          </h3>
          <p className="text-sm text-purple-100 mt-2 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Powered by LangChain RAG • Context-aware • Real-time guidance
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-purple-50/30 dark:from-gray-900/50 dark:to-purple-950/20">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white transform hover:scale-[1.02]'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-2 border-purple-200 dark:border-purple-800 transform hover:scale-[1.02]'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-200 dark:border-purple-700 text-xs">
                  <span className="text-2xl">🎓</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-300">Career Advisor</span>
                  <span className="ml-auto text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full">AI</span>
                </div>
              )}
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700 text-xs">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <span>📚</span>
                    <span className="font-semibold">Sources:</span>
                    <span>{message.sources.map(s => s.type).join(', ')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-start animate-slideUp">
            <div className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/50 border-2 border-red-300 dark:border-red-700 rounded-2xl p-4 shadow-lg animate-slideUp">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-red-700 dark:text-red-300">Error</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && messages.length === 1 && (
        <div className="px-5 py-4 border-t-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
          <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
            <span>💡</span>
            Try asking me:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(question)}
                className="text-sm px-4 py-2 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-full hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900 dark:hover:to-pink-900 hover:border-purple-400 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md font-medium text-purple-700 dark:text-purple-300"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-5 border-t-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your skills, resume, or learning path..."
            disabled={isStreaming || !sessionReady}
            className="flex-1 px-5 py-3 border-2 border-purple-300 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-300 hover:border-purple-400 text-base shadow-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isStreaming || !sessionReady}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center gap-2"
          >
            {isStreaming ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareerAdvisorChatbot;