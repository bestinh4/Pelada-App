
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
      <div className="relative w-full max-w-[430px] h-[932px] sm:max-h-[95vh] bg-background shadow-2xl overflow-hidden flex flex-col rounded-none sm:rounded-[48px] border-0 sm:border-[8px] border-gray-900 ring-1 ring-black/5 bg-croatia">
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-50"></div>
        <main className="flex-1 overflow-y-auto hide-scrollbar pb-32">
          {children}
        </main>
        <nav className="absolute bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100/50 px-8 pt-4 pb-10 z-40">
          <ul className="flex justify-between items-center max-w-sm mx-auto">
            <NavItem icon="grid_view" label="ARENA" active={currentPage === Page.Dashboard} onClick={() => onPageChange(Page.Dashboard)} />
            <NavItem icon="format_list_bulleted" label="LISTA" active={currentPage === Page.PlayerList} onClick={() => onPageChange(Page.PlayerList)} />
            <li className="-mt-8">
              <button onClick={() => onPageChange(Page.CreateMatch)} className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
                <span className="material-symbols-outlined text-3xl">add</span>
              </button>
            </li>
            <NavItem icon="radar" label="SCOUT" active={currentPage === Page.Ranking} onClick={() => onPageChange(Page.Ranking)} />
            <NavItem icon="person" label="PERFIL" active={currentPage === Page.Profile} onClick={() => onPageChange(Page.Profile)} />
          </ul>
        </nav>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
  <li className="flex flex-col items-center gap-1 cursor-pointer" onClick={onClick}>
    <span className={`material-symbols-outlined text-[26px] ${active ? 'text-primary' : 'text-slate-400'}`} style={{ fontVariationSettings: active ? "'FILL' 1" : "" }}>{icon}</span>
    <span className={`text-[9px] font-bold tracking-widest uppercase ${active ? 'text-primary' : 'text-slate-400'}`}>{label}</span>
  </li>
);

export default Layout;
