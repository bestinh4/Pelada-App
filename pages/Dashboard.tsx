
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
    } catch (e) { alert("Erro de conexão com a arena."); } finally { setIsUpdating(false); }
  };

  const handleShareMatch = () => {
    const dateStr = match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : '---';
    const text = `🏆 *O&A ELITE CHAMPIONS* 🇭🇷\n\n📍 ${match?.location || 'Elite Arena'}\n🗓️ ${dateStr} às ${match?.time || '--:--'}h\n\n📢 *STATUS:* ${confirmedPlayers.length} convocados!\n🔗 ${window.location.origin}`;
    if (navigator.share) navigator.share({ title: 'O&A Elite Pro', text, url: window.location.origin });
    else window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const topScorers = [...players].filter(p => p.goals > 0).sort((a,b) => b.goals - a.goals).slice(0, 3);

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={mainLogoUrl} className="w-11 h-11 object-contain grayscale opacity-20" alt="O&A" />
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">ELITE MATCHDAY</h1>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-red-glow"></span>
               <p className="text-[8px] font-extrabold text-primary uppercase tracking-[0.4em]">LIVE OPERATION</p>
            </div>
          </div>
        </div>
      </header>

      <main className="space-y-12">
        {/* MATCH HERO CARD */}
        <GlassCard className="relative overflow-hidden pt-10 pb-8 px-8 border-white/90">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] scale-[2] pointer-events-none">
             <span className="material-symbols-outlined text-[80px]">stadium</span>
          </div>
          
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-2">
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] block">SESSÃO OFICIAL</span>
              <h2 className="text-3xl font-condensed tracking-tight uppercase italic leading-none text-navy">{match?.location || "ARENA ELITE"}</h2>
            </div>
            <button onClick={handleShareMatch} className="w-12 h-12 bg-white/60 border border-white/80 rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-sm">
              <span className="material-symbols-outlined text-navy font-light">ios_share</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-10">
             <ProgressBlock label="LINHA" current={confirmedField.length} max={fieldSlots} progress={lineProgress} color="primary" />
             <ProgressBlock label="PAREDÕES" current={confirmedGKs.length} max={gkSlots} progress={gkProgress} color="navy" />
          </div>

          <div className="flex items-center gap-10 mb-10 py-5 border-y border-slate-50">
             <div className="space-y-1">
               <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">DATA DO JOGO</p>
               <p className="text-[11px] font-extrabold text-navy uppercase italic">{match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '---'}</p>
             </div>
             <div className="space-y-1">
               <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">KICK-OFF</p>
               <p className="text-[11px] font-extrabold text-navy uppercase italic">{match?.time || '--:--'}H</p>
             </div>
          </div>

          <GlassButton 
            variant={isConfirmed ? 'secondary' : 'primary'} 
            size="xl" 
            onClick={togglePresence} 
            disabled={isUpdating}
            className="w-full !rounded-3xl shadow-premium"
          >
            {isUpdating ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (
              <>
                <span className="material-symbols-outlined">{isConfirmed ? 'verified' : 'sports_soccer'}</span>
                {isConfirmed ? 'CONVOCAÇÃO ACEITA' : 'CONFIRMAR ESCALAÇÃO'}
              </>
            )}
          </GlassButton>
        </GlassCard>

        {/* RANKING EDITORIAL */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-navy italic">ELITE RANKING</h3>
            <button onClick={() => onPageChange(Page.PlayerList)} className="text-[9px] font-extrabold text-primary uppercase tracking-widest underline underline-offset-8">VER TODOS</button>
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

const ProgressBlock = ({ label, current, max, progress, color }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end">
      <span className="text-[10px] font-black text-navy uppercase italic tracking-widest">{label}</span>
      <span className={`text-xl font-condensed italic font-black ${color === 'primary' ? 'text-primary' : 'text-navy'}`}>{current}/{max}</span>
    </div>
    <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
      <div className={`h-full transition-all duration-1000 ease-out rounded-full ${color === 'primary' ? 'btn-champions-red' : 'btn-champions-blue'}`} style={{ width: `${progress}%` }}></div>
    </div>
  </div>
);

const StatRow = ({ player, value, rank, label }: any) => (
  <GlassCard className="!p-4 border-white/80 flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all">
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center font-condensed font-black italic text-navy border border-slate-100">{rank}</div>
      <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
        <img src={player.photoUrl} className="w-full h-full object-cover" alt="" />
      </div>
      <div>
        <h4 className="text-[12px] font-black text-navy uppercase italic leading-none mb-1">{player.name}</h4>
        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{player.position}</span>
      </div>
    </div>
    <div className="text-right">
       <span className="text-2xl font-condensed italic font-black text-primary leading-none">{value}</span>
       <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
    </div>
  </GlassCard>
);

export default Dashboard;
