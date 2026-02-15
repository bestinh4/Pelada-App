
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
  const base = "font-extrabold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 rounded-2xl relative overflow-hidden group";
  
  const variants = {
    primary: "btn-champions-red",
    secondary: "btn-champions-blue",
    outline: "border-2 border-primary text-primary hover:bg-primary/5 shadow-none",
    glass: "bg-white/40 backdrop-blur-md border border-white/60 text-navy hover:bg-white/60 shadow-sm"
  };

  const sizes = {
    sm: "px-4 h-10 text-[8px]",
    md: "px-6 h-12 text-[10px]",
    lg: "px-8 h-14 text-[11px]",
    xl: "px-10 h-16 text-[12px]"
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </button>
  );
};
