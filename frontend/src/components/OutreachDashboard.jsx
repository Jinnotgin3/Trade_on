import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Filter, Send, MoreVertical, Paperclip, Smile,
  User, CheckCheck, Clock, Mail, Globe, BrainCircuit,
  MessageSquare, ChevronRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OutreachDashboard = ({ token }) => {
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/outreach-messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
      if (res.data.length > 0) setSelectedChat(res.data[res.data.length - 1]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(m =>
    m.target_country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.commodity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-purple-500)]" size={40} />
      </div>
    );
  }

  return (
    <div className="w-full h-[700px] glass rounded-[2.5rem] flex overflow-hidden card-shadow border border-white/50">
      {/* Sidebar - Chat List */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-white">
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Message Hub</h2>
            <div className="flex gap-4 text-gray-500">
              <MessageSquare size={20} className="cursor-pointer hover:text-gray-700" />
              <MoreVertical size={20} className="cursor-pointer hover:text-gray-700" />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search or start new chat"
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border-none focus:ring-1 focus:ring-[var(--color-purple-500)] outline-none text-sm shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm italic">No conversations yet.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg._id}
                onClick={() => setSelectedChat(msg)}
                className={`p-4 mx-4 mb-2 rounded-2xl cursor-pointer transition-all flex items-center gap-4 ${selectedChat?._id === msg._id ? 'bg-white shadow-md border-l-4 border-[var(--color-purple-500)]' : 'hover:bg-white/50'}`}
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-cream)] flex items-center justify-center text-[var(--color-purple-500)] shrink-0 font-bold">
                  {msg.target_country.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm truncate">Apex {msg.target_country}</h3>
                    <span className="text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{msg.commodity}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-purple-500)]/10 flex items-center justify-center text-[var(--color-purple-500)]">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">Apex Imports {selectedChat.target_country}</h3>
                  <p className="text-xs text-[var(--color-green-400)] font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-green-400)] animate-pulse"></span> Online
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="p-2 hover:bg-white rounded-full text-gray-400 transition-colors border border-transparent hover:border-gray-100">
                  <Mail size={20} />
                </button>
                <button className="p-2 hover:bg-white rounded-full text-gray-400 transition-colors border border-transparent hover:border-gray-100">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#E5DDD5] relative">
              {/* WhatsApp background pattern (abstracted) */}
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

              <div className="flex flex-col items-center mb-8 relative z-10">
                <span className="px-3 py-1 bg-[#d1f4ff] rounded-lg text-[11px] font-bold text-blue-800 uppercase tracking-widest shadow-sm">
                  Communication Started {new Date(selectedChat.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Bot Info Message */}
              <div className="flex justify-center">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl max-w-sm text-center">
                  <p className="text-xs text-blue-600 font-medium">
                    This outreach was generated with <span className="font-bold">AI Strategist</span> in {selectedChat.tone} tone.
                  </p>
                </div>
              </div>

              {/* Sent Message */}
              <div className="flex justify-end">
                <div className="max-w-md bg-[var(--color-purple-500)] text-white p-5 rounded-2xl rounded-tr-none shadow-lg relative">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedChat.messageContent}</p>
                  <div className="flex justify-end items-center gap-1 mt-2">
                    <span className="text-[10px] opacity-70">
                      {new Date(selectedChat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <CheckCheck size={14} className="opacity-70" />
                  </div>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-xs bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm italic text-gray-400 text-xs">
                  Awaiting buyer response...
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100">
              <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <button className="p-2 text-gray-400 hover:text-gray-600"><Smile size={20} /></button>
                <button className="p-2 text-gray-400 hover:text-gray-600"><Paperclip size={20} /></button>
                <input
                  type="text"
                  placeholder="Type a follow-up message..."
                  className="flex-1 bg-transparent border-none outline-none text-sm py-2"
                />
                <button className="w-10 h-10 rounded-full bg-[var(--color-purple-500)] flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-opacity">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
              <BrainCircuit size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Prospect</h3>
            <p className="text-gray-500 text-sm max-w-xs">Review your AI-generated outreach history and manage your communications from this engine.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutreachDashboard;
