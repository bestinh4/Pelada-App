
import React, { useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';
import { MatchSession, Team } from '../domain/types.ts';
import { db, doc, onSnapshot, updateDoc, setDoc, deleteDoc } from '../services/firebase.ts';
import { registerGoal, finishMatch } from '../domain/matchEngine.ts';

interface ArenaPanelProps {
  players: Player[];
  onPageChange: (page: Page) => void;
}

const MATCH_LIMIT_MINUTES = 10;

const ArenaPanel: React.FC<ArenaPanelProps> = ({ players, onPageChange }) => {
  const [session, setSession] = useState<MatchSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(MATCH_LIMIT_MINUTES * 60);
  const [timerActive, setTimerActive] = useState(false);

  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

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
    } else if (timeLeft === 0) { setTimerActive(false); }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleGoal = async (side: 'A' | 'B') => {
    if (!session) return;
    const updated = registerGoal(session, side);
    await updateDoc(doc(db, "sessions", "current"), updated as any);
  };

  const handleFinishMatch = async (winnerSide: 'A' | 'B' | 'draw') => {
    if (!session || !session.activeMatch) return;
    let winnerId = "";
    let loserId = null;
    if (winnerSide === 'A') { winnerId = session.activeMatch.teamAId!; loserId = session.activeMatch.teamBId; }
    else if (winnerSide === 'B') { winnerId = session.activeMatch.teamBId!; loserId = session.activeMatch.teamAId; }
    else {
      const choice = confirm("Vencedor no empate? (OK para Time A, CANCELAR para Time B)") ? 'A' : 'B';
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
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 animate-fade-in">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 text-center flex flex-col items-center gap-10 shadow-elite max-w-sm w-full">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100 animate-float">
             <span className="material-symbols-outlined text-6xl text-navy font-light">stadium</span>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-navy uppercase italic tracking-tighter leading-none">ARENA COMANDO</h2>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] leading-relaxed">NENHUMA SESSÃO ATIVA</p>
          </div>
          <button 
            onClick={() => onPageChange(Page.TeamBalancing)} 
            className="w-full h-20 bg-primary text-white rounded-3xl font-black uppercase text-[12px] tracking-widest shadow-glow-red active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined">shuffle</span>
            SORTEAR E INICIAR
          </button>
        </div>
      </div>
    );
  }

  const teamA = session.teams.find(t => t.id === session.activeMatch?.teamAId);
  const teamB = session.teams.find(t => t.id === session.activeMatch?.teamBId);

  return (
    <div className="p-6 space-y-10 animate-fade-in pb-48">
      <header className="flex justify-between items-center px-2">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-navy uppercase italic tracking-tighter">LIVE CONTROL</h2>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-glow-red"></span>
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">ARENA ONLINE</span>
          </div>
        </div>
        <button onClick={() => confirm("Fechar a arena?") && deleteDoc(doc(db, "sessions", "current"))} className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b-2 border-slate-100 pb-1">FECHAR</button>
      </header>

      <div className="mesh-gradient-champions relative overflow-hidden rounded-[2.5rem] pt-12 pb-10 px-8 text-white shadow-elite">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.1] scale-[1.5] pointer-events-none rotate-[20deg]">
           <img src={mainLogoUrl} className="w-full h-full object-contain grayscale brightness-[200%]" alt="" />
        </div>

        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/10">
           <div className="h-full bg-white transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / (MATCH_LIMIT_MINUTES * 60)) * 100}%` }}></div>
        </div>

        <div className="grid grid-cols-3 items-center mb-12 relative z-10">
           <div className="text-center space-y-3">
             <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center border border-white/20">
                <span className="material-symbols-outlined text-2xl">shield</span>
             </div>
             <p className="text-[14px] font-black uppercase italic truncate">{teamA?.name || '---'}</p>
           </div>

           <div className="flex flex-col items-center">
              <div className="flex items-center gap-4">
                 <span className="text-8xl font-condensed italic font-black leading-none drop-shadow-2xl">{session.activeMatch?.scoreA}</span>
                 <span className="text-3xl opacity-30 mx-1">:</span>
                 <span className="text-8xl font-condensed italic font-black leading-none drop-shadow-2xl">{session.activeMatch?.scoreB}</span>
              </div>
           </div>

           <div className="text-center space-y-3">
             <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center border border-white/20">
                <span className="material-symbols-outlined text-2xl">shield</span>
             </div>
             <p className="text-[14px] font-black uppercase italic truncate">{teamB?.name || '---'}</p>
           </div>
        </div>

        <div className="flex flex-col items-center gap-6 border-t border-white/10 pt-10 relative z-10">
           <div className="flex items-center gap-10">
              <button onClick={() => setTimerActive(!timerActive)} className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-xl active:scale-90 ${timerActive ? 'bg-white text-navy' : 'bg-primary text-white shadow-glow-red'}`}>
                <span className="material-symbols-outlined text-4xl">{timerActive ? 'pause' : 'play_arrow'}</span>
              </button>
              <div className="flex flex-col items-center min-w-[120px]">
                 <span className="text-5xl font-condensed italic font-black tracking-widest leading-none">
                    {formatTime(timeLeft)}
                 </span>
                 <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.5em] mt-2">TIMER</span>
              </div>
              <button onClick={() => { setTimeLeft(MATCH_LIMIT_MINUTES * 60); setTimerActive(false); }} className="w-16 h-16 rounded-3xl bg-white/10 border border-white/20 text-white flex items-center justify-center active:rotate-180 transition-all duration-500">
                <span className="material-symbols-outlined text-3xl">replay</span>
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
         <div className="space-y-4">
            <button onClick={() => handleGoal('A')} className="w-full h-20 bg-primary text-white rounded-[2rem] font-black uppercase text-[12px] tracking-widest shadow-glow-red active:scale-95 transition-all">GOL A</button>
            <button onClick={() => handleFinishMatch('A')} className="w-full h-14 bg-white border border-slate-100 rounded-[1.5rem] font-black text-navy text-[10px] tracking-widest active:scale-95 transition-all">VITÓRIA A</button>
         </div>
         <div className="space-y-4">
            <button onClick={() => handleGoal('B')} className="w-full h-20 bg-navy text-white rounded-[2rem] font-black uppercase text-[12px] tracking-widest shadow-elite active:scale-95 transition-all">GOL B</button>
            <button onClick={() => handleFinishMatch('B')} className="w-full h-14 bg-white border border-slate-100 rounded-[1.5rem] font-black text-navy text-[10px] tracking-widest active:scale-95 transition-all">VITÓRIA B</button>
         </div>
      </div>

      {session.activeMatch?.scoreA === session.activeMatch?.scoreB && (session.activeMatch?.scoreA || 0) > 0 && (
         <button onClick={() => handleFinishMatch('draw')} className="w-full h-18 bg-white border border-slate-100 rounded-[2rem] font-black text-navy uppercase text-[11px] tracking-widest shadow-soft-white active:scale-95 transition-all">RESOLVER EMPATE</button>
      )}

      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[11px] font-black text-navy uppercase italic">NA FILA DE ESPERA</h3>
          <span className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-[9px] font-black text-navy uppercase">{session.waitingQueue.length} TIMES</span>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-8 px-2 -mx-2">
          {session.waitingQueue.length > 0 ? session.waitingQueue.map((tid, i) => {
            const t = session.teams.find(x => x.id === tid);
            return (
              <div key={tid} className={`min-w-[180px] p-8 rounded-[2.5rem] bg-white border flex flex-col items-center gap-5 transition-all shadow-soft-white ${i === 0 ? 'border-primary shadow-elite scale-105' : 'border-slate-100 opacity-60'}`}>
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center font-black italic text-navy border border-slate-100 text-lg">{i+1}</div>
                <p className="text-[14px] font-black text-navy uppercase italic truncate w-full text-center">{t?.name}</p>
                {i === 0 && <span className="text-[8px] font-black bg-primary text-white px-3 py-1 rounded-full uppercase animate-bounce">PRÓXIMO</span>}
              </div>
            );
          }) : (
            <div className="w-full py-16 text-center bg-white border border-dashed border-slate-100 rounded-[2.5rem]">
               <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">SEM TIMES AGUARDANDO</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ArenaPanel;
