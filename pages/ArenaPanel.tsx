
import React, { useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';
import { MatchSession, Team } from '../domain/types.ts';
import { db, doc, onSnapshot, updateDoc, setDoc, deleteDoc } from '../services/firebase.ts';
import { initializeSession } from '../domain/sessionEngine.ts';
import { registerGoal, finishMatch } from '../domain/matchEngine.ts';

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
      // No empate o ADM decide manualmente quem fica. 
      // Por padrão mantemos o vencedor anterior (Time A) ou pedimos escolha.
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-10 animate-fade-in text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mb-8">
           <span className="material-symbols-outlined text-5xl text-slate-300">stadium</span>
        </div>
        <h2 className="text-2xl font-black text-navy uppercase italic mb-4">ARENA DIGITAL ADM</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed mb-10 max-w-xs">
          Assuma o controle total da noite. Gere os times fixos e gerencie o placar em tempo real.
        </p>
        <button 
          onClick={handleStartNight}
          className="h-16 px-12 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all"
        >
          INICIAR SESSÃO DA NOITE
        </button>
      </div>
    );
  }

  const teamA = session.teams.find(t => t.id === session.activeMatch?.teamAId);
  const teamB = session.teams.find(t => t.id === session.activeMatch?.teamBId);

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-32">
      <header className="flex justify-between items-center">
        <div className="flex flex-col">
          <h2 className="text-xl font-black text-navy uppercase italic leading-none">PAINEL DIGITAL</h2>
          <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mt-1">OPERACIONAL ELITE</span>
        </div>
        <button 
          onClick={() => confirm("Fechar arena?") && deleteDoc(doc(db, "sessions", "current"))}
          className="text-[9px] font-black text-slate-300 uppercase underline decoration-primary decoration-2 underline-offset-4"
        >
          ENCERRAR NOITE
        </button>
      </header>

      {/* CRONÔMETRO CENTRAL */}
      <div className="bg-navy rounded-[3rem] p-10 flex flex-col items-center shadow-heavy relative overflow-hidden">
        <div className="absolute top-6 flex items-center gap-2 opacity-30">
           <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
           <span className="text-[8px] font-black text-white uppercase tracking-widest">CRONÔMETRO OFICIAL</span>
        </div>
        
        <div className={`text-9xl font-condensed italic text-white leading-none my-6 transition-all duration-500 ${timeLeft < 60 ? 'text-primary scale-110 animate-pulse' : ''}`}>
          {formatTime(timeLeft)}
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setTimerActive(!timerActive)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${timerActive ? 'bg-white/10 text-white' : 'bg-primary text-white shadow-xl shadow-primary/30'}`}
          >
            <span className="material-symbols-outlined text-3xl">{timerActive ? 'pause' : 'play_arrow'}</span>
          </button>
          <button 
            onClick={() => { setTimeLeft(MATCH_LIMIT_MINUTES * 60); setTimerActive(false); }}
            className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-3xl">replay</span>
          </button>
        </div>
      </div>

      {/* PLACAR */}
      <div className="grid grid-cols-2 gap-4">
        <TeamControl 
          side="A" 
          team={teamA} 
          score={session.activeMatch?.scoreA || 0} 
          onGoal={() => handleGoal('A')} 
          onFinish={() => handleFinishMatch('A')}
          isLeading={(session.activeMatch?.scoreA || 0) > (session.activeMatch?.scoreB || 0)}
        />
        <TeamControl 
          side="B" 
          team={teamB} 
          score={session.activeMatch?.scoreB || 0} 
          onGoal={() => handleGoal('B')} 
          onFinish={() => handleFinishMatch('B')}
          isLeading={(session.activeMatch?.scoreB || 0) > (session.activeMatch?.scoreA || 0)}
        />
      </div>

      {session.activeMatch?.scoreA === session.activeMatch?.scoreB && (session.activeMatch?.scoreA || 0) > 0 && (
         <button 
           onClick={() => handleFinishMatch('draw')}
           className="w-full h-12 bg-slate-100 text-navy rounded-xl font-black uppercase text-[9px] tracking-widest border border-slate-200"
         >
           FINALIZAR COMO EMPATE
         </button>
      )}

      {/* FILA DE TIMES */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black text-navy uppercase italic flex items-center gap-2">
            <span className="material-symbols-outlined text-base">reorder</span>
            FILA DE DESAFIANTES
          </h3>
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{session.waitingQueue.length} TIMES</span>
        </div>

        <div className="space-y-3">
          {session.waitingQueue.length > 0 ? session.waitingQueue.map((tid, i) => {
            const t = session.teams.find(x => x.id === tid);
            return (
              <div key={tid} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center font-black italic text-xs">{i+1}</div>
                  <div>
                    <p className="text-xs font-black text-navy uppercase italic leading-none mb-1">{t?.name}</p>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{t?.playerIds.length} Atletas</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                   {!t?.isComplete && <span className="bg-amber-400/10 text-amber-500 text-[6px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">INCOMPLETO</span>}
                   {!t?.hasGoalkeeper && <span className="bg-primary/10 text-primary text-[6px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">SEM GK</span>}
                </div>
              </div>
            );
          }) : (
            <div className="py-8 text-center bg-slate-50/30 rounded-[2rem] border border-dashed border-slate-100">
               <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest">Aguardando novos times</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TeamControl = ({ side, team, score, onGoal, onFinish, isLeading }: any) => (
  <div className={`bg-white rounded-[2.5rem] p-6 border-2 transition-all duration-500 ${isLeading ? 'border-primary shadow-heavy scale-[1.02]' : 'border-slate-100 shadow-sm'}`}>
    <div className="text-center mb-4">
      <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1 block">TIME {side}</span>
      <h4 className="text-[12px] font-black text-navy uppercase italic truncate mb-2">{team?.name || 'Vazio'}</h4>
      
      <div className="flex justify-center gap-1">
        {!team?.isComplete && <span className="material-symbols-outlined text-amber-400 text-base" title="Time Incompleto">warning</span>}
        {!team?.hasGoalkeeper && <span className="material-symbols-outlined text-primary text-base" title="Sem Goleiro">block</span>}
      </div>
    </div>

    <div className="flex flex-col items-center gap-4 mb-6">
       <div className="text-6xl font-condensed italic font-black text-navy leading-none">{score}</div>
       <button 
        onClick={onGoal}
        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-navy font-black text-xs active:scale-90 transition-all"
       >
         GOL!
       </button>
    </div>

    <button 
      onClick={onFinish}
      className={`w-full h-10 rounded-lg font-black uppercase text-[7px] tracking-widest transition-all ${isLeading ? 'bg-navy text-white' : 'bg-slate-100 text-slate-300'}`}
    >
      VENCEU A PARTIDA
    </button>
  </div>
);

export default ArenaPanel;
