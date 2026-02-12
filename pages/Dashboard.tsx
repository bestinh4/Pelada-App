
import React, { useState, useEffect, useMemo } from 'react';
import { Match, PastMatch } from '../types.ts';
import { MOCK_HISTORY } from '../constants.tsx';

const TimerDigit = ({ value, label, color = "text-navy-deep" }: { value: string, label: string, color?: string }) => (
  <div className="flex flex-col items-center min-w-[80px]">
    <span className={`text-7xl font-condensed leading-none tracking-tight ${color} transition-all duration-300`}>{value}</span>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-3">{label}</span>
  </div>
);

const HistoryCard: React.FC<{ match: PastMatch }> = ({ match }) => {
  const isWin = match.score.us > match.score.them;
  const isDraw = match.score.us === match.score.them;

  return (
    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 group transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center gap-5 cursor-pointer active:scale-[0.98]">
      <div className="flex flex-col items-center justify-center w-20 h-20 bg-slate-50 rounded-[1.5rem] border border-slate-100 shrink-0">
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-condensed leading-none ${isWin ? 'text-green-500' : isDraw ? 'text-navy-deep' : 'text-primary'}`}>
            {match.score.us}
          </span>
          <span className="text-[10px] font-black text-slate-300">-</span>
          <span className="text-2xl font-condensed leading-none text-slate-400">
            {match.score.them}
          </span>
        </div>
        <p className={`text-[8px] font-black uppercase tracking-tighter mt-1 ${isWin ? 'text-green-500' : isDraw ? 'text-navy-deep' : 'text-primary'}`}>
          {isWin ? 'Vitória' : isDraw ? 'Empate' : 'Derrota'}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.1em]">{match.type}</span>
          <div className="w-1 h-1 rounded-full bg-slate-200"></div>
          <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(match.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
        </div>
        <h4 className="text-lg font-black text-navy-deep truncate tracking-tight uppercase group-hover:text-primary transition-colors">
          {match.opponent}
        </h4>
      </div>

      <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-navy-deep group-hover:text-white transition-all shadow-inner">
        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>
    </div>
  );
};

const Dashboard: React.FC<{ match: Match | null }> = ({ match }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 1, mins: 30, secs: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [searchHistory, setSearchHistory] = useState('');
  const logoUrl = "https://upload.wikimedia.org/wikipedia/pt/c/cf/Croatia_football_federation.png";

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
          if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
          if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
          setIsRunning(false);
          return prev;
        });
      }, 1000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isRunning]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft({ hours: 1, mins: 30, secs: 0 });
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 bg-background min-h-full">
      <header className="px-8 pt-12 pb-6 flex justify-between items-center bg-white/60 backdrop-blur-xl sticky top-0 z-20 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 p-1.5 overflow-hidden">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-[10px] font-black text-primary tracking-[0.25em] uppercase">O&A ELITE PRO</span>
            <h1 className="text-xl font-black flex items-center gap-2 tracking-tighter text-navy-deep">
              Arena <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(237,29,35,0.6)] ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-primary'}`}></div>
            </h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 hover:text-primary active:scale-90 transition-all">
            <span className="material-symbols-outlined text-slate-400 text-xl">notifications</span>
          </button>
        </div>
      </header>

      {match ? (
        <>
          <section className="px-8 py-12 flex flex-col items-center">
            <div className="flex items-baseline gap-3 mb-10 select-none">
              <TimerDigit value={pad(timeLeft.hours)} label="Horas" />
              <div className="flex flex-col gap-3 pb-8 opacity-20"><div className="w-1.5 h-1.5 bg-navy rounded-full"></div><div className="w-1.5 h-1.5 bg-navy rounded-full"></div></div>
              <TimerDigit value={pad(timeLeft.mins)} label="Minutos" />
              <div className="flex flex-col gap-3 pb-8"><div className={`w-1.5 h-1.5 bg-primary rounded-full shadow-sm ${isRunning ? 'animate-pulse' : ''}`}></div><div className={`w-1.5 h-1.5 bg-primary rounded-full shadow-sm ${isRunning ? 'animate-pulse' : ''}`}></div></div>
              <TimerDigit value={pad(timeLeft.secs)} label="Segundos" color="text-primary" />
            </div>

            <div className="flex gap-4 w-full max-w-sm">
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={`flex-[2] h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all ${isRunning ? 'bg-white border-2 border-primary text-primary' : 'bg-navy text-white shadow-navy/20 hover:bg-navy-deep'}`}
              >
                <span className="material-symbols-outlined">{isRunning ? 'pause_circle' : 'play_circle'}</span>
                {isRunning ? 'Pausar Partida' : 'Iniciar Arena'}
              </button>
              <button 
                onClick={handleReset}
                className="w-16 h-16 bg-white text-slate-400 border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-all hover:text-navy group"
              >
                <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">replay</span>
              </button>
            </div>
          </section>

          <section className="px-8 pb-10 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-navy-deep uppercase tracking-[0.15em]">Partida Ativa</h2>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{match.type}</span>
            </div>
            
            <div className="bg-white rounded-apple-xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[32px]">sports_soccer</span>
                </div>
                <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                  <span className="material-symbols-outlined text-[14px]">bolt</span> {match.date}
                </div>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{match.location}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-navy-deep tracking-tighter">{match.confirmedPlayers}</span>
                  <span className="text-sm font-bold text-slate-400">/ {match.totalSlots} convocados</span>
                </div>
              </div>
              <div className="mt-8">
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-[2px]">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(237,29,35,0.4)]" style={{ width: `${(match.confirmedPlayers/match.totalSlots)*100}%` }}></div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="px-8 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-slate-300 text-4xl">event_busy</span>
          </div>
          <h2 className="text-xl font-black text-navy-deep mb-2">Arena em Descanso</h2>
          <p className="text-slate-400 text-xs font-medium max-w-[200px]">Nenhuma partida agendada para hoje. Aproveite o Scout!</p>
        </section>
      )}

      <section className="px-8 pb-32 space-y-6">
        <h2 className="text-sm font-black text-navy-deep uppercase tracking-[0.15em]">Últimos Resultados</h2>
        <div className="space-y-4">
          {MOCK_HISTORY.map((m) => (
            <HistoryCard key={m.id} match={m} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
