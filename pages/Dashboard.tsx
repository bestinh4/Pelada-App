
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
  const confirmedGKs = confirmedPlayers.filter(p => p.position === 'Goleiro').length;
  const confirmedField = confirmedPlayers.filter(p => p.position !== 'Goleiro').length;

  const fieldSlotsLimit = match?.fieldSlots || 30;
  const gkSlotsLimit = match?.gkSlots || 5;

  const topScorers = [...players]
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 3);

  const topAssistants = [...players]
    .filter(p => p.assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 3);

  const togglePresence = async () => {
    if (!user || isUpdating) return;

    if (!isConfirmed) {
      const isGK = currentPlayer?.position === 'Goleiro';
      if (isGK && confirmedGKs >= gkSlotsLimit) {
        alert("Vagas de Goleiro esgotadas!");
        return;
      }
      if (!isGK && confirmedField >= fieldSlotsLimit) {
        alert("Vagas de Linha esgotadas!");
        return;
      }
    }

    setIsUpdating(true);
    try {
      const playerRef = doc(db, "players", user.uid);
      await updateDoc(playerRef, { status: isConfirmed ? 'pendente' : 'presente' });
    } catch (e) { 
      console.error(e); 
      alert("Erro ao atualizar presença.");
    } finally { 
      setIsUpdating(false); 
    }
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
          <span className="text-[9px] font-black text-navy uppercase tracking-widest">AO VIVO</span>
        </div>
      </header>

      <section className="px-6 mt-8 pb-32">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-soft p-8 mb-6">
          <div className="absolute inset-0 bg-croatia opacity-[0.05]"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="inline-block px-3 py-1 rounded-md bg-primary text-white text-[8px] font-black uppercase tracking-widest mb-4">PRÓXIMA PELADA</span>
                <h2 className="text-4xl font-condensed text-navy tracking-tight leading-none uppercase mb-2">{match?.location || "O&A Arena Elite"}</h2>
                <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  {match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) : '---'} • {match?.time || '--:--'}h
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black uppercase text-slate-400">LINHA</span>
                  <span className="text-xs font-black text-navy">{confirmedField}/{fieldSlotsLimit}</span>
                </div>
                <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (confirmedField / fieldSlotsLimit) * 100)}%` }}></div>
                </div>
              </div>
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black uppercase text-slate-400">GKs</span>
                  <span className="text-xs font-black text-navy">{confirmedGKs}/{gkSlotsLimit}</span>
                </div>
                <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (confirmedGKs / gkSlotsLimit) * 100)}%` }}></div>
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={togglePresence}
              disabled={isUpdating}
              className={`w-full h-18 rounded-[1.5rem] flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl active:scale-95 z-30 relative ${isConfirmed ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-primary text-white shadow-primary/30'}`}
            >
              <span className="material-symbols-outlined text-2xl">{isConfirmed ? 'check_circle' : 'person_add'}</span>
              {isConfirmed ? 'CONFIRMADO NA LISTA' : 'CONFIRMAR PRESENÇA'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-apple-xl p-6 border border-slate-100 shadow-soft flex items-center justify-between mb-10">
           <div>
              <p className="text-[9px] font-black uppercase text-slate-300 tracking-[0.3em] mb-1.5">SUA CONVOCAÇÃO</p>
              <p className="text-xl font-condensed tracking-widest text-navy uppercase italic leading-none">{currentPlayer?.position || 'RESERVA'}</p>
           </div>
           <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-navy text-2xl">sports_soccer</span>
           </div>
        </div>

        <div className="space-y-8">
           <div className="flex items-center gap-3 px-2">
             <div className="w-1.5 h-6 bg-primary rounded-full"></div>
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-navy italic">LÍDERES DA TEMPORADA</h3>
           </div>

           <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                       <span className="material-symbols-outlined text-primary">emoji_events</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-navy">TOP ARTILHEIROS</span>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    {topScorers.length > 0 ? topScorers.map((p, i) => (
                      <div key={p.id} className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100">
                               <img src={p.photoUrl} className="w-full h-full object-cover" />
                            </div>
                            <div>
                               <h4 className="text-xs font-black text-navy uppercase italic">{p.name}</h4>
                               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{p.position}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <span className="text-lg font-black text-primary italic">{p.goals}</span>
                         </div>
                      </div>
                    )) : <p className="text-center py-4 text-[9px] font-bold text-slate-300 uppercase italic">Aguardando dados...</p>}
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
