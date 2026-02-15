
import React from 'react';
import { Page, Player } from '../types.ts';

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
    <div className="flex justify-center min-h-screen bg-[#F8FAFC] font-display">
      {/* 
          Container Responsivo Principal 
          - Mobile: 100% width/height
          - Desktop: Frame de iPhone centralizado
      */}
      <div className="relative w-full md:max-w-[430px] md:h-[932px] md:my-8 md:rounded-[3rem] md:shadow-2xl bg-slate-bg overflow-hidden flex flex-col md:border-[8px] md:border-white ring-1 ring-slate-200">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto hide-scrollbar relative z-10">
          <div className="pb-40 pt-0">
            {children}
          </div>
        </main>
        
        {/* Navigation Bar - Fixed alignment and polished UI */}
        <nav className="absolute bottom-6 left-5 right-5 h-20 bg-white/95 backdrop-blur-3xl border border-slate-100 rounded-[2.2rem] shadow-[0_20px_40px_rgba(0,0,0,0.06)] px-8 z-50 flex items-center justify-between">
          <NavItem icon="dashboard" label="Home" active={currentPage === Page.Dashboard} onClick={() => onPageChange(Page.Dashboard)} />
          <NavItem icon="stadium" label="Campo" active={currentPage === Page.PlayerList} onClick={() => onPageChange(Page.PlayerList)} />
          
          {isAdmin && (
            <div className="relative -mt-16 group">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 group-active:scale-100 transition-all duration-300"></div>
              <button 
                type="button"
                onClick={() => onPageChange(Page.CreateMatch)} 
                className={`relative w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-heavy transition-all active:scale-90 border-4 border-white ${currentPage === Page.CreateMatch ? 'bg-primary text-white rotate-12' : 'bg-navy text-white'}`}
              >
                <span className="material-symbols-outlined text-3xl fill-1">bolt</span>
              </button>
            </div>
          )}
          
          <NavItem 
            icon="account_balance_wallet" 
            label="Caixa"
            active={currentPage === Page.Ranking} 
            onClick={() => onPageChange(Page.Ranking)}
            hide={!isAdmin} 
          />
          <NavItem icon="person" label="Perfil" active={currentPage === Page.Profile} onClick={() => onPageChange(Page.Profile)} />
        </nav>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, hide }: { icon: string, label: string, active: boolean, onClick: () => void, hide?: boolean }) => {
  if (hide) return null;
  return (
    <button 
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition-all duration-500 relative py-2 ${active ? 'scale-110' : 'opacity-40 hover:opacity-80'}`}
    >
      <span 
        className={`material-symbols-outlined text-[28px] ${active ? 'text-primary' : 'text-navy'}`} 
        style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
      >
        {icon}
      </span>
      <div className={`absolute -bottom-1 w-1 h-1 bg-primary rounded-full transition-all duration-500 ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
    </button>
  );
}

export default Layout;
