
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
    <div className="flex justify-center min-h-screen bg-champions-gradient font-display overflow-hidden">
      {/* Container principal */}
      <div className="relative w-full h-[100dvh] sm:h-[880px] sm:max-w-[430px] bg-transparent sm:rounded-[3.5rem] overflow-hidden flex flex-col border-x border-slate-100 sm:border-none shadow-2xl">
        
        {/* Área de conteúdo com scroll interno e padding para o menu fixo */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-36">
          {children}
        </div>
        
        {/* MENU INFERIOR FIXO - USANDO FIXED PARA GARANTIR VISIBILIDADE NO VIEWPORT */}
        <div className="fixed bottom-6 left-6 right-6 sm:absolute sm:bottom-8 sm:left-8 sm:right-8 z-[1000] animate-slide-up">
          <nav className="h-20 glass-surface rounded-[2.5rem] flex items-center justify-around px-2 border border-white/80 shadow-[0_20px_50px_-10px_rgba(0,51,160,0.15)]">
            
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
              <div className="flex items-center justify-center w-12 h-full">
                <button 
                  onClick={() => onPageChange(Page.ArenaPanel)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl active:scale-90 ${
                    currentPage === Page.ArenaPanel 
                    ? 'bg-primary text-white scale-110 shadow-primary/30' 
                    : 'bg-white/60 text-navy border border-white/80'
                  }`}
                  title="Painel de Controle"
                >
                  <span className="material-symbols-outlined text-[24px] font-light">podium</span>
                </button>
              </div>
            )}
            
            <NavItem 
              icon="account_balance_wallet" 
              label="Financeiro" 
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
