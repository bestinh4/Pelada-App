
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
  
  const totalSlots = match?.totalSlots || 20;
  const confirmedPlayers = players.filter(p => p.status === 'presente');
  const filledSlots = confirmedPlayers.length;

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
      {/* Premium Header */}
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

      {/* Main Match Card */}
      <section className="px-6 mt-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-soft p-8">
          <div className="absolute inset-0 bg-croatia opacity-[0.05]"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="inline-block px-3 py-1 rounded-md bg-primary text-white text-[8px] font-black uppercase tracking-widest mb-4">MATCH DAY</span>
                <h2 className="text-4xl font-condensed text-navy tracking-tight leading-none uppercase mb-2">Arena Central Society</h2>
                <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  Sábado • 18:00h
                </div>
              </div>
              <div className="w-16 h-16 rounded-[1.5rem] bg-navy flex items-center justify-center text-white shadow-xl shadow-navy/20">
                <span className="material-symbols-outlined text-3xl fill-1">stadium</span>
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 mb-10">
              <div className="flex justify-between items-end mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">LISTA DE CONVOCAÇÃO</span>
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
      </section>

      {/* Stats Summary Section */}
      <section className="px-6 mt-8 grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-apple-xl border border-slate-100 shadow-soft">
           <div className="flex justify-between items-start mb-4">
             <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">RANKING</span>
             <span className="material-symbols-outlined text-emerald-500 text-lg">trending_up</span>
           </div>
           <div className="flex items-baseline gap-1">
             <span className="text-4xl font-condensed text-navy tracking-widest">#04</span>
             <span className="text-[10px] text-slate-400 font-bold">ELITE</span>
           </div>
        </div>
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
      </section>

      {/* Finance Preview */}
      <section className="px-6 mt-6 mb-10">
        <div className="bg-navy rounded-apple-xl p-6 text-white flex items-center justify-between shadow-xl shadow-navy/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <span className="material-symbols-outlined text-emerald-400">payments</span>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase opacity-60 tracking-[0.2em]">FINANCEIRO MENSAL</p>
              <h3 className="text-lg font-black italic uppercase italic tracking-tighter">Mensalidade Paga</h3>
            </div>
          </div>
          <span className="material-symbols-outlined text-emerald-400 text-3xl">verified</span>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
