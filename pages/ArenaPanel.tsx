
import React, { useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';
import { MatchSession, Team } from '../domain/types.ts';
import { db, doc, onSnapshot, updateDoc, setDoc, deleteDoc } from '../services/firebase.ts';
import { initializeSession } from '../domain/sessionEngine.ts';
import { registerGoal, finishMatch } from '../domain/matchEngine.ts';
import { GlassCard } from '../components/ui/GlassCard.tsx';
import { GlassButton } from '../components/ui/GlassButton.tsx';

interface ArenaPanelProps {
  players: Player[];
  onPageChange: (page: Page) => void;
}

const MATCH_LIMIT_MINUTES = 10;

const ArenaPanel: React.FC<ArenaPanelProps> = ({ players }) => {
  const [session, setSession] = useState<MatchSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(MATCH_LIMIT_MINUTES * 60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "sessions", "current"), (snap) => {
      if (snap.exists()) setSession(snap.data() as MatchSession);
      else setSession(null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleStartNight = async () => {
    const confirmed = players.filter(p => p.status === 'presente');
    if (confirmed.length < 7) return alert("Mínimo de 7 jogadores confirmados.");
    
    const newSession = initializeSession(confirmed as any);
    await setDoc(doc(db, "sessions", "current"), newSession);
    setTimeLeft(MATCH_LIMIT_MINUTES * 60);
  };

  const handleGoal = async (side: 'A' | 'B') => {
    if (!session) return;
    const updated = registerGoal(session, side);
    await updateDoc(doc(db, "sessions", "current"), updated as any);
  };

  const handleFinishMatch = async (winnerSide: 'A' | 'B' | 'draw') => {
    if (!session || !session.activeMatch) return;
    
    let winnerId = "";
    let loserId = null;

    if (winnerSide === 'A') {
      winnerId = session.activeMatch.teamAId!;
      loserId = session.activeMatch.teamBId;
    } else if (winnerSide === 'B') {
      winnerId = session.activeMatch.teamBId!;
      loserId = session.activeMatch.teamAId;
    } else {
      const choice = confirm("Vencedor no empate? (OK para Time A, Cancelar para Time B)") ? 'A' : 'B';
      winnerId = choice === 'A' ? session.activeMatch.teamAId! : session.activeMatch.teamBId!;
      loserId = choice === 'A' ? session.activeMatch.teamBId : session.activeMatch.teamAId;
    }

    const updated = finishMatch(session, winnerId, loserId);
    await updateDoc(doc(db, "sessions", "current"), updated as any);
    setTimeLeft(MATCH_LIMIT_MINUTES * 60);
    setTimerActive(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const secs = s % 60;
    return `${m}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] p-8 animate-fade-in">
        <GlassCard className="max-w-xs w-full text-center flex flex-col items-center gap-8 border-white/90">
          <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center border border-primary/10 animate-float">
             <span className="material-symbols-outlined text-6xl text-primary font-light">stadium</span>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-navy uppercase italic tracking-tighter leading-none">ARENA COMANDO</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] leading-relaxed">OPERAÇÃO DE MATCHDAY<br/>CHAMPIONS LEGACY</p>
          </div>
          <GlassButton variant="primary" size="xl" onClick={handleStartNight} className="w-full h-18 !rounded-[1.75rem]">
            INICIAR PARTIDAS
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  const teamA = session.teams.find(t => t.id === session.activeMatch?.teamAId);
  const teamB = session.teams.find(t => t.id === session.activeMatch?.teamBId);

  return (
    <div className="p-6 space-y-10 animate-fade-in pb-48">
      {/* LIVE HEADER */}
      <header className="flex justify-between items-end px-2">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-navy uppercase italic leading-none tracking-tighter">LIVE CONTROL</h2>
          <div className="flex items-center gap-2">
             <span className="w-3 h-1 bg-primary rounded-full animate-pulse shadow-glow-red"></span>
             <span className="text-[10px] font-extrabold text-primary uppercase tracking-[0.5em]">OPERANDO</span>
          </div>
        </div>
        <button 
          onClick={() => confirm("Fechar a arena?") && deleteDoc(doc(db, "sessions", "current"))}
          className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-1"
        >
          ENCERRAR
        </button>
      </header>

      {/* PLACAR HERO CHAMPIONS */}
      <GlassCard className="relative overflow-hidden pt-12 pb-10 px-6 border-white/95">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100/30 flex">
           <div className="h-full bg-primary transition-all duration-1000 ease-in-out" style={{ width: `${(timeLeft / (MATCH_LIMIT_MINUTES * 60)) * 100}%` }}></div>
        </div>

        <div className="grid grid-cols-3 items-center mb-12">
           <div className="text-center space-y-4">
             <div className="w-12 h-12 bg-navy/5 rounded-2xl mx-auto flex items-center justify-center border border-navy/10">
                <span className={`material-symbols-outlined text-2xl ${teamA?.hasGoalkeeper ? 'text-navy opacity-50' : 'text-primary'}`}>{teamA?.hasGoalkeeper ? 'guardian' : 'warning'}</span>
             </div>
             <p className="text-[12px] font-black text-navy uppercase italic truncate px-1">{teamA?.name || '---'}</p>
             {teamA?.consecutiveWins > 0 && (
                <span className="bg-success/10 text-success text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">{teamA.consecutiveWins} VITÓRIAS</span>
             )}
           </div>

           <div className="flex flex-col items-center">
              <div className="flex items-center gap-4">
                 <span className="text-8xl font-condensed italic font-black text-primary leading-none transition-all duration-300 drop-shadow-sm">{session.activeMatch?.scoreA}</span>
                 <span className="text-3xl font-light text-slate-200 mx-1">:</span>
                 <span className="text-8xl font-condensed italic font-black text-primary leading-none transition-all duration-300 drop-shadow-sm">{session.activeMatch?.scoreB}</span>
              </div>
           </div>

           <div className="text-center space-y-4">
             <div className="w-12 h-12 bg-navy/5 rounded-2xl mx-auto flex items-center justify-center border border-navy/10">
                <span className={`material-symbols-outlined text-2xl ${teamB?.hasGoalkeeper ? 'text-navy opacity-50' : 'text-primary'}`}>{teamB?.hasGoalkeeper ? 'guardian' : 'warning'}</span>
             </div>
             <p className="text-[12px] font-black text-navy uppercase italic truncate px-1">{teamB?.name || '---'}</p>
             {teamB?.consecutiveWins > 0 && (
                <span className="bg-success/10 text-success text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">{teamB.consecutiveWins} VITÓRIAS</span>
             )}
           </div>
        </div>

        {/* TIMER STATION */}
        <div className="flex flex-col items-center gap-6 border-t border-navy/5 pt-10">
           <div className="flex items-center gap-10">
              <button 
                onClick={() => setTimerActive(!timerActive)}
                className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all shadow-xl active:scale-95 ${timerActive ? 'bg-slate-100 text-navy' : 'btn-elite-secondary'}`}
              >
                <span className="material-symbols-outlined text-4xl">{timerActive ? 'pause' : 'play_arrow'}</span>
              </button>
              
              <div className="flex flex-col items-center min-w-[120px]">
                 <span className={`text-5xl font-condensed italic tracking-widest leading-none ${timeLeft < 60 ? 'text-primary animate-pulse' : 'text-navy'}`}>
                    {formatTime(timeLeft)}
                 </span>
                 <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] mt-2">TIMER ELITE</span>
              </div>

              <button 
                onClick={() => { setTimeLeft(MATCH_LIMIT_MINUTES * 60); setTimerActive(false); }}
                className="w-16 h-16 rounded-[1.5rem] bg-slate-50 text-slate-300 flex items-center justify-center border border-slate-100 active:rotate-180 transition-transform duration-500"
              >
                <span className="material-symbols-outlined text-3xl">replay</span>
              </button>
           </div>
        </div>
      </GlassCard>

      {/* COMMAND ACTIONS */}
      <div className="grid grid-cols-2 gap-6">
         <div className="space-y-5">
            <GlassButton variant="primary" size="xl" className="w-full h-18 !rounded-[2rem] shadow-glow-red" onClick={() => handleGoal('A')}>
              GOL A
            </GlassButton>
            <GlassButton variant="outline" className="w-full h-12 !rounded-[1.25rem] !text-[9px] !border-slate-200" onClick={() => handleFinishMatch('A')}>
              VITÓRIA TIME A
            </GlassButton>
         </div>
         <div className="space-y-5">
            <GlassButton variant="secondary" size="xl" className="w-full h-18 !rounded-[2rem]" onClick={() => handleGoal('B')}>
              GOL B
            </GlassButton>
            <GlassButton variant="outline" className="w-full h-12 !rounded-[1.25rem] !text-[9px] !border-slate-200" onClick={() => handleFinishMatch('B')}>
              VITÓRIA TIME B
            </GlassButton>
         </div>
      </div>

      {session.activeMatch?.scoreA === session.activeMatch?.scoreB && (session.activeMatch?.scoreA || 0) > 0 && (
         <GlassButton variant="glass" className="w-full h-16 border-navy/10 rounded-[1.5rem] shadow-elite" onClick={() => handleFinishMatch('draw')}>
           RESOLVER EMPATE EDITORIAL
         </GlassButton>
      )}

      {/* QUEUE SCROLL */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-black text-navy uppercase italic flex items-center gap-3">
            <div className="w-5 h-0.5 bg-primary"></div>
            PRÓXIMOS TIMES
          </h3>
          <span className="bg-navy/5 px-2 py-0.5 rounded text-[8px] font-black text-navy uppercase">{session.waitingQueue.length} FILA</span>
        </div>

        <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-8 px-2 -mx-2">
          {session.waitingQueue.length > 0 ? session.waitingQueue.map((tid, i) => {
            const t = session.teams.find(x => x.id === tid);
            const isNext = i === 0;
            return (
              <GlassCard 
                key={tid} 
                className={`min-w-[170px] p-6 flex flex-col items-center justify-center gap-5 transition-all relative ${isNext ? 'border-navy/20 bg-white scale-105 shadow-elite ring-1 ring-navy/5' : 'border-white/40 opacity-70'}`}
              >
                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center border border-white shadow-inner">
                   <span className="text-[11px] font-black italic text-navy">#{i+1}</span>
                </div>
                <div className="text-center">
                   <p className="text-[12px] font-black text-navy uppercase italic leading-none truncate w-32">{t?.name}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase mt-2 tracking-widest">{t?.playerIds.length} ATLETAS</p>
                </div>
                {isNext && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[7px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg animate-bounce">DESAFIANTE</span>}
              </GlassCard>
            );
          }) : (
            <div className="w-full py-12 text-center glass-surface border-dashed border-slate-200 rounded-[2.5rem]">
               <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">Fila vazia</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ArenaPanel;
