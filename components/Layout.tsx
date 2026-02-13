
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
    <div className="flex justify-center items-center min-h-screen bg-slate-100 p-0 sm:p-4">
      {/* Device Wrapper - Simula um dispositivo mobile premium */}
      <div className="relative w-full max-w-[430px] h-[932px] sm:max-h-[90vh] bg-slate-50 shadow-2xl overflow-hidden flex flex-col rounded-none sm:rounded-[48px] border-0 sm:border-[8px] border-white ring-1 ring-slate-200">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto hide-scrollbar">
          <div className="min-h-full pb-44"> {/* Espaço extra no fim para evitar sobreposição da Nav e Botões */}
            {children}
          </div>
        </main>
        
        {/* Bottom Navigation - Glassmorphism style */}
        <nav className="absolute bottom-6 left-6 right-6 h-20 bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2rem] shadow-soft px-8 z-50 flex items-center justify-between">
          <NavItem icon="home" active={currentPage === Page.Dashboard} onClick={() => onPageChange(Page.Dashboard)} />
          <NavItem icon="groups" active={currentPage === Page.PlayerList} onClick={() => onPageChange(Page.PlayerList)} />
          
          <button 
            onClick={() => onPageChange(Page.CreateMatch)} 
            className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 active:scale-90 transition-all border-4 border-slate-50 -mt-16"
          >
            <span className="material-symbols-outlined text-3xl">bolt</span>
          </button>
          
          <NavItem icon="account_balance_wallet" active={currentPage === Page.Ranking} onClick={() => onPageChange(Page.Ranking)} />
          <NavItem icon="person" active={currentPage === Page.Profile} onClick={() => onPageChange(Page.Profile)} />
        </nav>
      </div>
    </div>
  );
};

const NavItem = ({ icon, active, onClick }: { icon: string, active: boolean, onClick: () => void }) => (
  <li className="list-none flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90" onClick={onClick}>
    <span 
      className={`material-symbols-outlined text-[28px] ${active ? 'text-primary' : 'text-slate-300'}`} 
      style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
    >
      {icon}
    </span>
    <div className={`w-1 h-1 bg-primary rounded-full mt-1 transition-all ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
  </li>
);

export default Layout;
