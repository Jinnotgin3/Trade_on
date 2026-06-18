import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  BarChart3, TrendingUp, Users, ArrowUpRight, ArrowDownLeft,
  Activity, MessageSquare, Search, Send, MapPin, Tag, Clock,
  CheckCircle2, PieChart, Globe, Mail
} from 'lucide-react';

export default function AnalyticsDashboard({ token }) {
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    totalViewed: 0,
    rightSwipes: 0,
    leftSwipes: 0,
    ratio: 0,
    outreachCount: 0,
    topRegions: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'messages'
  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [historyRes, messagesRes, statsRes] = await Promise.all([
          axios.get('http://localhost:5001/api/history', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5001/api/outreach-messages', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5001/api/stats', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setHistory(historyRes.data);
        setMessages(messagesRes.data);
        setStats(statsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedContact, activeTab]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const res = await axios.post('http://localhost:5001/api/send-outreach', {
        target_country: selectedContact.target_country,
        commodity: selectedContact.commodity,
        messageContent: newMessage,
        tone: 'Manual Follow-up'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([...messages, res.data.message]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="glass p-10 rounded-3xl w-full text-center max-w-lg card-shadow mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Analytics & Messages</h2>
        <p className="text-gray-500">Please login to view your analytics and outreach messages.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin text-[var(--color-gold)]">
            <Activity size={48} />
          </div>
          <p className="text-gray-400 font-medium animate-pulse">Synchronizing trade data...</p>
        </div>
      </div>
    );
  }

  // Generate Unique Contacts
  const contacts = history.reduce((acc, h) => {
    const id = `${h.target_country}-${h.commodity}`;
    if (!acc.find(c => c.id === id)) {
      acc.push({ ...h, id });
    }
    return acc;
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in pb-12 mt-4 flex flex-col h-[calc(100vh-120px)]">
      {/* Tabs */}
      <div className="flex gap-8 mb-6 border-b border-gray-200 shrink-0">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 pb-4 px-2 border-b-2 font-bold transition-all ${activeTab === 'overview' ? 'border-[var(--color-gold)] text-[var(--color-gold)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <BarChart3 size={20} />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 pb-4 px-2 border-b-2 font-bold transition-all ${activeTab === 'messages' ? 'border-[var(--color-gold)] text-[var(--color-gold)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <MessageSquare size={20} />
          Messages Hub
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
          {/* Top Row Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Viewed</p>
              <h3 className="text-3xl font-black text-gray-900">{stats.totalViewed}</h3>
              <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-gray-400 h-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow">
              <p className="text-xs font-bold text-[var(--color-purple-500)] uppercase tracking-widest mb-2">Accepted (Right)</p>
              <h3 className="text-3xl font-black text-[var(--color-purple-500)]">{stats.rightSwipes}</h3>
              <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-[var(--color-purple-500)] h-full" style={{ width: `${stats.ratio}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow">
              <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Skipped (Left)</p>
              <h3 className="text-3xl font-black text-red-500">{stats.leftSwipes}</h3>
              <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-red-400 h-full" style={{ width: `${100 - stats.ratio}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow">
              <p className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-widest mb-2">Outreach Sent</p>
              <h3 className="text-3xl font-black text-[var(--color-gold)]">{stats.outreachCount}</h3>
              <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-[var(--color-gold)] h-full" style={{ width: stats.rightSwipes > 0 ? `${(stats.outreachCount / stats.rightSwipes) * 100}%` : '0%' }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Acceptance Ratio Card */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <PieChart size={20} className="text-gray-400" /> Swipe Engagement
              </h3>
              <div className="flex items-center gap-8">
                <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#F1F5F9" strokeWidth="4"></circle>
                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="var(--color-purple-500)" strokeWidth="4" strokeDasharray={`${stats.ratio}, 100`}></circle>
                  </svg>
                  <span className="absolute text-2xl font-black text-gray-900">{stats.ratio}%</span>
                </div>
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[var(--color-purple-500)]"></div> Accepted
                    </span>
                    <span className="text-sm font-bold text-gray-900">{stats.rightSwipes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div> Skipped
                    </span>
                    <span className="text-sm font-bold text-gray-900">{stats.leftSwipes}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Regions Card */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Globe size={20} className="text-gray-400" /> Top Target Regions
              </h3>
              <div className="space-y-4">
                {stats.topRegions.length > 0 ? stats.topRegions.map((region, i) => (
                  <div key={region.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}.</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm font-bold text-gray-700 mb-1">
                        <span>{region.name}</span>
                        <span>{region.count} matches</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[var(--color-gold)] h-full" style={{ width: `${(region.count / stats.rightSwipes) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-400 text-sm text-center py-4 italic">No region data yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Activity Logs Section */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-gray-400" /> Recent Outreach Logs
            </h3>
            <div className="space-y-3">
              {messages.slice(-5).reverse().map((msg, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white transition-colors cursor-default group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                      <Mail size={18} className="text-[var(--color-gold)]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Email to {msg.target_country}</p>
                      <p className="text-xs text-gray-500 line-clamp-1 max-w-md">{msg.messageContent}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</p>
                    <span className="text-[10px] font-bold text-[var(--color-purple-500)] uppercase tracking-widest">SENT</span>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-gray-400 py-6 italic text-sm">No outreach activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="flex-1 flex overflow-hidden bg-white rounded-3xl border border-gray-200 card-shadow">
          {/* Left Pane - Contacts List */}
          <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
            <div className="p-4 border-b border-gray-100 bg-white">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 border-none outline-none text-sm text-gray-700 focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {contacts.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No matches found.</div>
              ) : (
                contacts.map(contact => {
                  const contactMsgs = messages.filter(m => m.target_country === contact.target_country && m.commodity === contact.commodity);
                  const lastMsg = contactMsgs.length > 0 ? contactMsgs[contactMsgs.length - 1] : null;
                  const isSelected = selectedContact?.id === contact.id;

                  return (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`p-4 border-b border-gray-50 cursor-pointer transition-colors flex gap-3 ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shrink-0 border border-white shadow-sm font-bold text-gray-600">
                        {contact.target_country.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-semibold text-gray-900 truncate">Apex {contact.target_country}</h4>
                          {lastMsg && (
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {new Date(lastMsg.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mb-1 flex items-center gap-1">
                          <Tag size={10} /> {contact.commodity}
                        </p>
                        <p className="text-xs text-gray-600 truncate opacity-80">
                          {lastMsg ? lastMsg.messageContent : 'No outreach sent yet.'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane - Chat Window */}
          {selectedContact ? (
            <div className="w-2/3 flex flex-col bg-[var(--color-cream)]/30">
              {/* Chat Header */}
              <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center gap-4 shrink-0 shadow-sm z-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center font-bold text-gray-600 shadow-sm border border-white">
                  {selectedContact.target_country.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">Apex Imports {selectedContact.target_country}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {selectedContact.target_country}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="flex items-center gap-1"><Activity size={12} /> {selectedContact.flow}</span>
                  </p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Initial Match System Message */}
                <div className="flex justify-center">
                  <div className="bg-[var(--color-purple-500)]/10 text-[var(--color-purple-500)] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm border border-[var(--color-purple-500)]/20">
                    <CheckCircle2 size={14} />
                    Matched for {selectedContact.commodity}
                  </div>
                </div>

                {messages.filter(m => m.target_country === selectedContact.target_country && m.commodity === selectedContact.commodity).map((msg, idx) => (
                  <div key={idx} className="flex justify-end">
                    <div className="max-w-[75%] bg-[var(--color-ink)] text-white rounded-2xl rounded-tr-sm p-4 shadow-md">
                      <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide flex justify-between">
                        <span>{msg.tone || 'Formal Outreach'}</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.messageContent}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-[var(--color-gold)] focus-within:ring-1 focus-within:ring-[var(--color-gold)] transition-all">
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a follow-up message..."
                    className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 text-sm p-2 custom-scrollbar text-gray-700"
                    rows="2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 bg-[var(--color-ink)] text-white rounded-xl hover:bg-black disabled:opacity-50 transition-all shrink-0 mb-0.5 mr-0.5 shadow-sm"
                  >
                    <Send size={18} />
                  </button>
                </form>
                <p className="text-[10px] text-gray-400 mt-2 text-center">Press Enter to send, Shift + Enter for new line.</p>
              </div>
            </div>
          ) : (
            <div className="w-2/3 flex flex-col items-center justify-center bg-[var(--color-cream)]/30 text-gray-400 p-10 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <MessageSquare size={32} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Your Outreach Hub</h3>
              <p className="text-sm max-w-sm">Select a contact from the left pane to view pass records and send outreach messages.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
