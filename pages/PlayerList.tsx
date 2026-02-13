
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

    // Filtra pela busca primeiro
    const filtered = players.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Ordena por status (presente primeiro)
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
        {/* Seção 1: CONFIRMADOS */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
              <h3 className="text-xs font-black uppercase tracking-widest text-navy">CONFIRMADOS</h3>
            </div>
            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-lg">
              {groupedPlayers.confirmed.length} ATLETAS
            </span>
          </div>
          <div className="space-y-4">
            {groupedPlayers.confirmed.map((p, i) => (
              <PlayerCard key={p.id} player={p} rank={i + 1} />
            ))}
            {groupedPlayers.confirmed.length === 0 && <EmptyState text="Nenhum confirmado ainda." />}
          </div>
        </section>

        {/* Seção 2: FILA DE ESPERA */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-amber-500 rounded-full"></div>
              <h3 className="text-xs font-black uppercase tracking-widest text-navy">FILA DE ESPERA</h3>
            </div>
            <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1 rounded-lg">
              {groupedPlayers.waitlist.length} EM ESPERA
            </span>
          </div>
          <div className="space-y-4">
            {groupedPlayers.waitlist.map((p, i) => (
              <PlayerCard key={p.id} player={p} rank={i + 1} isWaitlist />
            ))}
            {groupedPlayers.waitlist.length === 0 && <EmptyState text="Fila de espera vazia." />}
          </div>
        </section>

        {/* Seção 3: FORA DA PELADA */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-slate-300 rounded-full"></div>
              <h3 className="text-xs font-black uppercase tracking-widest text-navy opacity-50">FORA DA PELADA</h3>
            </div>
            <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-3 py-1 rounded-lg">
              {groupedPlayers.notPlaying.length} AUSENTES
            </span>
          </div>
          <div className="space-y-4 opacity-60 grayscale">
            {groupedPlayers.notPlaying.map((p, i) => (
              <PlayerCard key={p.id} player={p} rank={i + 1} isNotPlaying />
            ))}
            {groupedPlayers.notPlaying.length === 0 && <EmptyState text="Todos os atletas responderam." />}
          </div>
        </section>
      </main>

      {/* FAB fixo */}
      <button className="fixed bottom-36 right-8 w-16 h-16 bg-navy text-white rounded-3xl shadow-2xl flex items-center justify-center active:scale-90 transition-all z-40 border-4 border-white">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
};

// Fixed: Explicitly typed as React.FC to allow 'key' prop in JSX mapping
const PlayerCard: React.FC<{ player: Player; rank: number; isWaitlist?: boolean; isNotPlaying?: boolean }> = ({ player, rank, isWaitlist, isNotPlaying }) => (
  <div className={`bg-white rounded-[2rem] p-4 border border-slate-100 shadow-soft flex items-center gap-4 transition-all group ${isNotPlaying ? 'border-dashed' : 'hover:border-primary/20'}`}>
    <div className="relative">
      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50">
        <img src={player.photoUrl} className="w-full h-full object-cover" alt={player.name} />
      </div>
      <div className={`absolute -top-1 -left-1 w-6 h-6 rounded-lg border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-lg ${isWaitlist ? 'bg-amber-500' : isNotPlaying ? 'bg-slate-400' : 'bg-primary'}`}>
        #{rank}
      </div>
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <div className="truncate">
          <h4 className="font-black text-navy uppercase italic tracking-tight text-sm leading-none mb-1 truncate">{player.name}</h4>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">{player.position}</span>
        </div>
        {!isNotPlaying && (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded-md">
              <span className="text-[10px] font-black text-primary">{player.goals}</span>
              <span className="material-symbols-outlined text-primary text-[10px] fill-1">sports_soccer</span>
            </div>
          </div>
        )}
      </div>

      {!isNotPlaying && (
        <div className="flex gap-4 mt-3">
          <MiniStat value={player.skills?.attack} color={isWaitlist ? "bg-amber-400" : "bg-primary"} />
          <MiniStat value={player.skills?.defense} color={isWaitlist ? "bg-amber-500" : "bg-navy"} />
          <MiniStat value={player.skills?.stamina} color="bg-emerald-500" />
        </div>
      )}
    </div>
  </div>
);

// Fixed: Explicitly typed as React.FC for consistency
const MiniStat: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
    <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${value || 50}%` }}></div>
  </div>
);

// Fixed: Explicitly typed as React.FC for consistency
const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">{text}</p>
  </div>
);

export default PlayerList;
