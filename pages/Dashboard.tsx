
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
  
  const totalSlots = match?.totalSlots || 18;
  const confirmedPlayers = players.filter(p => p.status === 'presente');
  const filledSlots = confirmedPlayers.length;

  const updatePresence = async (status: 'presente' | 'pendente') => {
    if (!user || isUpdating) return;
    setIsUpdating(true);
    try {
      const playerRef = doc(db, "players", user.uid);
      await updateDoc(playerRef, { status });
    } catch (e) {
      console.error("Erro ao atualizar presença:", e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-900 animate-in fade-in duration-500">
      {/* Unified Header */}
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-white/50 backdrop-blur-sm sticky top-0 z-30 border-b border-slate-100">
        <div className="w-12 h-12 flex items-center justify-center">
          <img src={mainLogoUrl} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-primary tracking-[0.4em] leading-none mb-0.5">ARENA</span>
          <h1 className="text-lg font-black tracking-tighter text-navy uppercase italic leading-none">O&A ELITE</h1>
        </div>
      </header>

      <section className="px-6 mt-8">
        <div className="relative overflow-hidden rounded-apple-xl bg-white border border-slate-100 shadow-soft p-8 group">
          <div className="absolute inset-0 z-0 bg-croatia opacity-[0.03]"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-[9px] font-black uppercase text-primary tracking-widest block mb-1">PRÓXIMO CONFRONTO</span>
                <h2 className="text-4xl font-condensed text-navy tracking-tighter leading-none uppercase">Arena Central</h2>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase italic">Sábado, 24 de Outubro • 18:00h</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100">
                <span className="material-symbols-outlined text-3xl fill-1">sports_soccer</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">CONVOCAÇÃO ATUAL</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-navy">{filledSlots}</span>
                  <span className="text-sm text-slate-300 font-bold">/ {totalSlots}</span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(237,29,35,0.3)]" 
                  style={{ width: `${Math.min(100, (filledSlots / totalSlots) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => updatePresence(isConfirmed ? 'pendente' : 'presente')}
                disabled={isUpdating}
                className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 ${isConfirmed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
              >
                <span className="material-symbols-outlined text-sm">{isConfirmed ? 'check' : 'add'}</span>
                {isConfirmed ? 'CONFIRMADO' : 'EU VOU'}
              </button>
              <button onClick={() => onPageChange(Page.PlayerList)} className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 active:scale-95">
                <span className="material-symbols-outlined">group</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="px-6 mt-6 grid grid-cols-2 gap-4 pb-40">
        <div className="bg-white p-6 rounded-apple-xl border border-slate-100 shadow-soft">
           <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest block mb-2">SEU RANKING</span>
           <div className="flex items-baseline gap-1">
             <span className="text-3xl font-condensed text-navy tracking-widest">#04</span>
             <span className="text-[10px] text-emerald-500 font-bold">▲2</span>
           </div>
        </div>
        <div className="bg-white p-6 rounded-apple-xl border border-slate-100 shadow-soft">
           <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest block mb-2">ARTILHARIA</span>
           <div className="flex items-baseline gap-1">
             <span className="text-3xl font-condensed text-primary tracking-widest">{currentPlayer?.goals || 0}</span>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">GOLS</span>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
