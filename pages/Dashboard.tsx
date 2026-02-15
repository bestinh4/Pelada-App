
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
    } catch (e) { 
      alert("Erro na conexão. Tente novamente.");
    } finally { 
      setIsUpdating(false); 
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-700">
      <header className="px-8 pt-12 pb-8 flex items-center justify-between glass-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img src={mainLogoUrl} className="w-12 h-12 object-contain" alt="Logo" />
          <div>
            <h1 className="text-xl font-black tracking-tighter text-navy uppercase italic leading-none">O&A ELITE</h1>
            <p className="text-[8px] font-black text-primary uppercase tracking-[0.4em] mt-1.5">PURE PERFORMANCE</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
           <span className="text-[9px] font-black text-navy uppercase tracking-widest">LIVE</span>
        </div>
      </header>

      <main className="px-6 mt-8">
        {/* CARD PRINCIPAL - CLEAN & BOLD */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-heavy overflow-hidden animate-scale-in">
          <div className="h-2 bg-primary w-full"></div>
          <div className="p-8">
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PRÓXIMA CONVOCAÇÃO</span>
                <h2 className="text-4xl font-condensed tracking-tighter uppercase italic leading-tight text-navy">
                  {match?.location || "ARENA ELITE"}
                </h2>
              </div>
              <button className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary shadow-sm border border-slate-100 active:scale-90 transition-all">
                <span className="material-symbols-outlined text-2xl">share</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-10">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black text-navy uppercase tracking-widest italic">LINHA ({confirmedField.length}/{fieldSlots})</span>
                   <span className="text-xs font-black text-primary italic font-condensed">{Math.round(lineProgress)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${lineProgress}%` }}></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black text-navy uppercase tracking-widest italic">GOLEIROS ({confirmedGKs.length}/{gkSlots})</span>
                   <span className="text-xs font-black text-navy italic font-condensed">{Math.round(gkProgress)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-navy transition-all duration-1000" style={{ width: `${gkProgress}%` }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-12 mb-10 py-4 border-y border-slate-50">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CALENDÁRIO</span>
                <span className="text-xs font-black text-navy uppercase italic">{match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : '---'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CHAMADA</span>
                <span className="text-xs font-black text-navy uppercase italic">{match?.time || '--:--'}H</span>
              </div>
            </div>

            <button 
              onClick={togglePresence}
              disabled={isUpdating}
              className={`w-full h-18 rounded-2xl flex items-center justify-center gap-4 font-black uppercase text-xs tracking-widest transition-all active:scale-[0.98] shadow-lg ${isConfirmed ? 'bg-navy text-white' : 'bg-primary text-white shadow-primary/20'}`}
            >
              {isUpdating ? (
                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-2xl">{isConfirmed ? 'verified' : 'sports_soccer'}</span>
                  {isConfirmed ? 'CONVOCADO' : 'CONFIRMAR PRESENÇA'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* ARTILHARIA - REFINED LIST */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-navy italic">QUADRO DE HONRA</h3>
            <button onClick={() => onPageChange(Page.PlayerList)} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline underline-offset-4 decoration-2">DETALHES</button>
          </div>

          <div className="space-y-3">
            {players.filter(p => p.goals > 0).sort((a,b) => b.goals - a.goals).slice(0, 3).map((p, i) => (
              <div key={p.id} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-pro flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <img src={p.photoUrl} className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                  <div>
                    <h4 className="text-[12px] font-black text-navy uppercase italic leading-none mb-1">{p.name}</h4>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{p.position}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-2xl font-black text-primary font-condensed italic">{p.goals}</span>
                   <span className="material-symbols-outlined text-slate-200 text-sm">trending_up</span>
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
