
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
    if (!user || isUpdating) return;
    
    // Se o jogador ainda não existe na lista (onboarding incompleto), redireciona
    if (!currentPlayer) {
      onPageChange(Page.Profile);
      return;
    }

    setIsUpdating(true);
    try {
      const playerRef = doc(db, "players", user.uid);
      await updateDoc(playerRef, { 
        status: isConfirmed ? 'pendente' : 'presente' 
      });
    } catch (e) { 
      console.error("Erro ao atualizar presença:", e);
      alert("Falha ao comunicar com a Arena. Tente novamente."); 
    } finally { 
      setIsUpdating(false); 
    }
  };

  const handleShareMatch = () => {
    const dateStr = match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : '---';
    const text = `⚽ *CONVOCAÇÃO ELITE* 🇭🇷\n\n` +
                 `📍 *LOCAL:* ${match?.location || 'Arena Elite'}\n` +
                 `🗓️ *DATA:* ${dateStr}\n` +
                 `⏱️ *HORA:* ${match?.time || '--:--'}h\n\n` +
                 `📢 *STATUS:* ${confirmedPlayers.length} atletas já confirmados!\n` +
                 `🔗 *CONFIRME SUA VAGA AQUI:* ${window.location.origin}\n\n` +
                 `#O&AElite #Futebol #EliteArena`;

    if (navigator.share) {
      navigator.share({
        title: 'Pelada O&A Elite',
        text: text,
        url: window.location.origin,
      });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const topScorers = [...players].filter(p => p.goals > 0).sort((a,b) => b.goals - a.goals).slice(0, 3);
  const topAssists = [...players].filter(p => p.assists > 0).sort((a,b) => b.assists - a.assists).slice(0, 3);

  return (
    <div className="flex flex-col animate-fade-in">
      <header className="px-6 pt-10 pb-6 flex items-center justify-between glass-header sticky top-0 z-40 transition-all duration-300">
        <div className="flex items-center gap-3 animate-slide-up">
          <img src={mainLogoUrl} className="w-9 h-9 object-contain hover:scale-110 transition-transform cursor-pointer" alt="O&A" />
          <div>
            <h1 className="text-base font-black tracking-tighter text-navy uppercase italic leading-none">O&A ELITE</h1>
            <p className="text-[7px] font-black text-primary uppercase tracking-[0.3em] mt-0.5 animate-pulse-soft">EST. 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-full border border-slate-100 animate-slide-up stagger-1">
          <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          <span className="text-[8px] font-black text-navy uppercase tracking-widest">ARENA LIVE</span>
        </div>
      </header>

      <main className="px-5 mt-6 space-y-8">
        {/* MATCH HERO CARD */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-elite overflow-hidden animate-scale-up hover:shadow-heavy transition-all duration-500">
          <div className="h-1 bg-primary w-full animate-pulse-soft"></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-0.5">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest animate-slide-up stagger-1 block">PRÓXIMO CONFRONTO</span>
                <h2 className="text-2xl font-condensed tracking-tighter uppercase italic leading-none text-navy animate-slide-up stagger-2">{match?.location || "ARENA ELITE"}</h2>
              </div>
              <button 
                onClick={handleShareMatch}
                className="w-10 h-10 bg-slate-50 text-navy rounded-lg flex items-center justify-center active:scale-90 hover:bg-slate-100 transition-all border border-slate-100 animate-slide-up stagger-2"
              >
                <span className="material-symbols-outlined text-xl">share</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
               <div className="space-y-2 group">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black text-navy uppercase italic tracking-wider transition-colors group-hover:text-primary">LINHA</span>
                    <span className="text-[10px] font-black text-primary font-condensed">{confirmedField.length}/{fieldSlots}</span>
                  </div>
                  <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                    <div className="h-full bg-primary transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(237,29,35,0.4)]" style={{ width: `${lineProgress}%` }}></div>
                  </div>
               </div>
               
               <div className="space-y-2 group">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black text-navy uppercase italic tracking-wider transition-colors group-hover:text-navy">GOLEIROS</span>
                    <span className="text-[10px] font-black text-navy font-condensed">{confirmedGKs.length}/{gkSlots}</span>
                  </div>
                  <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                    <div className="h-full bg-navy transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(0,56,118,0.4)]" style={{ width: `${gkProgress}%` }}></div>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-8 mb-8 py-4 border-y border-slate-50/80">
               <div className="animate-slide-up stagger-3">
                 <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-0.5">DATA</p>
                 <p className="text-[10px] font-black text-navy uppercase italic">{match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '---'}</p>
               </div>
               <div className="w-px h-5 bg-slate-100"></div>
               <div className="animate-slide-up stagger-4">
                 <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-0.5">HORA</p>
                 <p className="text-[10px] font-black text-navy uppercase italic">{match?.time || '--:--'}H</p>
               </div>
            </div>

            <button 
              onClick={togglePresence}
              disabled={isUpdating}
              className={`w-full h-14 rounded-xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest transition-all duration-300 active:scale-95 hover:brightness-110 animate-slide-up stagger-5 ${isConfirmed ? 'bg-navy text-white shadow-xl shadow-navy/20' : 'bg-primary text-white shadow-xl shadow-primary/20'}`}
            >
              {isUpdating ? <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                <>
                  <span className={`material-symbols-outlined text-xl transition-transform ${isConfirmed ? 'rotate-0' : 'group-hover:rotate-12'}`}>{isConfirmed ? 'verified' : 'stadium'}</span>
                  {isConfirmed ? 'PRESENÇA CONFIRMADA' : 'CONFIRMAR PRESENÇA'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* ARTILHARIA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-navy italic animate-slide-up">ARTILHARIA</h3>
            <button onClick={() => onPageChange(Page.PlayerList)} className="text-[8px] font-black text-primary uppercase tracking-widest border-b border-primary/20 hover:border-primary transition-all">VER RANKING</button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {topScorers.length > 0 ? topScorers.map((p, i) => (
              <StatCard key={p.id} player={p} value={p.goals} label="Gols" delay={i * 100} color="primary" />
            )) : <div className="bg-slate-50/50 rounded-2xl p-6 text-center animate-pulse-soft border border-dashed border-slate-200">
                   <p className="text-[9px] text-slate-300 uppercase font-black tracking-widest">Nenhum gol registrado</p>
                 </div>}
          </div>
        </div>

        {/* GARÇONS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-navy italic animate-slide-up">GARÇONS (ASSIST.)</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {topAssists.length > 0 ? topAssists.map((p, i) => (
              <StatCard key={p.id} player={p} value={p.assists} label="Assists" delay={i * 100} color="navy" />
            )) : <div className="bg-slate-50/50 rounded-2xl p-6 text-center animate-pulse-soft border border-dashed border-slate-200">
                   <p className="text-[9px] text-slate-300 uppercase font-black tracking-widest">Nenhuma assistência</p>
                 </div>}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ player, value, label, delay, color }: any) => (
  <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-elite flex items-center justify-between group hover:border-primary/30 hover:translate-x-1 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-50 bg-slate-50 group-hover:scale-105 transition-transform">
        <img src={player.photoUrl} className="w-full h-full object-cover" alt="" />
      </div>
      <div>
        <h4 className="text-[11px] font-black text-navy uppercase italic leading-none mb-0.5 group-hover:text-primary transition-colors">{player.name}</h4>
        <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">{player.position}</span>
      </div>
    </div>
    <div className="flex items-center gap-2 pr-2">
       <span className={`text-xl font-black italic font-condensed transition-transform group-hover:scale-125 ${color === 'primary' ? 'text-primary' : 'text-navy'}`}>{value}</span>
       <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
    </div>
  </div>
);

export default Dashboard;
