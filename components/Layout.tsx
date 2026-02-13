
import React from 'react';
import { Page } from '../types.ts';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  if (currentPage === Page.Login) return <>{children}</>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 p-0 sm:p-4 font-display">
      <div className="relative w-full max-w-[430px] h-[932px] sm:max-h-[92vh] bg-slate-50 shadow-2xl overflow-hidden flex flex-col rounded-none sm:rounded-[3rem] border-0 sm:border-[10px] border-white ring-1 ring-slate-200">
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto hide-scrollbar relative">
          <div className="pb-48 pt-4"> {/* Padding bottom maior para acomodar Nav e Botões flutuantes */}
            {children}
          </div>
        </main>
        
        {/* Navigation Bar - Glassmorphism UI */}
        <nav className="absolute bottom-8 left-6 right-6 h-20 bg-white/90 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] px-8 z-50 flex items-center justify-between">
          <NavItem icon="dashboard" active={currentPage === Page.Dashboard} onClick={() => onPageChange(Page.Dashboard)} />
          <NavItem icon="stadium" active={currentPage === Page.PlayerList} onClick={() => onPageChange(Page.PlayerList)} />
          
          <div className="relative -mt-16">
            <button 
              onClick={() => onPageChange(Page.CreateMatch)} 
              className={`w-18 h-18 rounded-3xl flex items-center justify-center shadow-2xl transition-all active:scale-90 border-4 border-slate-50 ${currentPage === Page.CreateMatch ? 'bg-primary text-white scale-110 rotate-12' : 'bg-navy text-white'}`}
              style={{ width: '4.5rem', height: '4.5rem' }}
            >
              <span className="material-symbols-outlined text-4xl fill-1">bolt</span>
            </button>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full opacity-0 peer-active:opacity-100"></div>
          </div>
          
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
    className={`flex flex-col items-center justify-center transition-all duration-300 ${active ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
  >
    <span 
      className={`material-symbols-outlined text-[30px] ${active ? 'text-primary' : 'text-navy'}`} 
      style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
    >
      {icon}
    </span>
    <div className={`w-1 h-1 bg-primary rounded-full mt-1 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}></div>
  </button>
);

export default Layout;
