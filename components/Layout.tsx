
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
    <div className="flex justify-center min-h-screen sm:py-8">
      {/* 
          Main Responsive Wrapper
          Mobile: Full screen
          Desktop: Fixed width (iPhone aspect ratio)
      */}
      <div className="relative w-full sm:max-w-[430px] sm:h-[880px] bg-white sm:rounded-[3rem] sm:shadow-2xl overflow-hidden flex flex-col sm:border-[8px] sm:border-white ring-1 ring-slate-100">
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#F9FBFC]">
          {children}
          {/* Spacer for bottom nav */}
          <div className="h-32"></div>
        </div>
        
        {/* Floating Bottom Nav - Precise Scaling */}
        <div className="absolute bottom-6 left-6 right-6 z-50">
          <nav className="h-16 bg-navy rounded-2xl shadow-2xl flex items-center justify-around px-2 border border-white/5">
            <NavItem icon="dashboard" label="Home" active={currentPage === Page.Dashboard} onClick={() => onPageChange(Page.Dashboard)} />
            <NavItem icon="groups" label="Convocados" active={currentPage === Page.PlayerList} onClick={() => onPageChange(Page.PlayerList)} />
            
            {isAdmin && (
              <button 
                onClick={() => onPageChange(Page.CreateMatch)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 -mt-2 ${currentPage === Page.CreateMatch ? 'bg-white text-primary rotate-45 scale-110 shadow-lg' : 'bg-primary text-white shadow-xl shadow-primary/20'}`}
              >
                <span className="material-symbols-outlined text-2xl font-bold">add</span>
              </button>
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
    className={`flex flex-col items-center justify-center w-12 transition-all duration-300 ${active ? 'text-primary' : 'text-white/30'}`}
  >
    <span className={`material-symbols-outlined text-[22px] ${active ? 'fill-1' : ''}`}>{icon}</span>
    <span className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
  </button>
);

export default Layout;
