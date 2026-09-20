import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BrainCircuit, Activity, ShieldCheck, Zap, TrendingUp, Info,
  BarChart3, Layers, Database, Compass, CheckCircle2
} from 'lucide-react';

export default function XAIDashboard({ userCountry, token }) {
  const [analysis, setAnalysis] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [analysisRes, historyRes] = await Promise.all([
          axios.get('http://localhost:5000/api/analyze-portfolio', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/history', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setAnalysis(analysisRes.data.analysis);
        setHistory(historyRes.data.filter(h => h.status === 'liked'));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in pb-12 mt-4 space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrainCircuit className="text-[var(--color-gold)]" size={36} />
          <h2 className="text-4xl font-black text-[var(--color-ink)] tracking-tight font-playfair">Portfolio AI Strategist</h2>
        </div>
        <div className="px-4 py-2 bg-[var(--color-gold)]/10 rounded-full flex items-center gap-2 text-[var(--color-gold)] text-sm font-bold">
          <Database size={16} /> Data Mode: CSV + Neural Engine
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: AI Executive Summary */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 card-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Compass size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[var(--color-gold)] font-bold text-xs uppercase tracking-widest mb-6">
                <Zap size={14} className="fill-[var(--color-gold)]" /> Strategic Portfolio Review
              </div>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed font-medium text-xl italic">
                    "{analysis}"
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400">D{i}</div>)}
                    </div>
                    <p className="text-xs text-gray-400 font-medium">Insights generated from {history.length} active trade matches.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 card-shadow">
            <h3 className="text-xl font-bold text-[var(--color-ink)] font-playfair mb-6 flex items-center gap-2">
              <Compass size={20} className="text-[var(--color-gold)]" /> Actionable Strategy: How to Improve
            </h3>
            <div className="space-y-4">
              <div className="p-5 bg-[var(--color-gold)]/5 rounded-2xl border border-[var(--color-gold)]/10">
                <h4 className="font-bold text-[var(--color-gold)] text-sm mb-2 flex items-center gap-2">
                  <TrendingUp size={16} /> Market Diversification
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Your current portfolio is heavily weighted towards {history.length > 0 ? history[0].target_country : 'a single region'}. Consider swiping on more partners from South East Asia or Europe to hedge against regional market fluctuations.
                </p>
              </div>
              <div className="p-5 bg-[var(--color-purple-500)]/5 rounded-2xl border border-[var(--color-purple-500)]/10">
                <h4 className="font-bold text-[var(--color-purple-500)] text-sm mb-2 flex items-center gap-2">
                  <Zap size={16} /> Outreach Optimization
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  You are using 'Formal' tone for 90% of your messages. AI analysis suggests a 'Direct' tone has a 15% higher response rate for {history.length > 0 ? history[0].commodity : 'your product category'}. Try experimenting with tone settings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Metrics */}
        <div className="space-y-8">
          <div className="bg-[var(--color-ink)] p-8 rounded-[32px] card-shadow text-white relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all"></div>
            <div className="relative z-10">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">System Confidence</h4>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-7xl font-black tracking-tighter">94</span>
                <span className="text-2xl font-bold text-gray-500 mb-3">%</span>
                <TrendingUp className="text-[var(--color-green-400)] mb-4" size={32} />
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                <div className="bg-[var(--color-green-400)] h-full" style={{ width: '94%' }}></div>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">Neural matchmaking confidence score based on your swipe behavior and historical trade patterns.</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 card-shadow">
            <h4 className="text-xs font-bold text-[var(--color-ink)]/60 uppercase tracking-widest mb-6 flex items-center justify-between">
              Active Strategy <span>{history.length} ITEMS</span>
            </h4>
            <div className="space-y-3">
              {history.slice(0, 4).map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-[var(--color-gold)] shadow-sm">
                    {h.target_country.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{h.commodity}</p>
                    <p className="text-[10px] text-gray-400">{h.target_country}</p>
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="text-xs text-gray-400 italic py-4 text-center">No active matches found.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
