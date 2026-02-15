
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
    <div className="flex justify-center min-h-screen">
      {/* 
          Main Responsive Wrapper
          Mobile: Full screen
          Desktop: Fixed width with iPhone aspect ratio
      */}
      <div className="relative w-full md:max-w-[430px] md:h-[90vh] md:my-[5vh] md:rounded-[3rem] md:shadow-2xl bg-white overflow-hidden flex flex-col md:border-[10px] md:border-white ring-1 ring-slate-100">
        
        {/* Navigation Bar - Stays on top/bottom based on design but here fixed at bottom */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">
          {children}
        </div>
        
        {/* Floating Bottom Nav */}
        <nav className="absolute bottom-6 left-6 right-6 h-18 bg-navy rounded-[2rem] shadow-2xl z-50 flex items-center justify-around px-4">
          <NavItem icon="dashboard" active={currentPage === Page.Dashboard} onClick={() => onPageChange(Page.Dashboard)} />
          <NavItem icon="stadium" active={currentPage === Page.PlayerList} onClick={() => onPageChange(Page.PlayerList)} />
          
          {isAdmin && (
            <button 
              onClick={() => onPageChange(Page.CreateMatch)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-button active:scale-90 ${currentPage === Page.CreateMatch ? 'bg-white text-primary rotate-45 scale-110' : 'bg-primary text-white'}`}
            >
              <span className="material-symbols-outlined text-3xl font-bold">add</span>
            </button>
          )}
          
          <NavItem icon="account_balance_wallet" active={currentPage === Page.Ranking} onClick={() => onPageChange(Page.Ranking)} />
          <NavItem icon="person" active={currentPage === Page.Profile} onClick={() => onPageChange(Page.Profile)} />
        </nav>
      </div>
    </div>
  );
};

const NavItem = ({ icon, active, onClick }: { icon: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-12 h-12 transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-white/40'}`}
  >
    <span className={`material-symbols-outlined text-2xl ${active ? 'fill-1' : ''}`}>{icon}</span>
  </button>
);

export default Layout;
