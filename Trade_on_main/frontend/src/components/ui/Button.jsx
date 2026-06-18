import React from 'react';
import { ArrowRight } from 'lucide-react';

const Button = ({ children, onClick, className = '', type = 'button', disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden bg-[var(--color-ink)] text-[var(--color-cream)] px-8 py-4 rounded-full font-medium text-lg border border-transparent hover:bg-[var(--color-purple-500)] hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <span className="flex items-center justify-center relative">
        <span className="transition-transform duration-300 group-hover:-translate-x-3">
          {children}
        </span>
        <ArrowRight 
          className="absolute right-0 opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" 
          size={20} 
        />
      </span>
    </button>
  );
};

export default Button;
