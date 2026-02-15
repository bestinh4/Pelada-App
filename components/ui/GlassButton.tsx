
import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const GlassButton: React.FC<GlassButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const base = "font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 rounded-2xl";
  
  const variants = {
    primary: "bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110",
    secondary: "bg-navy text-white shadow-lg shadow-navy/20",
    outline: "border-2 border-primary text-primary hover:bg-primary/5",
    glass: "bg-white/10 backdrop-blur-md border border-white/20 text-navy hover:bg-white/20"
  };

  const sizes = {
    sm: "px-4 h-10 text-[8px]",
    md: "px-6 h-12 text-[10px]",
    lg: "px-8 h-14 text-[11px]",
    xl: "px-10 h-16 text-xs"
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
