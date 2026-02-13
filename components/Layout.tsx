
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
    <div className="flex justify-center items-center min-h-screen p-0 sm:p-4">
      <div className="relative w-full max-w-[430px] h-[932px] sm:max-h-[95vh] bg-navy-deep shadow-2xl overflow-hidden flex flex-col rounded-none sm:rounded-[48px] border-0 sm:border-[8px] border-gray-900 ring-1 ring-black/5">
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-50"></div>
        <main className="flex-1 overflow-y-auto hide-scrollbar pb-32 bg-navy-deep">
          {children}
        </main>
        
        {/* Nova Barra de Navegação Estilo Imagem */}
        <nav className="absolute bottom-0 w-full bg-[#0A0F1E]/95 backdrop-blur-2xl border-t border-white/5 px-6 pt-4 pb-10 z-40">
          <ul className="flex justify-between items-center max-w-sm mx-auto">
            <NavItem icon="home" label="Início" active={currentPage === Page.Dashboard} onClick={() => onPageChange(Page.Dashboard)} />
            <NavItem icon="sports_soccer" label="Escalação" active={currentPage === Page.PlayerList} onClick={() => onPageChange(Page.PlayerList)} />
            
            <li className="-mt-12">
              <button 
                onClick={() => onPageChange(Page.CreateMatch)} 
                className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-[0_8px_24px_rgba(237,29,35,0.4)] active:scale-90 transition-all border-4 border-[#0A0F1E]"
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
    <span className={`material-symbols-outlined text-[24px] ${active ? 'text-primary' : 'text-slate-500'}`} style={{ fontVariationSettings: active ? "'FILL' 1" : "" }}>{icon}</span>
    <span className={`text-[10px] font-bold ${active ? 'text-primary' : 'text-slate-500'}`}>{label}</span>
  </li>
);

export default Layout;
