
import React, { useState, useEffect } from 'react';
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
  const [lineProgress, setLineProgress] = useState(0);
  const [gkProgress, setGkProgress] = useState(0);

  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const currentPlayer = players.find(p => p.id === user?.uid);
  const isConfirmed = currentPlayer?.status === 'presente';
  
  const confirmedPlayers = players.filter(p => p.status === 'presente');
  const fieldSlots = match?.fieldSlots || 30;
  const gkSlots = match?.gkSlots || 4;

  const confirmedGKs = confirmedPlayers.filter(p => p.position === 'Goleiro');
  const confirmedField = confirmedPlayers.filter(p => p.position !== 'Goleiro');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLineProgress(Math.min(100, (confirmedField.length / fieldSlots) * 100));
      setGkProgress(Math.min(100, (confirmedGKs.length / gkSlots) * 100));
    }, 400);
    return () => clearTimeout(timer);
  }, [confirmedField.length, confirmedGKs.length, fieldSlots, gkSlots]);

  const togglePresence = async () => {
    if (!user || isUpdating || !currentPlayer) return;
    setIsUpdating(true);
    try {
      const playerRef = doc(db, "players", user.uid);
      await updateDoc(playerRef, { status: isConfirmed ? 'pendente' : 'presente' });
    } catch (e) { alert("Falha na arena."); } finally { setIsUpdating(false); }
  };

  return (
    <div className="flex flex-col">
      {/* ELITE HEADER */}
      <header className="px-8 pt-12 pb-6 flex items-center justify-between glass-header sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src={mainLogoUrl} className="w-10 h-10 object-contain" alt="O&A" />
          <div>
            <h1 className="text-lg font-black tracking-tighter text-navy uppercase italic leading-none">O&A ELITE</h1>
            <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mt-1">EST. 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full">
          <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
          <span className="text-[9px] font-black text-navy uppercase tracking-widest">ON-LINE</span>
        </div>
      </header>

      <main className="px-6 mt-6 space-y-10">
        {/* MATCH HERO CARD */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-elite overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="h-1.5 bg-primary w-full"></div>
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">PRÓXIMA BATALHA</span>
                <h2 className="text-3xl font-condensed tracking-tighter uppercase italic leading-none text-navy">{match?.location || "ARENA ELITE"}</h2>
              </div>
              <button className="w-12 h-12 bg-slate-50 text-navy rounded-xl flex items-center justify-center active:scale-90 transition-all">
                <span className="material-symbols-outlined text-2xl">share</span>
              </button>
            </div>

            {/* PROGRESS SECTION */}
            <div className="grid grid-cols-1 gap-5 mb-8">
               <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-navy uppercase italic">JOGADORES DE LINHA</span>
                    <span className="text-xs font-black text-primary font-condensed">{confirmedField.length}/{fieldSlots}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${lineProgress}%` }}></div>
                  </div>
               </div>
               
               <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-navy uppercase italic">GOLEIROS (ISENTOS)</span>
                    <span className="text-xs font-black text-navy font-condensed">{confirmedGKs.length}/{gkSlots}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-navy transition-all duration-1000 ease-out" style={{ width: `${gkProgress}%` }}></div>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-10 mb-10 py-5 border-y border-slate-50">
               <div>
                 <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">DATA</p>
                 <p className="text-xs font-black text-navy uppercase italic">{match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '---'}</p>
               </div>
               <div className="w-px h-6 bg-slate-100"></div>
               <div>
                 <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">HORÁRIO</p>
                 <p className="text-xs font-black text-navy uppercase italic">{match?.time || '--:--'}H</p>
               </div>
            </div>

            <button 
              onClick={togglePresence}
              disabled={isUpdating}
              className={`w-full h-18 rounded-2xl flex items-center justify-center gap-4 font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 shadow-button ${isConfirmed ? 'bg-navy text-white' : 'bg-primary text-white'}`}
            >
              {isUpdating ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                <>
                  <span className="material-symbols-outlined text-2xl">{isConfirmed ? 'verified' : 'stadium'}</span>
                  {isConfirmed ? 'VOCÊ ESTÁ CONVOCADO' : 'CONFIRMAR PRESENÇA'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* TOP SCORERS SECTION */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-navy italic ml-1">ARTILHARIA ELITE</h3>
            <button onClick={() => onPageChange(Page.PlayerList)} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4">VER TODOS</button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {players.filter(p => p.goals > 0).sort((a,b) => b.goals - a.goals).slice(0, 3).map((p, i) => (
              <div key={p.id} className="bg-white rounded-[1.8rem] p-4 border border-slate-100 shadow-elite flex items-center justify-between group transition-all hover:border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-50">
                    <img src={p.photoUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-navy uppercase italic leading-none mb-1">{p.name}</h4>
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{p.position}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-3xl font-black text-primary font-condensed italic">{p.goals}</span>
                   <span className="material-symbols-outlined text-slate-200 text-sm">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
