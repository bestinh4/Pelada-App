
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
      alert("Erro na Arena. Tente novamente.");
    } finally { 
      setIsUpdating(false); 
    }
  };

  const handleShareMatch = () => {
    if (!match) return;
    const dateStr = match.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { 
      weekday: 'long', day: '2-digit', month: 'long' 
    }) : 'Agendando...';
    
    let message = `⚽ *ARENA O&A ELITE* 🇭🇷\n\n`;
    message += `📍 *LOCAL:* ${match.location}\n`;
    message += `📅 *DATA:* ${dateStr}\n`;
    message += `⏰ *HORA:* ${match.time}h\n\n`;
    message += `✅ *STATUS:* ${confirmedPlayers.length} atletas confirmados\n`;
    message += `\n🔗 Confirme no app!\n${window.location.origin}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-700">
      <header className="px-6 pt-12 pb-8 flex items-center justify-between glass-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img src={mainLogoUrl} className="w-12 h-12 object-contain relative z-10" alt="Logo" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-navy uppercase italic leading-none">O&A ELITE</h1>
            <p className="text-[8px] font-black text-primary uppercase tracking-[0.4em] mt-1.5 flex items-center gap-1.5">
               VATRENI EDITION 🇭🇷
            </p>
          </div>
        </div>
        <div className="w-10 h-10 bg-croatia-pattern rounded-xl shadow-pro border border-white"></div>
      </header>

      <main className="px-6 mt-8">
        {/* MATCH CARD - PURE WHITE LUXURY */}
        <div className="bg-white rounded-[2.8rem] border border-slate-100 shadow-heavy overflow-hidden animate-scale-in">
          <div className="h-2 bg-croatia-pattern w-full"></div>
          <div className="p-7 md:p-9">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy/5 text-navy text-[8px] font-black uppercase tracking-widest rounded-full mb-4">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                  CONVOCAÇÃO ATIVA
                </span>
                <h2 className="text-4xl font-condensed tracking-tighter uppercase italic leading-none text-navy">{match?.location || "ELITE ARENA"}</h2>
              </div>
              <button onClick={handleShareMatch} className="w-14 h-14 bg-slate-50 rounded-[1.2rem] flex items-center justify-center text-primary active:scale-95 transition-all border border-slate-100 shadow-sm">
                <span className="material-symbols-outlined text-2xl">share</span>
              </button>
            </div>

            {/* PROGRESS BARS - REFINED ALIGNMENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              <div className="bg-slate-50/80 rounded-[2rem] p-5 border border-slate-100/50">
                <div className="flex justify-between items-end mb-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">JOGADORES</span>
                    <span className="text-lg font-black text-navy italic">DE LINHA</span>
                  </div>
                  <span className="text-xl font-black text-navy font-condensed italic">{confirmedField.length}<span className="text-xs text-slate-300 ml-1">/{fieldSlots}</span></span>
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${lineProgress}%` }}></div>
                </div>
              </div>
              
              <div className="bg-slate-50/80 rounded-[2rem] p-5 border border-slate-100/50">
                <div className="flex justify-between items-end mb-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">GOLEIROS</span>
                    <span className="text-lg font-black text-navy italic">PAREDÕES</span>
                  </div>
                  <span className="text-xl font-black text-navy font-condensed italic">{confirmedGKs.length}<span className="text-xs text-slate-300 ml-1">/{gkSlots}</span></span>
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-navy transition-all duration-1000 ease-out" style={{ width: `${gkProgress}%` }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-10 mb-10 px-4 border-l-4 border-primary/20">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">DATA</span>
                <span className="text-sm font-black text-navy uppercase italic tracking-tighter">
                  {match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : 'SÁBADO'}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">HORA</span>
                <span className="text-sm font-black text-navy uppercase italic tracking-tighter">{match?.time || '20:00'}H</span>
              </div>
            </div>

            <button 
              onClick={togglePresence}
              disabled={isUpdating}
              className={`w-full h-20 rounded-[1.8rem] flex items-center justify-center gap-4 font-black uppercase text-xs tracking-[0.2em] transition-all active:scale-[0.97] shadow-lg ${isConfirmed ? 'bg-navy text-white' : 'bg-primary text-white shadow-primary/30'}`}
            >
              {isUpdating ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-2xl">{isConfirmed ? 'check_circle' : 'sports_soccer'}</span>
                  {isConfirmed ? 'VOCÊ ESTÁ CONVOCADO' : 'CONFIRMAR PRESENÇA'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* TOP SCORERS - GRID ALIGNMENT */}
        <div className="mt-14 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-primary rounded-full"></div>
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-navy italic">ARTILHARIA VATRENI</h3>
            </div>
            <button onClick={() => onPageChange(Page.PlayerList)} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4">VER TODOS</button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {players.filter(p => p.goals > 0).sort((a,b) => b.goals - a.goals).slice(0, 3).map((p, i) => (
              <div key={p.id} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-pro flex items-center justify-between group transition-all hover:border-navy/10 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-50 relative">
                    <img 
                      src={p.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=003876&color=fff`} 
                      className="w-full h-full object-cover" 
                      alt={p.name}
                    />
                    {i === 0 && <div className="absolute top-0 right-0 bg-amber-400 w-4 h-4 rounded-bl-lg flex items-center justify-center"><span className="material-symbols-outlined text-[8px] text-white font-bold">star</span></div>}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-black text-navy uppercase italic leading-none mb-1.5">{p.name}</h4>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.position}</span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                   <div className="flex flex-col">
                      <span className="text-3xl font-black text-primary italic font-condensed leading-none">{p.goals}</span>
                      <span className="text-[7px] font-black text-slate-300 uppercase tracking-tighter">GOLS</span>
                   </div>
                   <span className="material-symbols-outlined text-slate-100 text-3xl">chevron_right</span>
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
