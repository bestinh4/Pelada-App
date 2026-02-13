
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
      {/* Header */}
      <header className="px-8 pt-12 pb-6 flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-1">Dashboard</span>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">O&A Elite Pro</h1>
        </div>
        <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      {/* Próxima Partida Section */}
      <section className="px-6 mb-4">
        <h3 className="text-xl font-bold mb-4 px-2">Próxima Partida</h3>
        
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0E1324] border border-white/5 shadow-2xl">
          {/* Background Estádio com Overlays */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200" 
              className="w-full h-full object-cover opacity-20 brightness-50"
              alt="Estádio"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1324] via-transparent to-transparent"></div>
          </div>

          <div className="relative z-10 p-8">
            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Status: Confirmado</span>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-condensed tracking-tighter">24 Out</span>
              <div className="w-px h-8 bg-white/20"></div>
              <span className="text-4xl font-condensed tracking-tighter text-primary">18:00</span>
            </div>

            {/* Location Card */}
            <div className="bg-black/40 backdrop-blur-md rounded-3xl p-5 mb-8 flex items-center justify-between border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm">Arena Central</h4>
                  <p className="text-[10px] text-white/40 font-medium">Campo 3 • Gramado Sintético</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                <span className="material-symbols-outlined text-[20px]">directions</span>
              </button>
            </div>

            {/* Vagas Progress */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Vagas Preenchidas</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black">{filledSlots}</span>
                  <span className="text-[10px] text-white/20">/ {totalSlots}</span>
                </div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary shadow-[0_0_12px_rgba(237,29,35,0.5)] transition-all duration-1000" 
                  style={{ width: `${(filledSlots / totalSlots) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] font-bold text-primary italic">Apenas {remainingSlots} vagas restantes para fechar o time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="px-6 space-y-3 mb-8">
        <button 
          onClick={() => setIsConfirmed(true)}
          className={`w-full h-16 rounded-3xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl ${isConfirmed ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-primary text-white shadow-primary/20'}`}
        >
          <span className="material-symbols-outlined">{isConfirmed ? 'check_circle' : 'verified'}</span>
          {isConfirmed ? 'Presença Confirmada' : 'Confirmar Presença'}
        </button>
        <button className="w-full h-16 rounded-3xl bg-white/5 border border-white/5 text-white/60 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs active:scale-95 transition-all">
          <span className="material-symbols-outlined">close</span>
          Vou Desistir
        </button>
      </section>

      {/* Status e Info Grid */}
      <section className="px-6 grid grid-cols-1 gap-4 mb-32">
        {/* Status Card */}
        <div className="bg-[#0E1324] rounded-[2rem] p-6 border border-white/5 flex items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white p-1 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" className="w-full h-full object-cover rounded-xl" alt="Perfil" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-[#0E1324] flex items-center justify-center">
              <span className="material-symbols-outlined text-[10px] text-white">check</span>
            </div>
          </div>
          <div className="flex-1">
            <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Seu Status</span>
            <h4 className="text-lg font-black leading-tight">Você está no jogo!</h4>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">Presença confirmada</p>
          </div>
          <div className="text-right">
             <span className="text-[9px] font-black uppercase text-white/40 tracking-widest block mb-1">Saldo</span>
             <p className="text-xl font-condensed text-primary">R$ 20,00</p>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0E1324] rounded-[2rem] p-6 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined">group</span>
            </div>
            <p className="text-3xl font-condensed">04</p>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">Vagas Livres</p>
          </div>
          <div className="bg-[#0E1324] rounded-[2rem] p-6 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <p className="text-3xl font-condensed">R$ 30</p>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">Custo / Jogo</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
