import React, { useState } from 'react';
import { Match, Player, Page } from '../types.ts';
import { db, doc, updateDoc } from '../services/firebase.ts';
import { sendPushNotification } from '../services/notificationService.ts';

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
      const newStatus = isConfirmed ? 'pendente' : 'presente';
      await updateDoc(playerRef, { status: newStatus });
      
      if (newStatus === 'presente') {
        sendPushNotification(
          "✅ Presença Confirmada!", 
          `Você está na lista para a pelada em ${match?.location || 'Arena Elite'}.`
        );
      } else {
        sendPushNotification(
          "⚠️ Presença Cancelada", 
          "Sua vaga foi liberada. Esperamos você na próxima!"
        );
      }
    } catch (e) { 
      console.error(e); 
      alert("Erro ao atualizar presença.");
    } finally { 
      setIsUpdating(false); 
    }
  };

  const handleShareMatch = () => {
    if (!match) return;
    const dateStr = new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { 
      weekday: 'long', day: '2-digit', month: 'long' 
    });
    const appUrl = window.location.origin;
    const message = `⚽ *CONVOCAÇÃO O&A ELITE* ⚽\n\n📍 *Local:* ${match.location}\n📅 *Data:* ${dateStr}\n⏰ *Hora:* ${match.time}h\n\n🔥 *Confirme sua presença pelo link:* \n🔗 ${appUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
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
              <button 
                onClick={handleShareMatch}
                className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm active:scale-90 transition-all border border-emerald-100"
              >
                <span className="material-symbols-outlined text-2xl">share</span>
              </button>
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

        <div className="space-y-6">
           <div className="flex items-center gap-3 px-2">
             <div className="w-1.5 h-6 bg-primary rounded-full"></div>
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-navy italic">LÍDERES DA TEMPORADA</h3>
           </div>

           <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-soft">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary text-xl">emoji_events</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-navy">ARTILHARIA</span>
                    </div>
                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">GOLS</span>
                 </div>
                 <div className="space-y-3">
                    {topScorers.length > 0 ? topScorers.map((p, i) => (
                      <div key={p.id} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-50">
                               <img src={p.photoUrl} className="w-full h-full object-cover" />
                            </div>
                            <div>
                               <h4 className="text-[11px] font-black text-navy uppercase italic leading-none mb-1">{p.name}</h4>
                               <p className="text-[8px] font-bold text-slate-400 uppercase">{p.position}</p>
                            </div>
                         </div>
                         <span className="text-md font-black text-primary italic">{p.goals}</span>
                      </div>
                    )) : <p className="text-center py-2 text-[9px] text-slate-300 italic">Nenhum gol registrado</p>}
                 </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-soft">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <span className="material-symbols-outlined text-navy text-xl">volunteer_activism</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-navy">GARÇONS</span>
                    </div>
                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">AST</span>
                 </div>
                 <div className="space-y-3">
                    {topAssistants.length > 0 ? topAssistants.map((p, i) => (
                      <div key={p.id} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-50">
                               <img src={p.photoUrl} className="w-full h-full object-cover" />
                            </div>
                            <div>
                               <h4 className="text-[11px] font-black text-navy uppercase italic leading-none mb-1">{p.name}</h4>
                               <p className="text-[8px] font-bold text-slate-400 uppercase">{p.position}</p>
                            </div>
                         </div>
                         <span className="text-md font-black text-navy italic">{p.assists}</span>
                      </div>
                    )) : <p className="text-center py-2 text-[9px] text-slate-300 italic">Nenhuma assistência</p>}
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;