
import React from 'https://esm.sh/react@18.2.0';
import { Player } from '../types.ts';

const Ranking: React.FC<{ players: Player[] }> = ({ players }) => {
  const sorted = [...players].sort((a, b) => b.goals - a.goals);
  return (
    <div className="p-8 pb-32 animate-in fade-in duration-500">
      <h1 className="text-6xl font-condensed tracking-tighter uppercase mb-10 leading-none">Scout <span className="text-primary italic">Ranking</span></h1>
      <div className="space-y-4">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center justify-between p-5 bg-white rounded-apple-xl border border-slate-50">
            <div className="flex items-center gap-4">
               <span className="text-xl font-black text-slate-200">{i+1}</span>
               <img src={p.photoUrl} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
               <div>
                 <p className="font-black text-navy-deep">{p.name}</p>
                 <p className="text-[10px] text-primary font-bold uppercase">{p.position}</p>
               </div>
            </div>
            <div className="text-center bg-slate-50 px-3 py-1 rounded-lg">
              <p className="text-2xl font-condensed text-navy-deep leading-none">{p.goals}</p>
              <p className="text-[8px] font-black uppercase text-slate-400">Gols</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ranking;
