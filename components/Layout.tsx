
import React from 'react';
import { Page } from '../types.ts';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onPageChange: (page: Page) => void;
  currentUserRole?: 'admin' | 'player';
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange, currentUserRole }) => {
  if (currentPage === Page.Login || currentPage === Page.Onboarding) return <>{children}</>;

  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="flex justify-center min-h-screen sm:py-8 bg-champions-gradient font-display">
      <div className="relative w-full sm:max-w-[430px] sm:h-[880px] bg-transparent sm:rounded-[3.5rem] overflow-hidden flex flex-col transition-all duration-1000">
        
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {children}
          <div className="h-44"></div>
        </div>
        
        {/* MENU INFERIOR CRYSTAL GLASS - ALINHAMENTO UNIFICADO */}
        <div className="absolute bottom-8 left-6 right-6 z-[100] animate-slide-up">
          <nav className="h-20 glass-surface rounded-[2.5rem] flex items-center justify-around px-2 border border-white/80">
            
            <NavItem 
              icon="stadium" 
              label="Arena" 
              active={currentPage === Page.Dashboard} 
              onClick={() => onPageChange(Page.Dashboard)} 
            />
            
            <NavItem 
              icon="sports_soccer" 
              label="Squad" 
              active={currentPage === Page.PlayerList} 
              onClick={() => onPageChange(Page.PlayerList)} 
            />
            
            {isAdmin && (
              <div className="flex items-center justify-center w-12 h-full">
                <button 
                  onClick={() => onPageChange(Page.ArenaPanel)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl active:scale-90 ${
                    currentPage === Page.ArenaPanel 
                    ? 'bg-primary text-white scale-110 shadow-primary/30' 
                    : 'bg-white/60 text-navy border border-white/80'
                  }`}
                  title="Painel Live"
                >
                  <span className="material-symbols-outlined text-[24px] font-light">podium</span>
                </button>
              </div>
            )}
            
            <NavItem 
              icon="account_balance_wallet" 
              label="Cofre" 
              active={currentPage === Page.Ranking} 
              onClick={() => onPageChange(Page.Ranking)} 
            />
            
            <NavItem 
              icon="person" 
              label="Perfil" 
              active={currentPage === Page.Profile} 
              onClick={() => onPageChange(Page.Profile)} 
            />

          </nav>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, active, onClick, label }: { icon: string, active: boolean, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-14 h-full transition-all duration-500 relative ${active ? 'text-navy' : 'text-slate-400'} group`}
  >
    <div className={`transition-all duration-500 flex flex-col items-center ${active ? 'scale-110 -translate-y-1' : 'group-hover:text-navy/60'}`}>
      <span className={`material-symbols-outlined text-[24px] transition-all duration-500 ${active ? 'fill-1 text-primary' : ''}`}>
        {icon}
      </span>
      <span className={`text-[7px] font-black uppercase tracking-[0.2em] mt-1.5 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-0 scale-50'}`}>
        {label}
      </span>
    </div>
    
    {active && (
      <span className="absolute bottom-2 w-1 h-1 bg-primary rounded-full shadow-[0_0_12px_rgba(200,16,46,0.6)] animate-pulse"></span>
    )}
  </button>
);

export default Layout;
