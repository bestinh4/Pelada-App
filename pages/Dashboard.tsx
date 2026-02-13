
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
    <div className="flex flex-col animate-in fade-in duration-700 min-h-full bg-slate-50/50">
      {/* Hero Match Section */}
      <section className="px-6 pt-10 pb-8">
        <div className="relative overflow-hidden rounded-apple-xl bg-navy-deep p-8 shadow-2xl shadow-navy/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-navy/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Live Match Center</span>
            </div>

            <h2 className="text-white text-sm font-bold uppercase tracking-widest mb-2 opacity-60">
              {match ? match.location : "Próxima Arena"}
            </h2>

            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-6xl font-condensed text-white tracking-tighter">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.mins).padStart(2, '0')}
              </span>
              <span className="text-3xl font-condensed text-primary">
                {String(timeLeft.secs).padStart(2, '0')}
              </span>
            </div>

            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 ${isRunning ? 'bg-white/10 text-white border border-white/20' : 'bg-primary text-white shadow-lg shadow-primary/30'}`}
              >
                <span className="material-symbols-outlined text-[18px]">{isRunning ? 'pause' : 'play_arrow'}</span>
                {isRunning ? 'Pausar' : 'Iniciar Arena'}
              </button>
              <button className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center active:scale-95">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="px-6 grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-apple border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <span className="text-2xl font-black text-navy-deep">24</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Inscritos</span>
        </div>
        <div className="bg-white p-5 rounded-apple border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <span className="text-2xl font-black text-primary">12</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Presentes</span>
        </div>
      </section>

      {/* Recent History */}
      <section className="px-6 pb-32">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-navy-deep font-black text-sm uppercase tracking-widest">Histórico de Batalhas</h3>
          <button className="text-[10px] font-black text-primary uppercase tracking-widest">Ver Todos</button>
        </div>
        
        <div className="space-y-3">
          {MOCK_HISTORY.map((m, idx) => (
            <div 
              key={m.id} 
              className="bg-white px-5 py-4 rounded-2xl border border-slate-50 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary">sports_soccer</span>
                </div>
                <div>
                  <p className="font-black text-navy-deep uppercase text-xs tracking-tight">{m.opponent}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{m.type} • {m.date}</p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-xl font-condensed text-xl ${m.score.us > m.score.them ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}>
                {m.score.us} - {m.score.them}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
