import React from 'react';

const ProductCard = ({ title, subtitle, image, children, className = '' }) => {
  return (
    <div className={`outline-card flex flex-col overflow-hidden group p-6 ${className}`}>
      {image && (
        <div className="w-full h-48 mb-6 overflow-hidden rounded-lg bg-gray-100">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-playfair text-2xl font-bold text-[var(--color-ink)] mb-2 group-hover:text-[var(--color-purple-500)] transition-colors duration-300">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[var(--color-ink)]/70 text-sm mb-4">
            {subtitle}
          </p>
        )}
        <div className="text-[var(--color-ink)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
