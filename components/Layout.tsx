
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
      <div className="relative w-full max-w-[430px] h-[932px] sm:max-h-[95vh] bg-slate-50 shadow-2xl overflow-hidden flex flex-col rounded-none sm:rounded-[48px] border-0 sm:border-[8px] border-white ring-1 ring-slate-200">
        <main className="flex-1 overflow-y-auto hide-scrollbar pb-32">
          {children}
        </main>
        
        {/* Navigation Bar Padronizada */}
        <nav className="absolute bottom-6 left-6 right-6 h-20 bg-white/80 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-soft px-8 z-50">
          <ul className="flex justify-between items-center h-full">
            <NavItem icon="home" active={currentPage === Page.Dashboard} onClick={() => onPageChange(Page.Dashboard)} />
            <NavItem icon="groups" active={currentPage === Page.PlayerList} onClick={() => onPageChange(Page.PlayerList)} />
            
            <li className="-mt-14">
              <button 
                onClick={() => onPageChange(Page.CreateMatch)} 
                className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/40 active:scale-90 transition-all border-4 border-slate-50"
              >
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </button>
            </li>
            
            <NavItem icon="account_balance_wallet" active={currentPage === Page.Ranking} onClick={() => onPageChange(Page.Ranking)} />
            <NavItem icon="person" active={currentPage === Page.Profile} onClick={() => onPageChange(Page.Profile)} />
          </ul>
        </nav>
      </div>
    </div>
  );
};

const NavItem = ({ icon, active, onClick }: { icon: string, active: boolean, onClick: () => void }) => (
  <li className="flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90" onClick={onClick}>
    <span 
      className={`material-symbols-outlined text-[28px] ${active ? 'text-primary' : 'text-slate-300'}`} 
      style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
    >
      {icon}
    </span>
    {active && <div className="w-1 h-1 bg-primary rounded-full mt-1 animate-in zoom-in duration-300"></div>}
  </li>
);

export default Layout;
