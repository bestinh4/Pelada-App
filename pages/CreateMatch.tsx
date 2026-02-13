
import React, { useState } from 'https://esm.sh/react@18.2.0';
import { Page } from '../types.ts';

const CreateMatch: React.FC<{ onMatchCreated: () => void, onPageChange: (page: Page) => void }> = ({ onMatchCreated, onPageChange }) => {
  const [numTeams, setNumTeams] = useState(2);
  const [randomDraw, setRandomDraw] = useState(true);

  return (
    <div className="flex flex-col min-h-full bg-navy-deep text-white animate-in fade-in duration-500 px-6 pt-12">
      <header className="flex items-center justify-between mb-10">
        <button onClick={() => onPageChange(Page.Dashboard)} className="material-symbols-outlined text-white/60 active:scale-90 transition-transform">arrow_back</button>
        <h2 className="text-lg font-bold">Sorteio de Times</h2>
        <button onClick={() => alert("Configurações avançadas em breve.")} className="material-symbols-outlined text-white/60 active:scale-90 transition-transform">settings</button>
      </header>

      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Configuração</h3>
          <span className="text-[10px] font-bold text-white/30">14 Jogadores confirmados</span>
        </div>

        <div className="bg-[#0E1324] rounded-3xl p-6 border border-white/5 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm">Número de Times</h4>
              <p className="text-[10px] text-white/20">7 jogadores por time</p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-2">
              <button onClick={() => setNumTeams(Math.max(2, numTeams - 1))} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center active:scale-90 transition-transform"><span className="material-symbols-outlined text-sm">remove</span></button>
              <span className="text-xl font-black">{numTeams}</span>
              <button onClick={() => setNumTeams(numTeams + 1)} className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center active:scale-90 transition-transform"><span className="material-symbols-outlined text-sm">add</span></button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm">Sorteio Aleatório</h4>
              <span className="material-symbols-outlined text-primary text-sm">shuffle</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={randomDraw} onChange={() => setRandomDraw(!randomDraw)} />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Times Sorteados</h3>
          <button onClick={() => alert("Sorteie os times para compartilhar!")} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/30 active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-sm">share</span> Compartilhar
          </button>
        </div>

        <div className="space-y-4">
          <TeamCard name="Time A" color="emerald" players={["João Silva", "Pedro Santos", "Lucas M."]} />
          <TeamCard name="Time B" color="navy" players={["Carlos Edu", "Rafael F."]} />
        </div>
      </section>

      <div className="fixed bottom-24 left-0 right-0 px-6 py-4 z-50">
        <button onClick={onMatchCreated} className="w-full h-16 bg-emerald-500 text-navy-deep rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
          <span className="material-symbols-outlined">shuffle</span>
          Sortear Times
        </button>
      </div>
    </div>
  );
};

const TeamCard = ({ name, color, players }: any) => (
  <div className="bg-[#0E1324] rounded-3xl border border-white/5 overflow-hidden">
    <div className="bg-white/5 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${color === 'emerald' ? 'bg-emerald-500 text-navy-deep' : 'bg-primary text-white'}`}>
          {name.charAt(name.length - 1)}
        </div>
        <h4 className="font-bold">{name}</h4>
      </div>
      <span className="text-[10px] font-bold text-white/30">7 Jogadores</span>
    </div>
    <div className="p-4 space-y-4">
      {players.map((p: any) => (
        <div key={p} className="flex items-center gap-4 px-2">
           <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
             <img src={`https://i.pravatar.cc/100?u=${p}`} className="w-full h-full object-cover" />
           </div>
           <span className="text-sm font-medium text-white/60">{p}</span>
        </div>
      ))}
      <div className="pt-2 text-center">
        <span className="text-[10px] font-bold text-white/20">+4 outros jogadores</span>
      </div>
    </div>
  </div>
);

export default CreateMatch;
