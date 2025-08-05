import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo = ({ className = "w-8 h-8" }: LogoProps) => {
  return (
    <div className={`${className} flex items-center justify-center`}>
      {/* Chainfly Logo from PNG */}
      <img 
        src="/Chainfly_logo.png" 
        alt="Chainfly Logo" 
        className="w-full h-full object-contain"
        onError={(e) => {
          // Fallback to text if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = document.createElement('span');
          fallback.className = 'text-primary-600 font-bold text-sm';
          fallback.textContent = 'C';
          target.parentNode?.appendChild(fallback);
        }}
      />
    </div>
  );
};

export default Logo; 