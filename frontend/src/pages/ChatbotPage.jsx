import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  MessageSquareHeart, 
  Send, 
  Plus, 
  Trash2, 
  Sparkles, 
  Bot, 
  User as UserIcon, 
  ShieldAlert, 
  HelpCircle,
  Clock,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { chatApi } from '../api/chatApi';
import { useAuth } from '../context/AuthContext';

const QUICK_PROMPTS = [
  'Can I drink milk?',
  'Is curd safe with lactose intolerance?',
  'Can I eat banana if I have diabetes?',
  'What foods are in my saved profile?',
  'Give me healthy evening snack options',
  'Is poha good for weight loss?',
];

export default function ChatbotPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlConvId = searchParams.get('id');

  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(urlConvId ? parseInt(urlConvId, 10) : null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Load conversation list
  useEffect(() => {
    loadConversations();
  }, []);

  // When active conversation changes, load its message history
  useEffect(() => {
    if (activeConvId) {
      loadConversationHistory(activeConvId);
      setSearchParams({ id: String(activeConvId) });
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  const loadConversations = async () => {
    try {
      const data = await chatApi.getConversations();
      setConversations(data || []);
      if (!activeConvId && data && data.length > 0) {
        setActiveConvId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  const loadConversationHistory = async (id) => {
    setLoading(true);
    try {
      const conv = await chatApi.getConversation(id);
      setMessages(conv.messages || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
    setSearchParams({});
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation history?')) return;
    try {
      await chatApi.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) {
        handleStartNewConversation();
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const text = inputMessage.trim();
    if (!text || sending) return;

    // Optimistically append user message
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      message_text: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInputMessage('');
    setSending(true);

    try {
      const res = await chatApi.sendMessage(text, activeConvId);
      // Append assistant message
      setMessages((prev) => [...prev, res]);
      if (!activeConvId && res.conversation_id) {
        setActiveConvId(res.conversation_id);
        loadConversations();
      }
    } catch (err) {
      console.error('Chat error', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          message_text: '⚠️ Unable to process your inquiry right now. Please check your connection and retry.',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] min-h-[550px] flex rounded-3xl bg-white border border-[#E5EBE7] shadow-xs overflow-hidden">
      {/* Left Panel: Conversation History */}
      <div className="w-72 border-r border-[#E5EBE7] bg-[#F8FAF8] flex flex-col shrink-0 hidden md:flex">
        {/* New Chat Button */}
        <div className="p-4 border-b border-[#E5EBE7]">
          <button
            onClick={handleStartNewConversation}
            className="w-full py-2.5 px-4 rounded-xl bg-[#145B52] hover:bg-[#0E423B] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Consultation</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-2 text-[10px] font-bold text-[#71807B] uppercase tracking-wider mb-2">
            History
          </p>
          {conversations.length > 0 ? (
            conversations.map((c) => {
              const isSelected = activeConvId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white text-[#145B52] font-semibold border border-[#E5EBE7] shadow-xs'
                      : 'text-[#202C2A] hover:bg-[#F2F6F3]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquareHeart className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#145B52]' : 'text-[#71807B]'}`} />
                    <span className="truncate">{c.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#71807B] hover:text-[#D85C5C] transition-opacity"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-[#71807B]">
              No consultation history yet.
            </div>
          )}
        </div>

        {/* Profile notice at bottom of history */}
        <div className="p-3 border-t border-[#E5EBE7] text-[11px] text-[#71807B]">
          <span className="text-[#145B52] font-semibold">Active Context: </span>
          {user?.full_name ? `${user.full_name}'s Profile` : 'Personalized Health Rules'}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {/* Chat Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#E5EBE7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMobileHistory(true)}
              className="md:hidden p-1.5 rounded-lg border border-[#E5EBE7] text-[#202C2A] hover:bg-[#F2F6F3]"
              title="View consultation history"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-[#145B52] flex items-center justify-center text-white shrink-0">
              <Bot className="w-5 h-5 text-[#F2A65A]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#202C2A]">
                AI Health & Nutrition Assistant
              </h2>
              <p className="text-[11px] text-[#71807B] line-clamp-1">
                Grounded in 1,400+ Indian food items & your health conditions
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF4F2] text-[#145B52] text-xs font-medium border border-[#287C70]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#F2A65A]" />
            <span>Profile-Aware Engine</span>
          </div>
        </div>

        {/* Mobile History Drawer Modal */}
        {showMobileHistory && (
          <div className="fixed inset-0 z-50 bg-black/40 md:hidden flex justify-start">
            <div className="w-72 bg-white h-full flex flex-col p-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE7]">
                <span className="font-bold text-sm text-[#202C2A]">Consultation History</span>
                <button
                  type="button"
                  onClick={() => setShowMobileHistory(false)}
                  className="p-1 rounded-md text-[#71807B] hover:text-[#202C2A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="pt-3 pb-2">
                <button
                  onClick={() => {
                    handleStartNewConversation();
                    setShowMobileHistory(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#145B52] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Consultation</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 pt-2">
                {conversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveConvId(c.id);
                      setShowMobileHistory(false);
                    }}
                    className={`p-2.5 rounded-xl text-xs cursor-pointer flex items-center justify-between ${
                      activeConvId === c.id ? 'bg-[#EBF4F2] text-[#145B52] font-semibold' : 'text-[#202C2A]'
                    }`}
                  >
                    <span className="truncate">{c.title}</span>
                    <button
                      onClick={(e) => handleDeleteConversation(e, c.id)}
                      className="p-1 text-[#71807B] hover:text-[#D85C5C]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F8FAF8]">
          {messages.length === 0 && !loading && (
            <div className="text-center py-12 max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF4F2] text-[#145B52] flex items-center justify-center mx-auto">
                <MessageSquareHeart className="w-6 h-6 text-[#145B52]" />
              </div>
              <h3 className="text-lg font-bold text-[#202C2A]">
                How can I assist your health and diet today?
              </h3>
              <p className="text-xs text-[#71807B] leading-relaxed">
                Ask about specific Indian food items, ingredient suitability, your registered profile conditions, or daily nutrition suggestions.
              </p>

              {/* Prompt Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setInputMessage(prompt);
                    }}
                    className="p-2.5 rounded-xl bg-white hover:bg-[#EBF4F2] border border-[#E5EBE7] text-xs text-[#202C2A] text-left transition-colors flex items-center justify-between"
                  >
                    <span>{prompt}</span>
                    <ArrowRight className="w-3 h-3 text-[#71807B] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-[#145B52] text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-[#F2A65A]" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#145B52] text-white rounded-br-xs whitespace-pre-wrap'
                      : 'bg-white border border-[#E5EBE7] text-[#202C2A] rounded-bl-xs shadow-xs'
                  }`}
                >
                  {isUser ? (
                    <div>{msg.message_text}</div>
                  ) : (
                    <div className="space-y-2 text-[#202C2A]">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 leading-relaxed text-xs sm:text-[13px] last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-[#145B52]">{children}</strong>,
                          ul: ({ children }) => <ul className="my-2 space-y-1 pl-4 list-disc marker:text-[#287C70]">{children}</ul>,
                          ol: ({ children }) => <ol className="my-2 space-y-1 pl-4 list-decimal marker:text-[#287C70]">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed text-xs sm:text-[13px]">{children}</li>,
                        }}
                      >
                        {msg.message_text}
                      </ReactMarkdown>
                    </div>
                  )}
                  <span
                    className={`text-[10px] block text-right mt-2 opacity-70 ${
                      isUser ? 'text-white' : 'text-[#71807B]'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-[#287C70] text-white flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                    {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Typing Indicator */}
          {sending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start items-center"
            >
              <div className="w-8 h-8 rounded-lg bg-[#145B52] text-white flex items-center justify-center text-xs shrink-0">
                <Bot className="w-4 h-4 text-[#F2A65A]" />
              </div>
              <div className="bg-white border border-[#E5EBE7] rounded-2xl px-4 py-3 rounded-bl-xs flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#145B52] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#145B52] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#145B52] animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-[#71807B] ml-2">Evaluating food & profile rules...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#E5EBE7] bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about foods, nutritional safety, or your diet..."
              disabled={sending}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] placeholder-[#71807B] focus:outline-none focus:ring-2 focus:ring-[#145B52]"
            />
            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#145B52] hover:bg-[#0E423B] text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-[#71807B] text-center mt-2">
            HealthMate provides educational dietary context and does not provide clinical medical diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
}

