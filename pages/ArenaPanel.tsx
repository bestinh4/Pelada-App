
import React, { useState, useEffect } from 'react';
import { Player, MatchSession, Page } from '../types.ts';
import { db, doc, onSnapshot, updateDoc, setDoc } from '../services/firebase.ts';
import { initNewSession, closeSession } from '../engine/sessionEngine.ts';
import { processMatchResult } from '../engine/matchEngine.ts';

interface ArenaPanelProps {
  players: Player[];
  onPageChange: (page: Page) => void;
}

const MATCH_DURATION = 600; // 10 minutos em segundos

const ArenaPanel: React.FC<ArenaPanelProps> = ({ players }) => {
  const [session, setSession] = useState<MatchSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Sync com Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "sessions", "current"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as MatchSession;
        setSession(data);
      }
    });
    return () => unsub();
  }, []);

  // Lógica do Cronômetro
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleStartSession = async () => {
    const confirmed = players.filter(p => p.status === 'presente');
    if (confirmed.length < 7) {
      alert("Mínimo de 7 jogadores confirmados para iniciar.");
      return;
    }
    const newSession = initNewSession(confirmed);
    await setDoc(doc(db, "sessions", "current"), newSession);
    setTimeLeft(MATCH_DURATION);
  };

  const handleEndSession = async () => {
    if (!confirm("Encerrar sessão da noite?")) return;
    await updateDoc(doc(db, "sessions", "current"), closeSession());
    setSession(null);
  };

  const updateScore = async (side: 'A' | 'B', delta: number) => {
    if (!session) return;
    const key = side === 'A' ? 'scoreA' : 'scoreB';
    const currentScore = session.activeMatch[key];
    const newScore = Math.max(0, currentScore + delta);
    
    await updateDoc(doc(db, "sessions", "current"), {
      [`activeMatch.${key}`]: newScore
    });
  };

  const finishMatch = async (winnerSide: 'A' | 'B' | 'draw') => {
    if (!session) return;
    
    let winnerId = null;
    let loserId = null;

    if (winnerSide === 'A') {
      winnerId = session.activeMatch.teamAId;
      loserId = session.activeMatch.teamBId;
    } else if (winnerSide === 'B') {
      winnerId = session.activeMatch.teamBId;
      loserId = session.activeMatch.teamAId;
    } else {
      // Empate: ADM Decide quem fica. Por padrão aqui, o "dono da casa" (Time A) fica.
      winnerId = session.activeMatch.teamAId;
      loserId = session.activeMatch.teamBId;
    }

    const updates = processMatchResult(session, winnerId, loserId);
    await updateDoc(doc(db, "sessions", "current"), updates);
    
    setTimeLeft(MATCH_DURATION);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session || session.status === 'inactive') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 animate-fade-in">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-slate-300">stadium</span>
        </div>
        <h2 className="text-xl font-black text-navy uppercase italic mb-2">MODO ARENA DIGITAL</h2>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center mb-8 max-w-[240px]">
          Organize times, controle o cronômetro e registre a artilharia em tempo real.
        </p>
        <button 
          onClick={handleStartSession}
          className="h-16 px-10 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          INICIAR PELADA AGORA
        </button>
      </div>
    );
  }

  const teamA = session.teams.find(t => t.id === session.activeMatch.teamAId);
  const teamB = session.teams.find(t => t.id === session.activeMatch.teamBId);

  return (
    <div className="flex flex-col animate-fade-in p-6 space-y-8 pb-32">
      <header className="flex justify-between items-start">
        <div>
           <h2 className="text-2xl font-black text-navy italic uppercase leading-none">PAINEL DIGITAL</h2>
           <p className="text-[8px] font-black text-primary uppercase tracking-widest mt-1 animate-pulse">SESSÃO ATIVA</p>
        </div>
        <button onClick={handleEndSession} className="text-[9px] font-black text-slate-300 uppercase underline decoration-primary decoration-2 underline-offset-4">FECHAR NOITE</button>
      </header>

      {/* CRONÔMETRO GIGANTE */}
      <div className="bg-navy rounded-[2.5rem] p-8 flex flex-col items-center shadow-heavy border-b-8 border-primary relative overflow-hidden">
         <div className="absolute top-4 right-8 flex items-center gap-1.5 opacity-30">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
            <span className="text-[7px] font-black text-white uppercase tracking-widest">LIVE</span>
         </div>
         <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">TEMPO RESTANTE</span>
         <div className={`text-8xl font-condensed italic text-white leading-none mb-8 transition-colors ${timeLeft < 60 ? 'text-primary animate-pulse' : ''}`}>
           {formatTime(timeLeft)}
         </div>
         <div className="flex gap-4">
            <button 
              onClick={() => setIsTimerRunning(!isTimerRunning)} 
              className={`w-16 h-16 rounded-2xl flex items-center justify-center active:scale-90 transition-all ${isTimerRunning ? 'bg-white/10 text-white' : 'bg-primary text-white shadow-lg shadow-primary/40'}`}
            >
               <span className="material-symbols-outlined text-3xl font-bold">{isTimerRunning ? 'pause' : 'play_arrow'}</span>
            </button>
            <button 
              onClick={() => { setTimeLeft(MATCH_DURATION); setIsTimerRunning(false); }} 
              className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center active:scale-90 transition-all"
            >
               <span className="material-symbols-outlined text-3xl">replay</span>
            </button>
         </div>
      </div>

      {/* PLACAR INTERATIVO */}
      <div className="grid grid-cols-2 gap-4">
         <ScoreCard 
            side="A" 
            team={teamA} 
            score={session.activeMatch.scoreA} 
            onScore={(d) => updateScore('A', d)} 
            onWin={() => finishMatch('A')}
            isLeading={session.activeMatch.scoreA > session.activeMatch.scoreB}
         />
         <ScoreCard 
            side="B" 
            team={teamB} 
            score={session.activeMatch.scoreB} 
            onScore={(d) => updateScore('B', d)} 
            onWin={() => finishMatch('B')}
            isLeading={session.activeMatch.scoreB > session.activeMatch.scoreA}
         />
      </div>

      {/* FILA DE ESPERA DE TIMES */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black text-navy uppercase italic flex items-center gap-2">
               <span className="material-symbols-outlined text-base">reorder</span>
               FILA DE TIMES
            </h3>
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{session.queue.length} TIMES AGUARDANDO</span>
         </div>
         
         <div className="space-y-3">
            {session.queue.length > 0 ? session.queue.map((id, i) => {
              const t = session.teams.find(x => x.id === id);
              return (
                <div key={id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all">
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center font-black italic text-xs">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-xs font-black text-navy uppercase italic leading-none mb-1">{t?.name}</p>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{t?.playerIds.length} Atletas</p>
                      </div>
                   </div>
                   <div className="flex gap-1.5">
                      {!t?.isComplete && <span className="bg-primary/10 text-primary text-[6px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">INCOMPLETO</span>}
                      {!t?.hasGK && <span className="bg-amber-400/10 text-amber-500 text-[6px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">SEM GK</span>}
                   </div>
                </div>
              );
            }) : (
              <div className="py-10 text-center bg-slate-50/30 rounded-[2rem] border border-dashed border-slate-100">
                <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest">Nenhum time na espera</p>
              </div>
            )}
         </div>
      </div>

      {/* ALERTAS DE SISTEMA */}
      {( (!teamA?.isComplete || !teamB?.isComplete) || (!teamA?.hasGK || !teamB?.hasGK) ) && (
        <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 space-y-3 animate-pulse">
           <div className="flex items-center gap-2 text-amber-600">
              <span className="material-symbols-outlined text-lg">warning</span>
              <span className="text-[9px] font-black uppercase tracking-widest">ALERTAS DA ARENA</span>
           </div>
           <div className="space-y-1">
              {!teamA?.isComplete && <p className="text-[8px] font-black text-amber-700 uppercase leading-relaxed">• TIME A ESTÁ INCOMPLETO. ADM DEVE COMPLETAR MANUALMENTE.</p>}
              {!teamB?.isComplete && <p className="text-[8px] font-black text-amber-700 uppercase leading-relaxed">• TIME B ESTÁ INCOMPLETO. ADM DEVE COMPLETAR MANUALMENTE.</p>}
              {!teamA?.hasGK && <p className="text-[8px] font-black text-amber-700 uppercase leading-relaxed">• TIME A SEM GOLEIRO OFICIAL. JOGANDO COM 6 LINHA.</p>}
              {!teamB?.hasGK && <p className="text-[8px] font-black text-amber-700 uppercase leading-relaxed">• TIME B SEM GOLEIRO OFICIAL. JOGANDO COM 6 LINHA.</p>}
           </div>
        </div>
      )}
    </div>
  );
};

const ScoreCard = ({ side, team, score, onScore, onWin, isLeading }: any) => (
  <div className={`bg-white rounded-[2.5rem] p-6 border-2 transition-all duration-500 ${isLeading ? 'border-primary shadow-heavy scale-[1.02]' : 'border-slate-100 shadow-sm'}`}>
     <div className="text-center mb-6">
        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 block">TIME {side}</span>
        <h4 className="text-[13px] font-black text-navy uppercase italic truncate mb-2">{team?.name || '---'}</h4>
        {team?.consecutiveWins > 0 && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-success/10 text-success rounded-full">
            <span className="material-symbols-outlined text-[10px] fill-1">workspace_premium</span>
            <span className="text-[7px] font-black uppercase tracking-tighter">{team.consecutiveWins} VITÓRIAS</span>
          </div>
        )}
     </div>

     <div className="flex flex-col items-center gap-4 mb-6">
        <div className="flex items-center gap-6">
           <button onClick={() => onScore(-1)} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-navy font-bold active:scale-75 transition-transform">-</button>
           <span className="text-6xl font-condensed italic font-black text-navy">{score}</span>
           <button onClick={() => onScore(1)} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-navy font-bold active:scale-75 transition-transform">+</button>
        </div>
     </div>

     <button 
      onClick={onWin}
      className={`w-full h-12 rounded-xl font-black uppercase text-[8px] tracking-widest transition-all ${isLeading ? 'bg-navy text-white shadow-lg shadow-navy/20' : 'bg-slate-50 text-slate-300'}`}
     >
       DEFINIR VENCEDOR
     </button>
  </div>
);

export default ArenaPanel;
