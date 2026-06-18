import React from 'react';
import { motion } from 'framer-motion';

const defaultScores = [
  { label: 'Product Compatibility', percentage: 35, color: 'bg-[var(--color-purple-500)]' },
  { label: 'Import Frequency', percentage: 25, color: 'bg-[var(--color-pink-400)]' },
  { label: 'Market Growth Trend', percentage: 20, color: 'bg-[var(--color-gold)]' },
  { label: 'Geographic Proximity', percentage: 10, color: 'bg-[var(--color-green-400)]' },
  { label: 'Buyer Activity', percentage: 10, color: 'bg-[var(--color-ink)]' },
];

const ScoringBar = ({ scores = defaultScores, totalScore = 100 }) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-[var(--color-cream)] border border-[var(--color-ink)]/10 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="font-playfair text-2xl font-bold text-[var(--color-ink)]">Match Score</h3>
          <p className="text-sm text-[var(--color-ink)]/60 font-medium">Algorithm Confidence</p>
        </div>
        <div className="text-4xl font-bold text-[var(--color-purple-500)] font-playfair">
          {totalScore}%
        </div>
      </div>

      <div className="space-y-5">
        {scores.map((score, index) => (
          <div key={score.label} className="relative">
            <div className="flex justify-between text-sm mb-1.5 font-medium">
              <span className="text-[var(--color-ink)]/80">{score.label}</span>
              <span className="text-[var(--color-ink)] font-bold">{score.percentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${score.percentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                className={`h-full rounded-full ${score.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoringBar;
