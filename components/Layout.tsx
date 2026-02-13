
import React from 'https://esm.sh/react@18.2.0';
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
        
        {/* Navigation Bar */}
        <nav className="absolute bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 pt-4 pb-10 z-40">
          <ul className="flex justify-between items-center max-w-sm mx-auto">
            <NavItem icon="home" label="Início" active={currentPage === Page.Dashboard} onClick={() => onPageChange(Page.Dashboard)} />
            <NavItem icon="sports_soccer" label="Escalação" active={currentPage === Page.PlayerList} onClick={() => onPageChange(Page.PlayerList)} />
            
            <li className="-mt-12">
              <button 
                onClick={() => onPageChange(Page.CreateMatch)} 
                className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-all border-4 border-white"
              >
                <span className="material-symbols-outlined text-4xl">add</span>
              </button>
            </li>
            
            <NavItem icon="receipt_long" label="Finanças" active={currentPage === Page.Ranking} onClick={() => onPageChange(Page.Ranking)} />
            <NavItem icon="account_circle" label="Perfil" active={currentPage === Page.Profile} onClick={() => onPageChange(Page.Profile)} />
          </ul>
        </nav>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
  <li className="flex flex-col items-center gap-1 cursor-pointer transition-all active:opacity-60" onClick={onClick}>
    <span className={`material-symbols-outlined text-[24px] ${active ? 'text-primary' : 'text-slate-400'}`} style={{ fontVariationSettings: active ? "'FILL' 1" : "" }}>{icon}</span>
    <span className={`text-[10px] font-bold ${active ? 'text-primary' : 'text-slate-400'}`}>{label}</span>
  </li>
);

export default Layout;
