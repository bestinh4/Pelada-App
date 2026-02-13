
import React, { useState } from 'react';
import { Match, Player, Page } from '../types.ts';
import { db, doc, updateDoc } from '../services/firebase.ts';

interface DashboardProps {
  match: Match | null;
  players: Player[];
  user: any;
  onPageChange: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ match, players = [], user, onPageChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const currentPlayer = players.find(p => p.id === user?.uid);
  const isConfirmed = currentPlayer?.status === 'presente';
  
  const confirmedPlayers = players.filter(p => p.status === 'presente');
  const filledSlots = confirmedPlayers.length;
  const totalSlots = match?.totalSlots || 20;

  // Lógica das Regras da Pelada
  const numTeams = Math.floor(filledSlots / 5);
  const isBothLeaveMode = numTeams >= 4;

  const togglePresence = async () => {
    if (!user || isUpdating) return;
    setIsUpdating(true);
    try {
      const playerRef = doc(db, "players", user.uid);
      await updateDoc(playerRef, { status: isConfirmed ? 'pendente' : 'presente' });
    } catch (e) { console.error(e); }
    finally { setIsUpdating(false); }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-700">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-white/50 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <img src={mainLogoUrl} className="w-12 h-12 object-contain" alt="Logo" />
          <div>
            <span className="text-[8px] font-black uppercase text-primary tracking-[0.4em] leading-none mb-0.5">ARENA</span>
            <h1 className="text-xl font-black tracking-tighter text-navy uppercase italic leading-none">O&A ELITE</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 border border-slate-200">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-black text-navy uppercase tracking-widest">LIVE</span>
        </div>
      </header>

      <section className="px-6 mt-8">
        {/* Match Card Principal */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-soft p-8 mb-6">
          <div className="absolute inset-0 bg-croatia opacity-[0.05]"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="inline-block px-3 py-1 rounded-md bg-primary text-white text-[8px] font-black uppercase tracking-widest mb-4">PRÓXIMA PELADA</span>
                <h2 className="text-4xl font-condensed text-navy tracking-tight leading-none uppercase mb-2">{match?.location || "Arena Central"}</h2>
                <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  {match?.date ? new Date(match.date).toLocaleDateString('pt-BR', { weekday: 'long' }) : 'Sábado'} • {match?.time || '18:00'}h
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 mb-8">
              <div className="flex justify-between items-end mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">CONVOCADOS</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-condensed text-navy">{filledSlots}</span>
                  <span className="text-sm text-slate-300 font-bold">/ {totalSlots}</span>
                </div>
              </div>
              <div className="h-3 w-full bg-white rounded-full overflow-hidden p-0.5 border border-slate-100 shadow-inner">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(237,29,35,0.4)]" 
                  style={{ width: `${Math.min(100, (filledSlots / totalSlots) * 100)}%` }}
                ></div>
              </div>
            </div>

            <button 
              onClick={togglePresence}
              disabled={isUpdating}
              className={`w-full h-18 rounded-[1.5rem] flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl active:scale-95 ${isConfirmed ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-primary text-white shadow-primary/30'}`}
            >
              <span className="material-symbols-outlined text-2xl">{isConfirmed ? 'check_circle' : 'person_add'}</span>
              {isConfirmed ? 'ESTOU CONVOCADO' : 'CONFIRMAR PRESENÇA'}
            </button>
          </div>
        </div>

        {/* Card de Regras Dinâmicas - O Diferencial Elite */}
        <div className="bg-navy rounded-apple-xl p-8 text-white relative overflow-hidden shadow-2xl shadow-navy/20">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-8xl">gavel</span>
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">REGRAS DA ARENA</h3>
          
          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">timer</span>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase opacity-50">TEMPO</p>
                <p className="font-condensed text-xl leading-none">10 MIN</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400 text-xl">sports_soccer</span>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase opacity-50">LIMITE</p>
                <p className="font-condensed text-xl leading-none">2 GOLS</p>
              </div>
            </div>

            <div className="col-span-2 mt-2 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${isBothLeaveMode ? 'text-primary animate-pulse' : 'text-slate-400'}`}>
                  {isBothLeaveMode ? 'warning' : 'info'}
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                    {isBothLeaveMode ? 'EMPATE: SAEM OS DOIS' : 'EMPATE: SAI O TIME QUE ENTROU'}
                  </p>
                  <p className="text-[8px] opacity-40 uppercase font-bold mt-1">
                    {numTeams} times completos detectados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas Rápidas */}
      <section className="px-6 mt-8 grid grid-cols-2 gap-4 pb-12">
        <div className="bg-white p-6 rounded-apple-xl border border-slate-100 shadow-soft">
           <div className="flex justify-between items-start mb-4">
             <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">ARTILHARIA</span>
             <span className="material-symbols-outlined text-primary text-lg">local_fire_department</span>
           </div>
           <div className="flex items-baseline gap-1">
             <span className="text-4xl font-condensed text-primary tracking-widest">{currentPlayer?.goals || 0}</span>
             <span className="text-[10px] text-slate-400 font-bold uppercase">GOLS</span>
           </div>
        </div>
        <div className="bg-white p-6 rounded-apple-xl border border-slate-100 shadow-soft">
           <div className="flex justify-between items-start mb-4">
             <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">FINANCEIRO</span>
             <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
           </div>
           <p className="text-xl font-black italic text-navy leading-none tracking-tighter">EM DIA</p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
