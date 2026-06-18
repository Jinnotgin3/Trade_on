import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircle, PackageX, TrendingDown, MapPinOff } from 'lucide-react';

export default function SkipFeedback({ onDismiss }) {
  // Auto-dismiss after 5 seconds if no interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="absolute bottom-24 left-0 right-0 mx-auto w-11/12 max-w-sm bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-40"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <XCircle className="text-gray-400" size={18} />
          <span className="font-bold text-gray-800 text-sm tracking-tight">Skipped Partner</span>
        </div>
        <button 
          onClick={onDismiss}
          className="text-xs font-bold text-[var(--color-gold)] hover:underline"
        >
          Next Partner →
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mb-3">Help us improve your matches. Why did you skip?</p>
      
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={onDismiss}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-medium transition-colors border border-gray-200"
        >
          <PackageX size={14} /> Wrong Product
        </button>
        <button 
          onClick={onDismiss}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-medium transition-colors border border-gray-200"
        >
          <TrendingDown size={14} /> Low Demand
        </button>
        <button 
          onClick={onDismiss}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-medium transition-colors border border-gray-200"
        >
          <MapPinOff size={14} /> Wrong Region
        </button>
      </div>
    </motion.div>
  );
}
