
import React, { useState } from 'https://esm.sh/react@18.2.0';
import { Match } from '../types.ts';
import { logout } from '../services/firebase.ts';

const Dashboard: React.FC<{ match: Match | null }> = ({ match }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  // Ícone redondo oficial
  const iconUrl = "https://i.postimg.cc/vH5m6v5q/Design-sem-nome-1.png";

  const totalSlots = 18;
  const filledSlots = 14;
  const remainingSlots = totalSlots - filledSlots;

  const handleLogout = async () => {
    if (confirm("Deseja realmente sair da sua conta na Arena O&A?")) {
      try {
        await logout();
      } catch (error) {
        console.error("Erro ao deslogar:", error);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-900 animate-in fade-in duration-500">
      {/* Header */}
      <header className="px-8 pt-12 pb-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-30 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-soft border border-slate-100 p-1.5 flex items-center justify-center">
            <img src={iconUrl} alt="Logo Icon" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-primary tracking-[0.3em] leading-none mb-1">ARENA</span>
            <h1 className="text-lg font-black tracking-tighter text-navy uppercase italic leading-none">O&A ELITE</h1>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-11 h-11 rounded-2xl bg-white shadow-soft border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90"
          title="Sair"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </header>

      {/* Próxima Partida Section */}
      <section className="px-6 mt-6 mb-4">
        <div className="flex items-center justify-between mb-5 px-1">
           <h3 className="text-lg font-black text-navy uppercase italic tracking-tight">Próxima Convocação</h3>
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">LIVE</span>
           </div>
        </div>
        
        <div className="relative overflow-hidden rounded-apple-xl bg-white border border-slate-100 shadow-soft group">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-croatia opacity-[0.4]"></div>
             <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-150 duration-700"></div>
          </div>

          <div className="relative z-10 p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-wider">Inscrições Abertas</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider">Sábado</span>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-5xl font-condensed tracking-tighter text-navy">24 Out</span>
              <div className="w-px h-10 bg-slate-200"></div>
              <span className="text-5xl font-condensed tracking-tighter text-primary">18:00</span>
            </div>

            {/* Location Card */}
            <div className="bg-slate-50/90 backdrop-blur rounded-2xl p-5 mb-8 flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined fill-1 text-2xl">location_on</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-navy">Arena Central</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">Campo 03 • Gramado Elite</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300">
                <span className="material-symbols-outlined text-[20px]">map</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Atletas Inscritos</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-navy">{filledSlots}</span>
                  <span className="text-xs text-slate-300 font-bold">/ {totalSlots}</span>
                </div>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50 shadow-inner">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(237,29,35,0.4)]" 
                  style={{ width: `${(filledSlots / totalSlots) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center gap-2 bg-primary/5 p-3 rounded-xl border border-primary/10">
                <span className="material-symbols-outlined text-primary text-base">info</span>
                <p className="text-[10px] font-black text-primary uppercase tracking-wider italic">Faltam {remainingSlots} jogadores para fechar a lista!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="px-6 space-y-4 mb-10">
        <button 
          onClick={() => setIsConfirmed(!isConfirmed)}
          className={`w-full h-20 rounded-apple flex items-center justify-center gap-4 font-black uppercase tracking-[0.15em] text-xs transition-all shadow-xl active:scale-95 ${isConfirmed ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-primary text-white shadow-primary/30'}`}
        >
          <span className="material-symbols-outlined fill-1 text-3xl">{isConfirmed ? 'check_circle' : 'sports_soccer'}</span>
          {isConfirmed ? 'PRESENÇA CONFIRMADA' : 'EU VOU PRO JOGO'}
        </button>
        <button className="w-full h-16 rounded-apple bg-white border border-slate-200 text-slate-400 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] shadow-sm active:scale-95 transition-all">
          <span className="material-symbols-outlined">close</span>
          NÃO POSSO IR
        </button>
      </section>

      {/* User Status Card */}
      <section className="px-6 grid grid-cols-1 gap-4 mb-32">
        <div className="bg-white rounded-apple-xl p-7 border border-slate-100 flex items-center gap-5 shadow-soft hover:shadow-lg transition-shadow">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 p-1 border-2 border-slate-50">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" className="w-full h-full object-cover rounded-xl" alt="Perfil" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[12px] font-black">check</span>
            </div>
          </div>
          <div className="flex-1">
            <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest block mb-0.5 italic">SEU STATUS</span>
            <h4 className="text-xl font-black text-navy leading-tight uppercase italic tracking-tighter">CONVOCADO</h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Titular</p>
            </div>
          </div>
          <div className="text-right border-l border-slate-100 pl-6">
             <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest block mb-1">MENSALIDADE</span>
             <p className="text-xl font-condensed text-primary tracking-widest">PAGO</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
