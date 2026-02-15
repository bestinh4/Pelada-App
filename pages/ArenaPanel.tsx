
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
        <GlassCard className="max-w-xs w-full text-center flex flex-col items-center gap-6 border-white/80">
          <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center border border-primary/10">
             <span className="material-symbols-outlined text-5xl text-primary font-light">stadium</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 uppercase italic tracking-tighter">ARENA ELITE</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">CHAMPIONS OPERATION</p>
          </div>
          <GlassButton variant="primary" size="xl" onClick={handleStartNight} className="w-full">
            ABRIR CONVOCAÇÃO
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  const teamA = session.teams.find(t => t.id === session.activeMatch?.teamAId);
  const teamB = session.teams.find(t => t.id === session.activeMatch?.teamBId);

  return (
    <div className="p-6 space-y-10 animate-fade-in pb-48">
      {/* HEADER EDITORIAL */}
      <header className="flex justify-between items-end px-2">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">CENTRAL AO VIVO</h2>
          <div className="flex items-center gap-2">
             <div className="flex gap-1">
                <span className="w-3 h-1 bg-primary rounded-full"></span>
                <span className="w-1 h-1 bg-navy rounded-full opacity-30"></span>
             </div>
             <span className="text-[9px] font-extrabold text-primary uppercase tracking-[0.4em] animate-pulse">MATCHDAY</span>
          </div>
        </div>
        <button 
          onClick={() => confirm("Encerrar Matchday?") && deleteDoc(doc(db, "sessions", "current"))}
          className="text-[10px] font-bold text-slate-400 uppercase hover:text-primary transition-all border-b border-slate-200"
        >
          ENCERRAR
        </button>
      </header>

      {/* PLACAR HERO CHAMPIONS */}
      <GlassCard className="relative overflow-hidden pt-12 pb-10 px-4 border-white/90">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100/50 flex">
           <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${(timeLeft / (MATCH_LIMIT_MINUTES * 60)) * 100}%` }}></div>
        </div>

        <div className="grid grid-cols-3 items-center mb-10">
           <div className="text-center space-y-3">
             <div className="flex justify-center">
                {teamA?.hasGoalkeeper ? <span className="material-symbols-outlined text-navy/40 text-xl">guardian</span> : <span className="material-symbols-outlined text-primary/30 text-xl">warning</span>}
             </div>
             <p className="text-[11px] font-extrabold text-slate-900 uppercase italic truncate px-2">{teamA?.name || '---'}</p>
             {teamA?.consecutiveWins > 0 && (
                <span className="bg-success/10 text-success text-[7px] font-black px-2 py-0.5 rounded-full uppercase">{teamA.consecutiveWins}W STREAK</span>
             )}
           </div>

           <div className="flex flex-col items-center">
              <div className="flex items-center gap-3">
                 <span className="text-7xl font-condensed italic font-black text-primary leading-none transition-all duration-300">{session.activeMatch?.scoreA}</span>
                 <span className="text-2xl font-light text-slate-200 mx-1">:</span>
                 <span className="text-7xl font-condensed italic font-black text-primary leading-none transition-all duration-300">{session.activeMatch?.scoreB}</span>
              </div>
           </div>

           <div className="text-center space-y-3">
             <div className="flex justify-center">
                {teamB?.hasGoalkeeper ? <span className="material-symbols-outlined text-navy/40 text-xl">guardian</span> : <span className="material-symbols-outlined text-primary/30 text-xl">warning</span>}
             </div>
             <p className="text-[11px] font-extrabold text-slate-900 uppercase italic truncate px-2">{teamB?.name || '---'}</p>
             {teamB?.consecutiveWins > 0 && (
                <span className="bg-success/10 text-success text-[7px] font-black px-2 py-0.5 rounded-full uppercase">{teamB.consecutiveWins}W STREAK</span>
             )}
           </div>
        </div>

        {/* CRONÔMETRO DIGITAL MINIMALISTA */}
        <div className="flex flex-col items-center gap-4 border-t border-slate-50 pt-8">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => setTimerActive(!timerActive)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${timerActive ? 'bg-slate-100 text-navy' : 'btn-champions-blue'}`}
              >
                <span className="material-symbols-outlined text-3xl">{timerActive ? 'pause' : 'play_arrow'}</span>
              </button>
              
              <div className="flex flex-col items-center min-w-[100px]">
                 <span className={`text-4xl font-condensed italic tracking-widest ${timeLeft < 60 ? 'text-primary animate-pulse' : 'text-navy'}`}>
                    {formatTime(timeLeft)}
                 </span>
                 <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.3em] mt-1">OFFICIAL TIME</span>
              </div>

              <button 
                onClick={() => { setTimeLeft(MATCH_LIMIT_MINUTES * 60); setTimerActive(false); }}
                className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-2xl">replay</span>
              </button>
           </div>
        </div>
      </GlassCard>

      {/* CONTROLES TÁTEIS */}
      <div className="grid grid-cols-2 gap-5">
         <div className="space-y-4">
            <GlassButton variant="primary" size="lg" className="w-full h-16 !rounded-3xl" onClick={() => handleGoal('A')}>
              GOL A
            </GlassButton>
            <GlassButton variant="outline" className="w-full h-12 !rounded-xl !text-[8px] !border-slate-200" onClick={() => handleFinishMatch('A')}>
              VITÓRIA TIME A
            </GlassButton>
         </div>
         <div className="space-y-4">
            <GlassButton variant="secondary" size="lg" className="w-full h-16 !rounded-3xl" onClick={() => handleGoal('B')}>
              GOL B
            </GlassButton>
            <GlassButton variant="outline" className="w-full h-12 !rounded-xl !text-[8px] !border-slate-200" onClick={() => handleFinishMatch('B')}>
              VITÓRIA TIME B
            </GlassButton>
         </div>
      </div>

      {session.activeMatch?.scoreA === session.activeMatch?.scoreB && (session.activeMatch?.scoreA || 0) > 0 && (
         <GlassButton variant="glass" className="w-full h-14 border-slate-200 rounded-2xl" onClick={() => handleFinishMatch('draw')}>
           RESOLVER EMPATE NO CRITÉRIO
         </GlassButton>
      )}

      {/* FILA DE COMPETIÇÃO SCROLL HORIZONTAL */}
      <section className="space-y-5">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-black text-navy uppercase italic flex items-center gap-2">
            <span className="w-4 h-0.5 bg-primary"></span>
            PRÓXIMOS CONFRONTOS
          </h3>
          <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">{session.waitingQueue.length} EM ESPERA</span>
        </div>

        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-6 px-2 -mx-2">
          {session.waitingQueue.length > 0 ? session.waitingQueue.map((tid, i) => {
            const t = session.teams.find(x => x.id === tid);
            const isNext = i === 0;
            return (
              <GlassCard 
                key={tid} 
                className={`min-w-[160px] p-5 flex flex-col items-center justify-center gap-4 transition-all border-2 ${isNext ? 'border-navy/20 bg-white scale-105 shadow-premium' : 'border-white/40 opacity-70'}`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                   <span className="text-[10px] font-black italic text-navy">{i+1}º</span>
                </div>
                <div className="text-center">
                   <p className="text-[11px] font-black text-navy uppercase italic leading-none truncate w-32">{t?.name}</p>
                   <p className="text-[7px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{t?.playerIds.length} ATLETAS</p>
                </div>
                <div className="flex gap-1">
                   {!t?.isComplete && <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>}
                   {!t?.hasGoalkeeper && <div className="w-1.5 h-1.5 bg-navy rounded-full opacity-40"></div>}
                </div>
                {isNext && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-navy text-white text-[6px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">PRÓXIMO</span>}
              </GlassCard>
            );
          }) : (
            <div className="w-full py-12 text-center glass-panel border-dashed border-slate-200 rounded-[2.5rem]">
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Lista de espera vazia</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ArenaPanel;
