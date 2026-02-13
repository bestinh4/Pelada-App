
import React from 'https://esm.sh/react@18.2.0';
import { Player } from '../types.ts';

const Ranking: React.FC<{ players: Player[] }> = ({ players }) => {
  const sorted = [...players].sort((a, b) => b.goals - a.goals);
  
  return (
    <div className="p-6 pb-32 animate-in fade-in slide-in-from-bottom duration-700 min-h-full">
      <header className="relative pt-8 pb-14">
        <h1 className="text-6xl font-condensed tracking-tighter uppercase leading-[0.85] text-navy-deep">
          Scout <br/>
          <span className="text-primary italic">Top Scorer</span>
        </h1>
        <p className="mt-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Estatísticas da Temporada</p>
        <div className="absolute top-8 right-0 text-slate-100 opacity-50 pointer-events-none">
          <span className="material-symbols-outlined text-[120px] animate-float">trophy</span>
        </div>
      </header>

      <div className="space-y-4">
        {sorted.map((p, i) => (
          <div 
            key={p.id} 
            className={`relative flex items-center justify-between p-5 rounded-apple-xl border transition-all duration-500 hover:scale-[1.02] cursor-default ${i === 0 ? 'bg-navy-deep text-white border-navy shadow-2xl scale-[1.03] z-10' : 'bg-white border-slate-100 shadow-sm'}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Medal Badges */}
            {i < 3 && (
              <div className={`absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center shadow-2xl border-2 border-white z-20 ${i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' : 'bg-gradient-to-br from-orange-500 to-orange-700'}`}>
                <span className="material-symbols-outlined text-white text-[18px]">
                  {i === 0 ? 'rewarded_ads' : i === 1 ? 'workspace_premium' : 'military_tech'}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-4">
               {i >= 3 && <span className="text-xs font-black text-slate-300 w-5 text-center">{i + 1}</span>}
               <div className="relative">
                 <img src={p.photoUrl} className={`w-14 h-14 rounded-2xl object-cover border-2 ${i === 0 ? 'border-primary' : 'border-slate-100 shadow-inner'}`} />
                 {i === 0 && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-navy-deep"></div>}
               </div>
               <div>
                 <p className={`font-black uppercase text-sm tracking-tight mb-0.5 ${i === 0 ? 'text-white' : 'text-navy-deep'}`}>{p.name}</p>
                 <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${i === 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {p.position}
                    </span>
                    {p.goals > 10 && <span className="text-[8px] font-black text-yellow-500">★ PRO</span>}
                 </div>
               </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-condensed leading-none ${i === 0 ? 'text-primary' : 'text-navy-deep'}`}>{p.goals}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest opacity-30 ${i === 0 ? 'text-white' : 'text-slate-400'}`}>G</span>
              </div>
              <p className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1 ${i === 0 ? 'opacity-40' : 'text-slate-400'}`}>Marcados</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ranking;
