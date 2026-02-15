
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'red' | 'blue';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', variant = 'light' }) => {
  const variants = {
    light: 'glass',
    dark: 'glass-dark text-white',
    red: 'glass-red text-white',
    blue: 'bg-navy/90 backdrop-blur-[15px] border border-white/20 shadow-xl text-white'
  };

  return (
    <div className={`rounded-[2rem] p-6 transition-all duration-300 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
