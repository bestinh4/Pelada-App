
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
    <div className="flex justify-center min-h-screen bg-transparent font-display overflow-hidden">
      <div className="relative w-full h-[100dvh] sm:h-[880px] sm:max-w-[430px] bg-transparent flex flex-col">
        
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-36">
          {children}
        </div>
        
        {/* MENU INFERIOR DOCK PILL */}
        <div className="fixed bottom-8 left-6 right-6 sm:absolute sm:bottom-10 sm:left-10 sm:right-10 z-[1000] animate-slide-up">
          <nav className="h-20 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-around px-4 border border-slate-100 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]">
            
            <NavItem 
              icon="stadium" 
              label="Arena" 
              active={currentPage === Page.Dashboard} 
              onClick={() => onPageChange(Page.Dashboard)} 
            />
            
            <NavItem 
              icon="sports_soccer" 
              label="Elenco" 
              active={currentPage === Page.PlayerList} 
              onClick={() => onPageChange(Page.PlayerList)} 
            />
            
            {isAdmin && (
              <div className="flex items-center justify-center w-14">
                <button 
                  onClick={() => onPageChange(Page.ArenaPanel)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl active:scale-90 ${
                    currentPage === Page.ArenaPanel 
                    ? 'bg-primary text-white scale-110 shadow-primary/40' 
                    : 'bg-slate-50 text-navy border border-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[26px] font-light">podium</span>
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
    className={`flex flex-col items-center justify-center w-12 h-full transition-all duration-500 relative ${active ? 'text-primary' : 'text-slate-300'} group`}
  >
    <div className={`transition-all duration-500 flex flex-col items-center ${active ? 'scale-110 -translate-y-1' : 'group-hover:text-primary/60'}`}>
      <span className={`material-symbols-outlined text-[24px] transition-all duration-500 ${active ? 'fill-1' : ''}`}>
        {icon}
      </span>
      <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1.5 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-0 scale-50'}`}>
        {label}
      </span>
    </div>
    
    {active && (
      <span className="absolute bottom-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(227,6,19,0.5)]"></span>
    )}
  </button>
);

export default Layout;
