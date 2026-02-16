
import React, { useState, useEffect } from 'react';
import { Match, Player, Page } from '../types.ts';
import { db, doc, updateDoc } from '../services/firebase.ts';
import { GlassCard } from '../components/ui/GlassCard.tsx';
import { GlassButton } from '../components/ui/GlassButton.tsx';

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
    if (!user || isUpdating) return;
    if (!currentPlayer) {
      onPageChange(Page.Profile);
      return;
    }
    setIsUpdating(true);
    try {
      const playerRef = doc(db, "players", user.uid);
      await updateDoc(playerRef, { status: isConfirmed ? 'pendente' : 'presente' });
    } catch (e) { alert("Erro de conexão."); } finally { setIsUpdating(false); }
  };

  const handleShareMatch = () => {
    const dateStr = match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : '--/--';
    let message = `🏆 *OUSADIA & ALEGRIA* 🇭🇷\n🏟️ *ARENA:* ${match?.location?.toUpperCase() || 'ARENA OUSADIA'}\n🗓️ *DATA:* ${dateStr}\n⏱️ *HORA:* ${match?.time || '--:--'}H\n\n📢 *STATUS:* ${confirmedPlayers.length} CONFIRMADOS ✅\n🔗 *APP:* ${window.location.origin}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const topScorers = [...players].filter(p => p.goals > 0).sort((a,b) => b.goals - a.goals).slice(0, 3);

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={mainLogoUrl} className="w-14 h-14 object-contain" alt="O&A" />
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black tracking-tighter text-navy uppercase italic leading-none">PRÓXIMO RACHA</h1>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
               <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">LISTA ABERTA</p>
            </div>
          </div>
        </div>
      </header>

      <main className="space-y-8">
        {/* HERO MESH GRADIENT CARD */}
        <div className="mesh-gradient-champions relative overflow-hidden rounded-[2.5rem] pt-12 pb-10 px-8 text-white shadow-elite">
          {/* STARBALL SVG WATERMARK */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.15] scale-[1.5] pointer-events-none select-none">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
              <path d="M50 0L61.2 35.5L97.6 35.5L68.1 57.4L79.3 92.9L50 71L20.7 92.9L31.9 57.4L2.4 35.5L38.8 35.5L50 0Z" />
            </svg>
          </div>
          
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] block">CROATIA EDITION</span>
              <h2 className="text-4xl font-condensed tracking-tight uppercase italic leading-none">{match?.location || "ARENA OUSADIA"}</h2>
            </div>
            <button onClick={handleShareMatch} className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center active:scale-90 transition-all">
              <span className="material-symbols-outlined text-white font-light">share</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 mb-10 relative z-10">
             <ProgressBlock label="JOGADORES" current={confirmedField.length} max={fieldSlots} progress={lineProgress} isWhite />
             <ProgressBlock label="GOLEIROS" current={confirmedGKs.length} max={gkSlots} progress={gkProgress} isWhite />
          </div>

          <div className="flex items-center gap-12 mb-10 py-6 border-y border-white/10 relative z-10">
             <div className="space-y-1">
               <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">AGENDA</p>
               <p className="text-sm font-extrabold uppercase italic">{match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '---'}</p>
             </div>
             <div className="space-y-1">
               <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">HORA</p>
               <p className="text-sm font-extrabold uppercase italic">{match?.time || '--:--'}H</p>
             </div>
          </div>

          <button 
            onClick={togglePresence} 
            disabled={isUpdating}
            className={`w-full h-18 rounded-[1.75rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl transition-all active:scale-95 relative z-10 flex items-center justify-center gap-3 ${isConfirmed ? 'bg-white text-navy' : 'bg-primary-bright text-white shadow-glow-red'}`}
          >
            {isUpdating ? <div className="w-5 h-5 border-2 border-current/20 border-t-current rounded-full animate-spin"></div> : (
              <>
                <span className="material-symbols-outlined">{isConfirmed ? 'check_circle' : 'stadium'}</span>
                {isConfirmed ? 'DENTRO DO JOGO' : 'CONFIRMAR PRESENÇA'}
              </>
            )}
          </button>
        </div>

        {/* RANKING SECTION */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-navy italic">ARTILHARIA</h3>
            <button onClick={() => onPageChange(Page.PlayerList)} className="text-[10px] font-extrabold text-primary uppercase tracking-widest border-b border-primary/30 pb-1">SQUAD COMPLETO</button>
          </div>
          <div className="space-y-3">
            {topScorers.map((p, i) => (
              <StatRow key={p.id} player={p} value={p.goals} rank={i+1} label="GOLS" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const ProgressBlock = ({ label, current, max, progress, isWhite }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end">
      <span className={`text-[10px] font-black uppercase italic tracking-widest ${isWhite ? 'text-white/70' : 'text-navy/50'}`}>{label}</span>
      <span className={`text-2xl font-condensed italic font-black ${isWhite ? 'text-white' : 'text-primary'}`}>{current}/{max}</span>
    </div>
    <div className={`h-2.5 rounded-full overflow-hidden ${isWhite ? 'bg-white/20' : 'bg-slate-100'}`}>
      <div className={`h-full transition-all duration-1000 ease-out rounded-full ${isWhite ? 'bg-white' : 'bg-primary'}`} style={{ width: `${progress}%` }}></div>
    </div>
  </div>
);

const StatRow = ({ player, value, rank, label }: any) => (
  <div className="bg-white border border-slate-100 rounded-[2rem] p-4 flex items-center justify-between shadow-soft-white hover:shadow-elite hover:-translate-y-1 transition-all animate-slide-up">
    <div className="flex items-center gap-4">
      <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center font-condensed font-black italic text-navy border border-slate-100 text-lg">{rank}</div>
      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
        <img src={player.photoUrl} className="w-full h-full object-cover" alt="" />
      </div>
      <div>
        <h4 className="text-[14px] font-black text-navy uppercase italic leading-none mb-1.5">{player.name}</h4>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{player.position}</span>
      </div>
    </div>
    <div className="text-right">
       <span className="text-3xl font-condensed italic font-black text-primary leading-none">{value}</span>
       <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

export default Dashboard;
