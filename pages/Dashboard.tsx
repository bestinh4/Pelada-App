
import React, { useState, useEffect } from 'react';
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
  const [fieldPercent, setFieldPercent] = useState(0);
  const [gkPercent, setGkPercent] = useState(0);

  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const currentPlayer = players.find(p => p.id === user?.uid);
  const isConfirmed = currentPlayer?.status === 'presente';
  
  const confirmedPlayers = players.filter(p => p.status === 'presente');
  const fieldSlotsLimit = match?.fieldSlots || 30;
  const gkSlotsLimit = match?.gkSlots || 5;

  const confirmedGKs = confirmedPlayers.filter(p => p.position === 'Goleiro');
  const confirmedField = confirmedPlayers.filter(p => p.position !== 'Goleiro');

  const effectiveGKs = confirmedGKs.slice(0, gkSlotsLimit);
  const effectiveField = confirmedField.slice(0, fieldSlotsLimit);
  
  const waitlistGKs = confirmedGKs.slice(gkSlotsLimit);
  const waitlistField = confirmedField.slice(fieldSlotsLimit);
  const fullWaitlist = [...waitlistGKs, ...waitlistField];

  // Líderes (Top 3 Artilheiros)
  const topScorers = [...players]
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 3);

  const canceledPlayers = players.filter(p => p.status === 'pendente' && (p.goals > 0 || p.assists > 0));

  useEffect(() => {
    const timer = setTimeout(() => {
      setFieldPercent(Math.min(100, (confirmedField.length / fieldSlotsLimit) * 100));
      setGkPercent(Math.min(100, (confirmedGKs.length / gkSlotsLimit) * 100));
    }, 300);
    return () => clearTimeout(timer);
  }, [confirmedField.length, confirmedGKs.length, fieldSlotsLimit, gkSlotsLimit]);

  const togglePresence = async () => {
    if (!user || isUpdating || !currentPlayer) return;
    setIsUpdating(true);
    try {
      const playerRef = doc(db, "players", user.uid);
      await updateDoc(playerRef, { status: isConfirmed ? 'pendente' : 'presente' });
    } catch (e) { 
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
    const flag = "🇭🇷";
    
    let message = `⚽ *CONVOCAÇÃO O&A ELITE* ${flag} ⚽\n\n`;
    message += `📍 *Local:* ${match.location}\n`;
    message += `📅 *Data:* ${dateStr}\n`;
    message += `⏰ *Hora:* ${match.time}h\n\n`;
    
    message += `✅ *CONFIRMADOS (${effectiveField.length + effectiveGKs.length}/${fieldSlotsLimit + gkSlotsLimit})*\n`;
    if (effectiveGKs.length > 0) {
      message += `_Goleiros:_\n`;
      effectiveGKs.forEach((p, i) => message += `${i+1}. ${p.name}\n`);
    }
    if (effectiveField.length > 0) {
      message += `_Linha:_\n`;
      effectiveField.forEach((p, i) => message += `${i+1}. ${p.name}\n`);
    }

    if (fullWaitlist.length > 0) {
      message += `\n⏳ *LISTA DE ESPERA (${fullWaitlist.length})*\n`;
      fullWaitlist.forEach((p, i) => message += `${i+1}. ${p.name} (${p.position})\n`);
    }

    if (canceledPlayers.length > 0) {
      message += `\n❌ *DESISTÊNCIAS / FORA*\n`;
      canceledPlayers.slice(0, 5).forEach((p) => message += `- ${p.name}\n`);
    }
    
    message += `\n🔥 *Confirme pelo App:* \n🔗 ${appUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-white/50 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 animate-fade-in">
        <div className="flex items-center gap-4">
          <img src={mainLogoUrl} className="w-12 h-12 object-contain hover:rotate-12 transition-transform" alt="Logo" />
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
        {/* Match Info Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-soft p-8 mb-10 animate-scale-in">
          <div className="absolute inset-0 bg-croatia opacity-[0.05]"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div className="animate-slide-up">
                <span className="inline-block px-3 py-1 rounded-md bg-primary text-white text-[8px] font-black uppercase tracking-widest mb-4">PRÓXIMA PELADA</span>
                <h2 className="text-4xl font-condensed text-navy tracking-tight leading-none uppercase mb-2">{match?.location || "O&A Arena Elite"}</h2>
                <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  {match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) : '---'} • {match?.time || '--:--'}h
                </div>
              </div>
              <button onClick={handleShareMatch} className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm active:scale-90 transition-all border border-emerald-100 hover:bg-emerald-600 hover:text-white">
                <span className="material-symbols-outlined text-2xl">share</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 animate-slide-up delay-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black uppercase text-slate-400">LINHA</span>
                  <span className="text-xs font-black text-navy">{confirmedField.length}/{fieldSlotsLimit}</span>
                </div>
                <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${fieldPercent}%` }}></div>
                </div>
              </div>
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 animate-slide-up delay-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black uppercase text-slate-400">GKs</span>
                  <span className="text-xs font-black text-navy">{confirmedGKs.length}/{gkSlotsLimit}</span>
                </div>
                <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${gkPercent}%` }}></div>
                </div>
              </div>
            </div>

            <button 
              onClick={togglePresence}
              disabled={isUpdating}
              className={`w-full h-18 rounded-[1.5rem] flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl active:scale-95 z-30 relative ${isConfirmed ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-primary text-white shadow-primary/30 animate-pulse'}`}
            >
              <span className="material-symbols-outlined text-2xl">{isConfirmed ? 'check_circle' : 'person_add'}</span>
              {isConfirmed ? 'VOCÊ ESTÁ NA LISTA' : 'CONFIRMAR PRESENÇA'}
            </button>
          </div>
        </div>

        {/* Season Leaders Section */}
        <div className="space-y-6 animate-fade-in delay-3">
           <div className="flex items-center gap-3 px-2">
             <div className="w-1.5 h-6 bg-primary rounded-full"></div>
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-navy italic">LÍDERES DA TEMPORADA</h3>
           </div>

           <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-soft">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary text-xl">emoji_events</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-navy">ARTILHARIA ELITE</span>
                    </div>
                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">GOLS</span>
                 </div>
                 
                 <div className="space-y-4">
                    {topScorers.length > 0 ? topScorers.map((p, i) => (
                      <div key={p.id} className="flex items-center justify-between animate-slide-in-right" style={{ animationDelay: `${i * 100}ms` }}>
                         <div className="flex items-center gap-3">
                            <div className="relative">
                               <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                  <img src={p.photoUrl} className="w-full h-full object-cover" alt={p.name} />
                               </div>
                               <div className="absolute -top-1 -left-1 w-5 h-5 bg-navy text-white text-[8px] font-black flex items-center justify-center rounded-lg border-2 border-white">{i + 1}º</div>
                            </div>
                            <div>
                               <h4 className="text-[12px] font-black text-navy uppercase italic leading-none mb-1">{p.name}</h4>
                               <p className="text-[8px] font-bold text-slate-400 uppercase">{p.position}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className="text-xl font-black text-primary italic leading-none">{p.goals}</span>
                            <p className="text-[7px] font-black text-slate-300 uppercase">GOLS</p>
                         </div>
                      </div>
                    )) : (
                      <div className="py-8 text-center opacity-30">
                        <span className="material-symbols-outlined text-3xl mb-1">sports_soccer</span>
                        <p className="text-[8px] font-black uppercase tracking-widest">Aguardando início da temporada</p>
                      </div>
                    )}
                 </div>

                 {topScorers.length > 0 && (
                   <button 
                    onClick={() => onPageChange(Page.PlayerList)}
                    className="w-full mt-6 py-3 bg-slate-50 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-navy hover:text-white transition-all"
                   >
                     VER RANKING COMPLETO
                   </button>
                 )}
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
