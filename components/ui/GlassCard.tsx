
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'red' | 'blue';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', variant = 'light' }) => {
  const baseStyle = "rounded-[2rem] p-6 transition-all duration-500 glass-surface";
  
  const variants = {
    light: "",
    dark: "bg-navy-deep/90 border-white/10 text-white shadow-2xl",
    red: "bg-primary/90 border-white/20 text-white shadow-glow-red",
    blue: "bg-navy/90 border-white/20 text-white shadow-elite"
  };

  return (
    <div className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
