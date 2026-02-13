
import React, { useState, useMemo } from 'react';
import { Player, Page, Match } from '../types.ts';

interface PlayerListProps {
  players: Player[];
  currentUser: any;
  match: Match | null;
  onPageChange: (page: Page) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentUser, match, onPageChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const fieldSlots = match?.fieldSlots || 30;
  const gkSlots = match?.gkSlots || 4;

  const groupedPlayers = useMemo(() => {
    const confirmed: Player[] = [];
    const waitlist: Player[] = [];
    const notPlaying: Player[] = [];

    let currentGKs = 0;
    let currentField = 0;

    const filtered = players.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      if (a.status === 'presente' && b.status === 'pendente') return -1;
      if (a.status === 'pendente' && b.status === 'presente') return 1;
      return 0;
    });

    sorted.forEach(p => {
      if (p.status === 'presente') {
        const isGK = p.position === 'Goleiro';
        if (isGK) {
          if (currentGKs < gkSlots) {
            confirmed.push(p);
            currentGKs++;
          } else {
            waitlist.push(p);
          }
        } else {
          if (currentField < fieldSlots) {
            confirmed.push(p);
            currentField++;
          } else {
            waitlist.push(p);
          }
        }
      } else {
        notPlaying.push(p);
      }
    });

    return { confirmed, waitlist, notPlaying };
  }, [players, searchQuery, fieldSlots, gkSlots]);

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-40">
      <header className="px-6 pt-12 pb-6 bg-white/80 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" alt="Logo" />
            <div>
              <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">CONVOCAÇÃO ELITE</h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">SITUAÇÃO DOS ATLETAS</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-navy shadow-sm active:scale-90 transition-all">
            <span className="material-symbols-outlined text-xl">ios_share</span>
          </button>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xl">search</span>
          <input 
            type="text"
            placeholder="Filtrar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-navy placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
      </header>

      <main className="px-6 mt-8 space-y-12">
        <Section title="CONFIRMADOS" color="bg-emerald-500" badgeColor="bg-emerald-50 text-emerald-600" list={groupedPlayers.confirmed} countText="ATLETAS" />
        <Section title="FILA DE ESPERA" color="bg-amber-500" badgeColor="bg-amber-50 text-amber-600" list={groupedPlayers.waitlist} countText="EM ESPERA" isWaitlist />
        <Section title="FORA DA PELADA" color="bg-slate-300" badgeColor="bg-slate-100 text-slate-400" list={groupedPlayers.notPlaying} countText="AUSENTES" isNotPlaying />
      </main>

      <button className="fixed bottom-36 right-8 w-16 h-16 bg-navy text-white rounded-3xl shadow-2xl flex items-center justify-center active:scale-90 transition-all z-40 border-4 border-white">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
};

const Section = ({ title, color, badgeColor, list, countText, isWaitlist, isNotPlaying }: any) => (
  <section>
    <div className="flex items-center justify-between mb-6 px-2">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-6 ${color} rounded-full`}></div>
        <h3 className={`text-xs font-black uppercase tracking-widest text-navy ${isNotPlaying ? 'opacity-50' : ''}`}>{title}</h3>
      </div>
      <span className={`${badgeColor} text-[10px] font-black px-3 py-1 rounded-lg`}>
        {list.length} {countText}
      </span>
    </div>
    <div className={`space-y-4 ${isNotPlaying ? 'opacity-60 grayscale' : ''}`}>
      {list.map((p: Player) => (
        <div key={p.id} className={`bg-white rounded-[1.8rem] p-4 border border-slate-100 shadow-soft flex items-center gap-4 transition-all group ${isNotPlaying ? 'border-dashed' : 'hover:border-primary/20'}`}>
          <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-slate-50 flex-shrink-0">
            <img src={p.photoUrl} className="w-full h-full object-cover" alt={p.name} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-navy uppercase italic tracking-tight text-sm leading-none mb-1.5 truncate">{p.name}</h4>
            <div className="flex items-center gap-2">
               <span className={`w-1.5 h-1.5 rounded-full ${isWaitlist ? 'bg-amber-500' : isNotPlaying ? 'bg-slate-300' : 'bg-emerald-500'}`}></span>
               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">{p.position}</span>
            </div>
          </div>
          {!isNotPlaying && (
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200">
               <span className="material-symbols-outlined text-lg">check_circle</span>
            </div>
          )}
        </div>
      ))}
      {list.length === 0 && <p className="py-6 text-center text-[9px] font-black uppercase tracking-widest text-slate-300 border-2 border-dashed border-slate-50 rounded-[2rem]">Nenhum registro</p>}
    </div>
  </section>
);

export default PlayerList;
