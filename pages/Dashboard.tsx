
import React, { useState, useEffect } from 'https://esm.sh/react@18.2.0';
import { Match } from '../types.ts';
import { MOCK_HISTORY } from '../constants.tsx';

const Dashboard: React.FC<{ match: Match | null }> = ({ match }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 1, mins: 30, secs: 0 });
  const [isRunning, setIsRunning] = useState(false);
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
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="flex flex-col animate-in fade-in duration-500 min-h-full">
      <header className="px-8 pt-12 pb-6 flex justify-between items-center bg-white/60 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <img src={logoUrl} className="w-10 h-10 object-contain" alt="Logo" />
          <h1 className="text-xl font-black text-navy-deep tracking-tighter">Arena Elite</h1>
        </div>
      </header>

      {match ? (
        <section className="px-8 py-12 flex flex-col items-center">
          <div className="text-7xl font-condensed text-navy-deep flex gap-4">
             <span>{String(timeLeft.hours).padStart(2,'0')}</span>:
             <span>{String(timeLeft.mins).padStart(2,'0')}</span>:
             <span className="text-primary">{String(timeLeft.secs).padStart(2,'0')}</span>
          </div>
          <button onClick={() => setIsRunning(!isRunning)} className="mt-8 w-full h-16 bg-navy text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all">
            {isRunning ? 'Pausar Arena' : 'Iniciar Arena'}
          </button>
        </section>
      ) : (
        <div className="py-20 text-center text-slate-400">Nenhuma partida agendada.</div>
      )}

      <section className="px-8 pb-32">
        <h2 className="text-sm font-black uppercase mb-6 tracking-widest">Resultados Recentes</h2>
        <div className="space-y-4">
          {MOCK_HISTORY.map(m => (
            <div key={m.id} className="bg-white p-5 rounded-apple-xl border border-slate-50 flex items-center justify-between">
              <div>
                <p className="font-black text-navy-deep uppercase text-lg">{m.opponent}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{m.type}</p>
              </div>
              <div className="text-2xl font-condensed">{m.score.us} - {m.score.them}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
