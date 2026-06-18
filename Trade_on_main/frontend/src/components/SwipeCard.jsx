import { useState } from 'react';
import axios from 'axios';
import { X, Heart, TrendingUp, BrainCircuit, Loader2 } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function SwipeCard({ recommendation, onSwipe, token, userCountry }) {
  const x = useMotionValue(0);

  // Make rotation more dramatic
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const scale = useTransform(x, [-200, 0, 200], [0.9, 1, 0.9]);

  // Stamp opacities
  const likeOpacity = useTransform(x, [20, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -150], [0, 1]);

  const [advice, setAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  const getAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const res = await axios.post('http://localhost:5001/api/analyze-card', {
        user_country: userCountry,
        target_country: recommendation.target_country,
        commodity: recommendation.commodity,
        flow: recommendation.flow,
        score: recommendation.score
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdvice(res.data.analysis);
    } catch (err) {
      setAdvice(`AI Error: ${err.response?.data?.error || err.message}`);
    }
    setLoadingAdvice(false);
  };

  const formatCurrency = (val) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <motion.div
      style={{ x, rotate, scale }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full max-w-sm h-[520px] bg-white rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col"
      whileTap={{ scale: 0.98 }}
    >
      {/* Dramatic Stamps */}
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-12 right-8 z-20 border-4 border-red-500 text-red-500 text-4xl font-black uppercase tracking-widest px-3 py-1 rounded-xl rotate-[15deg] pointer-events-none shadow-sm bg-white/50 backdrop-blur-sm"
      >
        NOPE
      </motion.div>
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-12 left-8 z-20 border-4 border-[var(--color-green-400)] text-[var(--color-green-400)] text-4xl font-black uppercase tracking-widest px-3 py-1 rounded-xl -rotate-[15deg] pointer-events-none shadow-sm bg-white/50 backdrop-blur-sm"
      >
        LIKE
      </motion.div>

      <div className="h-40 bg-[var(--color-cream)] flex items-center justify-center p-6 relative shrink-0 border-b border-gray-100 z-10">
        <h2 className="text-4xl font-bold font-playfair text-[var(--color-ink)] text-center tracking-tight">
          {recommendation.target_country}
        </h2>
        <div className="absolute top-4 right-4 bg-[var(--color-purple-500)]/5 px-3 py-1 rounded-full text-xs font-semibold text-[var(--color-purple-500)] shadow-sm border border-[var(--color-purple-500)]/20">
          {recommendation.score > 1000000 ? 'High Match' : 'Potential'}
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-medium">{recommendation.flow} volume for</p>
          <p className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{recommendation.commodity}</p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
              <p className="text-xs text-gray-500 mb-1 font-medium">Product Match</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[var(--color-purple-500)] h-full" style={{ width: recommendation.metrics?.productMatch || '90%' }}></div>
                </div>
                <span className="text-sm font-bold text-[var(--color-purple-500)]">{recommendation.metrics?.productMatch || '90%'}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
              <p className="text-xs text-gray-500 mb-1 font-medium">Location Match</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[var(--color-gold)] h-full" style={{ width: recommendation.metrics?.locationBias || '75%' }}></div>
                </div>
                <span className="text-sm font-bold text-[var(--color-gold)]">{recommendation.metrics?.locationBias || '75%'}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><TrendingUp size={12} /> Trade Volume / Intent</p>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(recommendation.score)}</p>
              </div>
            </div>
          </div>

          {!advice ? (
            <button
              onClick={getAdvice}
              disabled={loadingAdvice}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--color-purple-500)]/5 text-[var(--color-purple-500)] font-medium hover:bg-[var(--color-purple-500)]/10 border border-[var(--color-purple-500)]/20 text-sm transition-colors"
            >
              {loadingAdvice ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
              {loadingAdvice ? 'Analyzing...' : 'Ask AI Strategist'}
            </button>
          ) : (
            <div className="p-4 bg-[var(--color-purple-500)]/5 rounded-xl border border-[var(--color-purple-500)]/10 text-xs text-[var(--color-ink)]/80 leading-relaxed shadow-sm">
              <p className="text-[var(--color-purple-500)] font-bold mb-1.5 uppercase flex items-center gap-1">
                <BrainCircuit size={12} /> AI Strategist
              </p>
              {advice}
              {advice.startsWith('AI Error') && (
                <button 
                  onClick={(e) => { e.stopPropagation(); getAdvice(); }}
                  className="mt-2 text-[var(--color-purple-500)] font-bold underline flex items-center gap-1 hover:text-[var(--color-purple-700)]"
                >
                  <Loader2 size={10} className={loadingAdvice ? "animate-spin" : ""} /> Retry Analysis
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-8 pt-6 pb-2 mt-auto">
          <button
            onClick={() => onSwipe('left')}
            className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm hover:scale-110 active:scale-95"
          >
            <X size={32} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onSwipe('right')}
            className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-[var(--color-green-400)] hover:bg-[var(--color-green-400)]/10 hover:border-[var(--color-green-400)]/20 transition-all shadow-sm hover:scale-110 active:scale-95"
          >
            <Heart size={32} strokeWidth={2.5} fill="currentColor" className="fill-transparent hover:fill-[var(--color-green-400)]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
