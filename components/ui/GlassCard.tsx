
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'red' | 'blue';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', variant = 'light' }) => {
  const baseStyle = "rounded-[2rem] p-6 transition-all duration-500 glass-panel";
  
  const variants = {
    light: "",
    dark: "bg-slate-900/90 border-white/10 text-white",
    red: "bg-primary/90 border-white/20 text-white shadow-red-glow",
    blue: "bg-navy/90 border-white/20 text-white shadow-premium"
  };

  return (
    <div className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
