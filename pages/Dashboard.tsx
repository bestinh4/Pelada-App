
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

  const togglePresence = async () => {
    if (!user || isUpdating) return;
    setIsUpdating(true);
    try {
      const playerRef = doc(db, "players", user.uid);
      await updateDoc(playerRef, { status: isConfirmed ? 'pendente' : 'presente' });
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      {/* Header Padronizado */}
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-white/70 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-100">
        <div className="w-12 h-12">
          <img src={mainLogoUrl} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-primary tracking-[0.4em] leading-none mb-0.5">ARENA</span>
          <h1 className="text-lg font-black tracking-tighter text-navy uppercase italic leading-none">O&A ELITE PRO</h1>
        </div>
      </header>

      <section className="px-6 mt-8">
        <div className="relative overflow-hidden rounded-apple-xl bg-white border border-slate-100 shadow-soft p-8 group">
          <div className="absolute inset-0 z-0 bg-croatia opacity-[0.03]"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-[9px] font-black uppercase text-primary tracking-widest block mb-1 italic">PRÓXIMO CONVITE</span>
                <h2 className="text-3xl font-condensed text-navy tracking-tight leading-none uppercase">Match Day: Arena Central</h2>
                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wider">Sábado, 18:00h • R$ 35,00</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-2xl fill-1">sports_soccer</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">LISTA DE CHAMADA</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-navy">{filledSlots}</span>
                  <span className="text-sm text-slate-300 font-bold">/ {totalSlots}</span>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (filledSlots / totalSlots) * 100)}%` }}
                ></div>
              </div>
            </div>

            <button 
              onClick={togglePresence}
              disabled={isUpdating}
              className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-widest transition-all shadow-xl active:scale-95 ${isConfirmed ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-primary text-white shadow-primary/20'}`}
            >
              <span className="material-symbols-outlined">{isConfirmed ? 'check_circle' : 'person_add'}</span>
              {isConfirmed ? 'PRESENÇA CONFIRMADA' : 'CONFIRMAR MINHA VAGA'}
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-apple-xl border border-slate-100 shadow-soft">
           <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest block mb-2">POSIÇÃO RANKING</span>
           <div className="flex items-baseline gap-1">
             <span className="text-3xl font-condensed text-navy tracking-widest">#04</span>
             <span className="text-[10px] text-emerald-500 font-bold">TOP 10</span>
           </div>
        </div>
        <div className="bg-white p-6 rounded-apple-xl border border-slate-100 shadow-soft">
           <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest block mb-2">ARTILHARIA</span>
           <div className="flex items-baseline gap-1">
             <span className="text-3xl font-condensed text-primary tracking-widest">{currentPlayer?.goals || 0}</span>
             <span className="text-[10px] text-slate-400 font-bold uppercase italic">GOLS</span>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
