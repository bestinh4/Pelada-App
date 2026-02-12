
import React from 'react';
import { Player } from '../types';

interface RankingProps {
  players: Player[];
}

const Ranking: React.FC<RankingProps> = ({ players }) => {
  const sortedPlayers = [...players].sort((a, b) => b.goals - a.goals);

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom duration-500 bg-background min-h-full">
      <header className="flex items-center justify-between px-8 py-8 sticky top-0 bg-background/80 backdrop-blur-xl z-30 border-b border-slate-50">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100"><span className="material-symbols-outlined text-xl">chevron_left</span></button>
        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-300">O&A ELITE PRO</span>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100"><span className="material-symbols-outlined text-xl">search</span></button>
      </header>

      <main className="px-8 pt-8 pb-10">
        <div className="mb-10">
          <h1 className="text-6xl font-condensed leading-[0.85] tracking-tighter uppercase mb-4">
            Scout<br/><span className="text-primary italic">Ranking</span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-4 h-[2px] bg-primary"></div>
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Temporada 24/25 • Elite Division</p>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-8 hide-scrollbar">
          <button className="px-8 py-3 bg-navy-deep text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-navy-deep/20 whitespace-nowrap">Top Scorers</button>
          <button className="px-8 py-3 bg-white text-slate-400 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap hover:text-navy hover:border-navy/20 transition-all">Defesa</button>
          <button className="px-8 py-3 bg-white text-slate-400 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap hover:text-navy hover:border-navy/20 transition-all">Goleiros</button>
        </div>

        <div className="space-y-4">
          {sortedPlayers.map((player, index) => (
            <div key={player.id} className="group relative flex items-center justify-between p-5 bg-white rounded-apple-xl shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className={`w-20 h-20 rounded-full p-[3px] shadow-inner transition-transform group-hover:scale-105 ${index === 0 ? 'bg-gradient-to-tr from-yellow-400 to-yellow-100' : 'bg-slate-100'}`}>
                    <div className="w-full h-full rounded-full bg-cover bg-center border-2 border-white" style={{ backgroundImage: `url(${player.photoUrl})` }}></div>
                  </div>
                  <div className={`absolute -top-1 -left-1 flex items-center justify-center w-8 h-8 text-white text-[12px] font-black italic rounded-full ring-4 ring-white shadow-lg ${index === 0 ? 'bg-primary' : index < 3 ? 'bg-navy' : 'bg-slate-400'}`}>
                    {index + 1}
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="heavy-italic text-xl uppercase leading-none tracking-tight text-navy-deep group-hover:text-primary transition-colors">{player.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{player.team || 'ELITE PRO'}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">{player.position}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center min-w-[60px] bg-slate-50 rounded-2xl py-3 border border-slate-100">
                <p className="text-navy-deep text-3xl font-condensed leading-none">{player.goals}</p>
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter mt-1">Gols</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Ranking;
