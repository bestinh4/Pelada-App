
import React, { useState } from 'https://esm.sh/react@18.2.0';
import { Match } from '../types.ts';

const Dashboard: React.FC<{ match: Match | null }> = ({ match }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const logoUrl = "https://i.ibb.co/457WhWm/Gemini-Generated-Image-xrrv8axrrv8axrrv.png";

  const totalSlots = 18;
  const filledSlots = 14;
  const remainingSlots = totalSlots - filledSlots;

  return (
    <div className="flex flex-col animate-in fade-in duration-700 min-h-full bg-navy-deep text-white">
      {/* Header Estilo Imagem */}
      <header className="px-8 pt-12 pb-6 flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-1">DASHBOARD</span>
          <h1 className="text-3xl font-black tracking-tighter text-white">O&A Elite Pro</h1>
        </div>
        <button className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[24px]">settings</span>
        </button>
      </header>

      {/* Próxima Partida Section */}
      <section className="px-6 mb-4">
        <div className="flex items-center justify-between mb-4 px-2">
           <h3 className="text-xl font-bold">Próxima Partida</h3>
           <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">SÁBADO</span>
        </div>
        
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0E1324] border border-white/5 shadow-2xl">
          {/* Background Estádio com Overlays */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200" 
              className="w-full h-full object-cover opacity-20 brightness-[0.3]"
              alt="Estádio"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1324] via-transparent to-transparent"></div>
          </div>

          <div className="relative z-10 p-8">
            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500">STATUS: CONFIRMADO</span>
            </div>

            {/* Date & Time Grande */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-5xl font-condensed tracking-tighter text-white">24 Out</span>
              <div className="w-px h-10 bg-white/10"></div>
              <span className="text-5xl font-condensed tracking-tighter text-primary">18:00</span>
            </div>

            {/* Location Sub-Card */}
            <div className="bg-[#151B2E]/80 backdrop-blur-xl rounded-3xl p-5 mb-8 flex items-center justify-between border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <span className="material-symbols-outlined fill-1">location_on</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm">Arena Central</h4>
                  <p className="text-[10px] text-white/40 font-medium">Campo 3 • Gramado Sintético</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                <span className="material-symbols-outlined text-[20px]">explore</span>
              </button>
            </div>

            {/* Vagas Progress Estilo Imagem */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Vagas Preenchidas</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white">{filledSlots}</span>
                  <span className="text-[11px] text-white/20">/ {totalSlots}</span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div 
                  className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(237,29,35,0.6)] transition-all duration-1000 ease-out" 
                  style={{ width: `${(filledSlots / totalSlots) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] font-bold text-primary italic px-1">Apenas {remainingSlots} vagas restantes para fechar o time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons Grandes Estilo Imagem */}
      <section className="px-6 space-y-4 mb-8">
        <button 
          onClick={() => setIsConfirmed(true)}
          className={`w-full h-[72px] rounded-3xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all active:scale-[0.97] shadow-2xl ${isConfirmed ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-primary text-white shadow-primary/30'}`}
        >
          <span className="material-symbols-outlined fill-1">{isConfirmed ? 'verified' : 'check_circle'}</span>
          {isConfirmed ? 'Confirmado' : 'Confirmar Presença'}
        </button>
        <button className="w-full h-[72px] rounded-3xl bg-[#151B2E] border border-white/5 text-white/50 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs active:scale-[0.97] transition-all">
          <span className="material-symbols-outlined text-[20px]">close</span>
          Vou Desistir
        </button>
      </section>

      {/* User Status Card Estilo Imagem */}
      <section className="px-6 grid grid-cols-1 gap-4 mb-32">
        <div className="bg-[#0E1324] rounded-[2.5rem] p-7 border border-white/5 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white p-1 overflow-hidden shadow-xl">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" className="w-full h-full object-cover rounded-xl" alt="Perfil" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full border-2 border-[#0E1324] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[12px] text-white font-black">check</span>
            </div>
          </div>
          <div className="flex-1 z-10">
            <span className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-0.5">SEU STATUS</span>
            <h4 className="text-xl font-black leading-tight text-white tracking-tight">Você está no jogo!</h4>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Presença confirmada</p>
          </div>
          <div className="text-right z-10 border-l border-white/5 pl-5">
             <span className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-1">SALDO</span>
             <p className="text-2xl font-condensed text-primary">R$ 20,00</p>
          </div>
        </div>

        {/* Info Cards Grid Duplo Estilo Imagem */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0E1324] rounded-[2.5rem] p-7 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-8 -mt-8 blur-xl"></div>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-inner">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
            <p className="text-4xl font-condensed text-white">04</p>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-2">Vagas Livres</p>
          </div>
          
          <div className="bg-[#0E1324] rounded-[2.5rem] p-7 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-8 -mt-8 blur-xl"></div>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-inner">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
            <p className="text-4xl font-condensed text-white">R$ 30</p>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-2">Custo / Jogo</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
