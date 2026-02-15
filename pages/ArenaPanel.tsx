
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
      const choice = confirm("Time A permanece no empate? (OK para Sim, Cancelar para Time B)") ? 'A' : 'B';
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
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-10 animate-fade-in text-center">
        <GlassCard className="max-w-xs flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8">
             <span className="material-symbols-outlined text-4xl text-primary">stadium</span>
          </div>
          <h2 className="text-xl font-black text-navy uppercase italic mb-4">ARENA DIGITAL</h2>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed mb-10">
            Painel operacional para gestão em tempo real das partidas.
          </p>
          <GlassButton variant="primary" size="xl" onClick={handleStartNight} className="w-full">
            ABRIR TEMPORADA
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  const teamA = session.teams.find(t => t.id === session.activeMatch?.teamAId);
  const teamB = session.teams.find(t => t.id === session.activeMatch?.teamBId);

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-40">
      <header className="flex justify-between items-center glass p-5 rounded-[2rem]">
        <div className="flex flex-col">
          <h2 className="text-sm font-black text-navy uppercase italic leading-none">ARENA ADM</h2>
          <div className="flex items-center gap-1.5 mt-1.5">
             <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-glow"></span>
             <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em]">AO VIVO</span>
          </div>
        </div>
        <button 
          onClick={() => confirm("Fechar arena?") && deleteDoc(doc(db, "sessions", "current"))}
          className="text-[9px] font-bold text-slate-400 uppercase hover:text-primary transition-colors"
        >
          ENCERRAR SESSÃO
        </button>
      </header>

      {/* CRONÔMETRO CIRCULAR ESTILIZADO */}
      <GlassCard variant="blue" className="relative flex flex-col items-center py-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${(timeLeft / (MATCH_LIMIT_MINUTES * 60)) * 100}%` }}></div>
        </div>
        
        <div className="relative">
          <svg className="w-48 h-48 -rotate-90">
            <circle cx="96" cy="96" r="88" className="stroke-white/5 fill-none" strokeWidth="6" />
            <circle 
              cx="96" cy="96" r="88" 
              className={`fill-none transition-all duration-1000 ${timeLeft < 60 ? 'stroke-primary' : 'stroke-white/40'}`} 
              strokeWidth="6" 
              strokeDasharray="552.92" 
              strokeDashoffset={552.92 - (552.92 * timeLeft) / (MATCH_LIMIT_MINUTES * 60)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-50 mb-1">MINUTOS</span>
             <div className={`text-6xl font-condensed italic leading-none ${timeLeft < 60 ? 'text-primary animate-pulse' : 'text-white'}`}>
               {formatTime(timeLeft)}
             </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <GlassButton variant="glass" className="w-12 h-12 !rounded-full text-white" onClick={() => setTimerActive(!timerActive)}>
            <span className="material-symbols-outlined text-2xl">{timerActive ? 'pause' : 'play_arrow'}</span>
          </GlassButton>
          <GlassButton variant="glass" className="w-12 h-12 !rounded-full text-white" onClick={() => { setTimeLeft(MATCH_LIMIT_MINUTES * 60); setTimerActive(false); }}>
            <span className="material-symbols-outlined text-2xl">replay</span>
          </GlassButton>
        </div>
      </GlassCard>

      {/* PLACAR GLASS */}
      <div className="grid grid-cols-2 gap-4">
        <TeamScoreControl 
          side="A" 
          team={teamA} 
          score={session.activeMatch?.scoreA || 0} 
          onGoal={() => handleGoal('A')} 
          onFinish={() => handleFinishMatch('A')}
          isLeading={(session.activeMatch?.scoreA || 0) > (session.activeMatch?.scoreB || 0)}
        />
        <TeamScoreControl 
          side="B" 
          team={teamB} 
          score={session.activeMatch?.scoreB || 0} 
          onGoal={() => handleGoal('B')} 
          onFinish={() => handleFinishMatch('B')}
          isLeading={(session.activeMatch?.scoreB || 0) > (session.activeMatch?.scoreA || 0)}
        />
      </div>

      {session.activeMatch?.scoreA === session.activeMatch?.scoreB && (session.activeMatch?.scoreA || 0) > 0 && (
         <GlassButton variant="glass" className="w-full h-14 border-slate-200" onClick={() => handleFinishMatch('draw')}>
           RESOLVER EMPATE
         </GlassButton>
      )}

      {/* FILA DE DESAFIANTES */}
      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black text-navy uppercase italic flex items-center gap-2">
            <span className="material-symbols-outlined text-base">reorder</span>
            FILA DE DESAFIANTES
          </h3>
          <span className="bg-navy/5 px-2 py-1 rounded-lg text-[8px] font-black text-navy uppercase tracking-widest">{session.waitingQueue.length} TIMES</span>
        </div>

        <div className="space-y-3">
          {session.waitingQueue.length > 0 ? session.waitingQueue.map((tid, i) => {
            const t = session.teams.find(x => x.id === tid);
            return (
              <div key={tid} className="p-4 bg-white/40 border border-white/60 rounded-2xl flex items-center justify-between animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center font-black italic text-xs border border-navy/10">{i+1}</div>
                  <div>
                    <p className="text-[11px] font-black text-navy uppercase italic leading-none mb-1">{t?.name}</p>
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{t?.playerIds.length} ATLETAS</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                   {!t?.isComplete && <div className="w-2 h-2 bg-amber-400 rounded-full" title="Incompleto"></div>}
                   {!t?.hasGoalkeeper && <div className="w-2 h-2 bg-primary rounded-full" title="Sem Goleiro"></div>}
                </div>
              </div>
            );
          }) : (
            <div className="py-8 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Aguardando novos times</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

const TeamScoreControl = ({ side, team, score, onGoal, onFinish, isLeading }: any) => (
  <GlassCard className={`relative border-2 transition-all duration-500 overflow-hidden ${isLeading ? 'border-primary/40 ring-4 ring-primary/5' : 'border-white/40'}`}>
    {isLeading && <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>}
    
    <div className="text-center mb-4">
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">TIME {side}</span>
      <h4 className="text-[14px] font-black text-navy uppercase italic truncate mb-2">{team?.name || '---'}</h4>
      
      <div className="flex justify-center gap-2">
        {team?.consecutiveWins > 0 && (
          <span className="bg-success/10 text-success text-[7px] font-black px-2 py-0.5 rounded-md uppercase">{team.consecutiveWins} VITÓRIAS</span>
        )}
      </div>
    </div>

    <div className="flex flex-col items-center gap-6 mb-6">
       <div className={`text-7xl font-condensed italic font-black transition-all ${isLeading ? 'text-primary scale-110' : 'text-navy opacity-80'}`}>{score}</div>
       <GlassButton variant={isLeading ? 'primary' : 'secondary'} className="w-full !rounded-xl" onClick={onGoal}>
         GOL
       </GlassButton>
    </div>

    <GlassButton variant="outline" className={`w-full !h-10 !rounded-lg !text-[8px] ${isLeading ? 'opacity-100' : 'opacity-30'}`} onClick={onFinish}>
      VITÓRIA
    </GlassButton>
  </GlassCard>
);

export default ArenaPanel;
