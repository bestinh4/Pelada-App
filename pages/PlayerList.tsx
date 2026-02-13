
import React, { useState, useMemo } from 'react';
import { Player, Page } from '../types.ts';

const PlayerList: React.FC<{ players: Player[], currentUser: any, onPageChange: (page: Page) => void }> = ({ players, currentUser, onPageChange }) => {
  const [activeTab, setActiveTab] = useState<'confirmados' | 'espera'>('confirmados');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('TODOS');

  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const positions = ['TODOS', 'Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Atacante'];

  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const matchesTab = activeTab === 'confirmados' ? p.status === 'presente' : p.status === 'pendente';
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPosition = selectedPosition === 'TODOS' || p.position === selectedPosition;
      return matchesTab && matchesSearch && matchesPosition;
    });
  }, [players, activeTab, searchQuery, selectedPosition]);

  const confirmedCount = players.filter(p => p.status === 'presente').length;
  const waitingCount = players.filter(p => p.status === 'pendente').length;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-32">
      <header className="px-6 pt-12 pb-6 bg-white/80 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={mainLogoUrl} className="w-10 h-10 object-contain" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">CONVOCAÇÃO ELITE</h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">FEVEREIRO • 2026</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-navy shadow-sm active:scale-90 transition-all">
              <span className="material-symbols-outlined text-xl">share</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xl">search</span>
            <input 
              type="text"
              placeholder="Buscar atleta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-navy placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 px-1">
            {positions.map(pos => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${selectedPosition === pos ? 'bg-navy text-white border-navy shadow-lg shadow-navy/20' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        <div className="flex bg-slate-100/50 p-1.5 rounded-[1.5rem] border border-slate-200/50 mt-6">
          <TabButton 
            active={activeTab === 'confirmados'} 
            onClick={() => setActiveTab('confirmados')}
            label="CONFIRMADOS"
            count={confirmedCount}
          />
          <TabButton 
            active={activeTab === 'espera'} 
            onClick={() => setActiveTab('espera')}
            label="LISTA DE ESPERA"
            count={waitingCount}
          />
        </div>
      </header>

      <section className="px-6 mt-8 space-y-4">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((p, idx) => (
            <div key={p.id} className="bg-white rounded-[2.2rem] p-5 border border-slate-100 shadow-soft flex items-center gap-5 transition-all hover:border-primary/20 hover:translate-x-1 group">
              {/* Player Image with Rank Badge */}
              <div className="relative">
                <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden border-4 border-slate-50 shadow-inner group-hover:scale-105 transition-transform">
                  <img src={p.photoUrl} className="w-full h-full object-cover" alt={p.name} />
                </div>
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary rounded-xl border-2 border-white flex items-center justify-center rotate-[-12deg] shadow-lg">
                  <span className="text-[10px] font-black text-white italic">#{idx + 1}</span>
                </div>
              </div>

              {/* Player Info & Skills */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-black text-navy uppercase italic tracking-tight text-base leading-none mb-1">{p.name}</h4>
                    <span className="inline-block px-2 py-0.5 bg-navy/5 text-navy text-[8px] font-black uppercase tracking-widest rounded-md">
                      {p.position}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded-lg">
                    <span className="text-xs font-black text-primary">{p.goals}</span>
                    <span className="material-symbols-outlined text-primary text-sm fill-1">sports_soccer</span>
                  </div>
                </div>

                {/* FIFA Style Attributes */}
                <div className="grid grid-cols-3 gap-3 mt-3">
                   <MiniStat label="ATA" value={p.skills?.attack || 70} color="primary" />
                   <MiniStat label="DEF" value={p.skills?.defense || 70} color="navy" />
                   <MiniStat label="STM" value={p.skills?.stamina || 70} color="emerald-500" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
            <span className="material-symbols-outlined text-6xl mb-4">person_off</span>
            <p className="font-black text-[10px] uppercase tracking-widest">Nenhum atleta encontrado</p>
          </div>
        )}
      </section>

      {/* Modern High-End FAB */}
      <button className="fixed bottom-36 right-8 w-16 h-16 bg-navy text-white rounded-3xl shadow-2xl shadow-navy/30 flex items-center justify-center active:scale-90 hover:scale-110 transition-all z-40 border-4 border-white">
        <div className="relative">
          <span className="material-symbols-outlined text-3xl">person_add</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></div>
        </div>
      </button>
    </div>
  );
};

const TabButton = ({ active, onClick, label, count }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${active ? 'bg-white text-navy shadow-xl shadow-navy/5' : 'text-slate-400 hover:text-navy'}`}
  >
    {label}
    <span className={`min-w-[1.5rem] h-6 flex items-center justify-center px-1.5 rounded-lg text-[9px] ${active ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
  </button>
);

const MiniStat = ({ label, value, color }: any) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between items-center text-[7px] font-black text-slate-400">
      <span>{label}</span>
      <span className={`text-${color === 'primary' ? 'primary' : color}`}>{value}</span>
    </div>
    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color === 'primary' ? 'bg-primary' : color === 'navy' ? 'bg-navy' : color} rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default PlayerList;
