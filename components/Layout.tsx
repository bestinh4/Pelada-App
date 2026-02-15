
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
    <div className="flex justify-center min-h-screen sm:py-8 bg-slate-100/50">
      {/* 
          Main Responsive Wrapper
      */}
      <div className="relative w-full sm:max-w-[430px] sm:h-[880px] bg-white sm:rounded-[3rem] sm:shadow-2xl overflow-hidden flex flex-col sm:border-[8px] sm:border-white ring-1 ring-slate-100 transition-all duration-700">
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#F9FBFC]">
          {children}
          {/* Espaçador generoso para o menu flutuante não cobrir o conteúdo final */}
          <div className="h-44"></div>
        </div>
        
        {/* Futuristic Floating Bottom Dock - White Theme */}
        <div className="absolute bottom-6 left-6 right-6 z-[100] animate-slide-up stagger-5">
          <nav className="h-20 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,56,118,0.25)] flex items-center justify-around px-4">
            <NavItem icon="dashboard" label="Home" active={currentPage === Page.Dashboard} onClick={() => onPageChange(Page.Dashboard)} />
            <NavItem icon="groups" label="Squad" active={currentPage === Page.PlayerList} onClick={() => onPageChange(Page.PlayerList)} />
            
            {isAdmin && (
              <div className="relative">
                <button 
                  onClick={() => onPageChange(Page.CreateMatch)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-90 hover:scale-105 ${currentPage === Page.CreateMatch ? 'bg-navy text-white rotate-45 scale-110' : 'bg-primary text-white shadow-primary/40'}`}
                >
                  <span className="material-symbols-outlined text-3xl font-bold">add</span>
                </button>
              </div>
            )}
            
            <NavItem icon="account_balance_wallet" label="Cofre" active={currentPage === Page.Ranking} onClick={() => onPageChange(Page.Ranking)} />
            <NavItem icon="person" label="Perfil" active={currentPage === Page.Profile} onClick={() => onPageChange(Page.Profile)} />
          </nav>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, active, onClick, label }: { icon: string, active: boolean, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-12 transition-all duration-500 relative ${active ? 'text-navy' : 'text-slate-300'} hover:text-navy group`}
  >
    <div className={`transition-transform duration-500 ${active ? 'scale-110 -translate-y-1' : 'group-hover:scale-105'}`}>
      <span className={`material-symbols-outlined text-[26px] transition-all duration-500 ${active ? 'fill-1' : ''}`}>{icon}</span>
    </div>
    <span className={`text-[7px] font-black uppercase tracking-[0.2em] mt-1 transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}>{label}</span>
    
    {active && (
      <span className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(237,29,35,0.6)] animate-pulse"></span>
    )}
  </button>
);

export default Layout;
