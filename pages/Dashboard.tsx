
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
    
    const flag = "🇭🇷";
    let message = `⚽ *ARENA O&A ELITE* ${flag}\n\n`;
    message += `📍 *LOCAL:* ${match.location}\n`;
    message += `📅 *DATA:* ${dateStr}\n`;
    message += `⏰ *HORA:* ${match.time}h\n\n`;
    message += `✅ *STATUS:* ${confirmedPlayers.length} atletas confirmados\n`;
    message += `\n🔗 Confirme agora no app!\n${window.location.origin}`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-700">
      {/* HEADER ELITE */}
      <header className="px-6 pt-12 pb-8 flex items-center justify-between sticky top-0 z-50 glass">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
            <img src={mainLogoUrl} className="w-14 h-14 object-contain relative z-10" alt="Logo" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-navy uppercase italic leading-none">O&A ELITE</h1>
            <p className="text-[8px] font-bold text-primary uppercase tracking-[0.4em] mt-1">Sincronizado AO VIVO</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">SERVER OK</span>
          </div>
        </div>
      </header>

      <main className="px-6 mt-10 pb-40">
        {/* MATCH CARD PRO */}
        <div className="relative overflow-hidden rounded-[3rem] bg-navy-deep p-1 text-white shadow-pro animate-scale-in">
          <div className="absolute inset-0 bg-croatia opacity-[0.15]"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32"></div>
          
          <div className="relative z-10 p-8">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="inline-block px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-lg mb-4">MATCH DAY</span>
                <h2 className="text-5xl font-condensed tracking-tighter uppercase italic leading-none">{match?.location || "O&A ARENA"}</h2>
              </div>
              <button onClick={handleShareMatch} className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-navy active:scale-90 transition-all">
                <span className="material-symbols-outlined text-3xl">ios_share</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-5 border border-white/10">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[9px] font-black uppercase text-white/40">LINHA</span>
                  <span className="text-lg font-black">{confirmedField.length}<span className="text-[10px] text-white/30 ml-1">/{fieldSlots}</span></span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(237,29,35,0.5)]" style={{ width: `${lineProgress}%` }}></div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-5 border border-white/10">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[9px] font-black uppercase text-white/40">GKs</span>
                  <span className="text-lg font-black">{confirmedGKs.length}<span className="text-[10px] text-white/30 ml-1">/{gkSlots}</span></span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: `${gkProgress}%` }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-10 px-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">event</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">
                  {match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : '---'}
                </span>
              </div>
              <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">{match?.time || '--:--'}H</span>
              </div>
            </div>

            <button 
              onClick={togglePresence}
              disabled={isUpdating}
              className={`w-full h-20 rounded-[2rem] flex items-center justify-center gap-4 font-black uppercase text-xs tracking-[0.3em] transition-all shadow-2xl active:scale-95 ${isConfirmed ? 'bg-emerald-500 text-white' : 'bg-primary text-white shadow-primary/30'}`}
            >
              {isUpdating ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-3xl">{isConfirmed ? 'verified' : 'stadium'}</span>
                  {isConfirmed ? 'PRESENÇA CONFIRMADA' : 'CONFIRMAR AGORA'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* INDICADORES DE LÍDERES */}
        <div className="mt-16 space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-navy rounded-full"></div>
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-navy italic">RANKING ELITE</h3>
            </div>
            <button onClick={() => onPageChange(Page.PlayerList)} className="text-[9px] font-black text-primary uppercase tracking-widest border-b-2 border-primary/20 pb-0.5">VER TODOS</button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {players.filter(p => p.goals > 0).sort((a,b) => b.goals - a.goals).slice(0, 3).map((p, i) => (
              <div key={p.id} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-pro flex items-center justify-between animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-50 bg-slate-100">
                      <img 
                        src={p.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=003876&color=fff`} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                        alt={p.name} 
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=003876&color=fff`; }}
                      />
                    </div>
                    <div className="absolute -top-1 -left-1 w-6 h-6 bg-navy text-white text-[10px] font-black flex items-center justify-center rounded-lg border-2 border-white">{i+1}º</div>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-navy uppercase italic tracking-tight mb-1">{p.name}</h4>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{p.position}</span>
                  </div>
                </div>
                <div className="text-right bg-slate-50 px-5 py-2 rounded-2xl">
                   <span className="text-2xl font-black text-primary italic font-condensed">{p.goals}</span>
                   <p className="text-[7px] font-black text-slate-300 uppercase leading-none">GOLS</p>
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
