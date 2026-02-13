
import React, { useState } from 'https://esm.sh/react@18.2.0';
import { Match } from '../types.ts';

const Dashboard: React.FC<{ match: Match | null }> = ({ match }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const totalSlots = 18;
  const filledSlots = 14;
  const remainingSlots = totalSlots - filledSlots;

  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-900 animate-in fade-in duration-500">
      {/* Header */}
      <header className="px-8 pt-12 pb-6 flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-1">DASHBOARD</span>
          <h1 className="text-3xl font-black tracking-tighter text-navy uppercase italic">O&A Elite Pro</h1>
        </div>
        <button className="w-11 h-11 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      {/* Próxima Partida Section */}
      <section className="px-6 mb-4">
        <div className="flex items-center justify-between mb-4 px-2">
           <h3 className="text-xl font-bold text-navy">Próxima Partida</h3>
           <span className="px-4 py-1.5 rounded-full bg-primary text-[10px] font-black text-white uppercase tracking-widest shadow-md shadow-primary/20">SÁBADO</span>
        </div>
        
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-croatia opacity-[0.05]"></div>
          </div>

          <div className="relative z-10 p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">STATUS: CONFIRMADO</span>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-5xl font-condensed tracking-tighter text-navy">24 Out</span>
              <div className="w-px h-10 bg-slate-100"></div>
              <span className="text-5xl font-condensed tracking-tighter text-primary">18:00</span>
            </div>

            {/* Location Card */}
            <div className="bg-slate-50 rounded-3xl p-5 mb-8 flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined fill-1">location_on</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-navy">Arena Central</h4>
                  <p className="text-[10px] text-slate-400 font-medium italic">Campo 3 • Gramado Sintético</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300">
                <span className="material-symbols-outlined text-[20px]">explore</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vagas Preenchidas</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-navy">{filledSlots}</span>
                  <span className="text-[11px] text-slate-300">/ {totalSlots}</span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${(filledSlots / totalSlots) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] font-bold text-primary italic">Apenas {remainingSlots} vagas restantes para fechar o time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="px-6 space-y-4 mb-8">
        <button 
          onClick={() => setIsConfirmed(!isConfirmed)}
          className={`w-full h-[72px] rounded-3xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all shadow-xl ${isConfirmed ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-primary text-white shadow-primary/20'}`}
        >
          <span className="material-symbols-outlined fill-1">{isConfirmed ? 'check_circle' : 'verified'}</span>
          {isConfirmed ? 'PRESENÇA CONFIRMADA' : 'CONFIRMAR PRESENÇA'}
        </button>
        <button className="w-full h-[72px] rounded-3xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-sm">
          <span className="material-symbols-outlined">close</span>
          VOU DESISTIR
        </button>
      </section>

      {/* User Status Card */}
      <section className="px-6 grid grid-cols-1 gap-4 mb-32">
        <div className="bg-white rounded-[2.5rem] p-7 border border-slate-100 flex items-center gap-5 shadow-sm">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 p-1">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" className="w-full h-full object-cover rounded-xl" alt="Perfil" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[12px]">
              <span className="material-symbols-outlined text-[12px] font-black">check</span>
            </div>
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest block mb-0.5">SEU STATUS</span>
            <h4 className="text-xl font-black text-navy leading-tight">Você está no jogo!</h4>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Convocado</p>
          </div>
          <div className="text-right border-l border-slate-100 pl-5">
             <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest block mb-1">SALDO</span>
             <p className="text-2xl font-condensed text-primary">R$ 20,00</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined">group</span>
            </div>
            <p className="text-4xl font-condensed text-navy">04</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Vagas Livres</p>
          </div>
          
          <div className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-navy/5 flex items-center justify-center text-navy mb-4">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <p className="text-4xl font-condensed text-navy">R$ 30</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Custo / Jogo</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
