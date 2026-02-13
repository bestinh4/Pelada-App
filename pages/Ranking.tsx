
import React from 'https://esm.sh/react@18.2.0';
import { Player } from '../types.ts';

const Ranking: React.FC<{ players: Player[] }> = ({ players }) => {
  const sorted = [...players].sort((a, b) => b.goals - a.goals);
  
  return (
    <div className="p-6 pb-32 animate-in fade-in duration-700 min-h-full">
      <div className="relative pt-6 pb-12">
        <h1 className="text-5xl font-condensed tracking-tighter uppercase leading-none text-navy-deep">
          Scout <br/>
          <span className="text-primary italic">Top Scorer</span>
        </h1>
        <div className="absolute top-8 right-0 text-slate-100 opacity-50">
          <span className="material-symbols-outlined text-[80px]">emoji_events</span>
        </div>
      </div>

      <div className="space-y-4">
        {sorted.map((p, i) => (
          <div 
            key={p.id} 
            className={`relative flex items-center justify-between p-5 rounded-apple-xl border transition-all duration-300 animate-in slide-in-from-bottom-4 ${i === 0 ? 'bg-navy-deep text-white border-navy shadow-xl scale-[1.02]' : 'bg-white border-slate-50 shadow-sm'}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {i < 3 && (
              <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-slate-300' : 'bg-orange-400'}`}>
                <span className="text-[10px] font-black text-white">{i + 1}</span>
              </div>
            )}
            
            <div className="flex items-center gap-4">
               {i >= 3 && <span className="text-xs font-black text-slate-200 w-4">{i + 1}</span>}
               <img src={p.photoUrl} className={`w-12 h-12 rounded-full object-cover border-2 ${i === 0 ? 'border-primary' : 'border-slate-100'}`} />
               <div>
                 <p className={`font-black uppercase text-sm tracking-tight ${i === 0 ? 'text-white' : 'text-navy-deep'}`}>{p.name}</p>
                 <p className={`text-[9px] font-black uppercase tracking-widest ${i === 0 ? 'text-primary' : 'text-slate-400'}`}>{p.position}</p>
               </div>
            </div>

            <div className="flex flex-col items-end">
              <span className={`text-3xl font-condensed leading-none ${i === 0 ? 'text-primary' : 'text-navy-deep'}`}>{p.goals}</span>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Gols</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ranking;
