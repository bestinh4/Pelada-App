
import React, { useState } from 'react';
import { Player } from '../types';
import { balanceTeams } from '../services/geminiService';

interface PlayerListProps {
  players: Player[];
}

const PlayerList: React.FC<PlayerListProps> = ({ players }) => {
  const [isBalancing, setIsBalancing] = useState(false);
  const [teams, setTeams] = useState<{ teamRed: string[], teamBlue: string[] } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const handleShuffle = async () => {
    setIsBalancing(true);
    try {
      const result = await balanceTeams(players.filter(p => p.status === 'presente'));
      setTeams(result);
      setShowResultModal(true);
    } catch (error) {
      console.error("Erro ao equilibrar times", error);
    } finally {
      setIsBalancing(false);
    }
  };

  const confirmedCount = players.filter(p => p.status === 'presente').length;

  return (
    <div className="flex flex-col animate-in slide-in-from-right duration-500 bg-background min-h-full relative">
      <header className="px-8 py-8 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-30 border-b border-slate-50">
        <div>
          <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">O&A ELITE PRO</span>
          <h2 className="text-3xl font-black tracking-tighter">Convocados</h2>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[22px]">tune</span>
          </button>
        </div>
      </header>

      <div className="px-6 py-6">
        <button 
          onClick={handleShuffle}
          disabled={isBalancing}
          className={`relative group overflow-hidden w-full h-20 rounded-3xl flex items-center justify-center gap-4 transition-all active:scale-[0.97] shadow-2xl ${isBalancing ? 'bg-slate-200 cursor-not-allowed' : 'bg-navy-deep hover:bg-navy shadow-navy/20'}`}
        >
          {/* Animated background effect */}
          {!isBalancing && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
          )}
          
          <span className={`material-symbols-outlined text-[28px] text-white transition-transform ${isBalancing ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`}>
            {isBalancing ? 'sync' : 'auto_awesome'}
          </span>
          <span className="text-white text-xs font-black tracking-[0.2em] uppercase">
            {isBalancing ? 'Processando IA...' : 'Equilibrar Arena'}
          </span>
        </button>

        {/* Inline Team Display (Persistent after modal) */}
        {teams && !showResultModal && (
          <div className="mt-8 animate-in zoom-in-95 duration-500">
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl overflow-hidden">
              <div className="bg-navy-deep p-4 flex justify-between items-center">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Confronto Gerado por IA</p>
                <button onClick={() => setTeams(null)} className="text-white/40 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-100">
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(237,29,35,0.6)]"></div>
                    <p className="text-[11px] font-black text-navy-deep uppercase tracking-widest">Team Red</p>
                  </div>
                  {teams.teamRed.map((name, i) => (
                    <p key={i} className="text-[13px] font-bold text-slate-500 flex items-center gap-2">
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span> {name}
                    </p>
                  ))}
                </div>
                <div className="p-6 space-y-3 bg-slate-50/30">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-navy shadow-[0_0_8px_rgba(0,56,118,0.4)]"></div>
                    <p className="text-[11px] font-black text-navy-deep uppercase tracking-widest">Team Blue</p>
                  </div>
                  {teams.teamBlue.map((name, i) => (
                    <p key={i} className="text-[13px] font-bold text-slate-500 flex items-center gap-2">
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span> {name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex items-end justify-between px-2">
          <div className="flex flex-col">
            <span className="text-5xl font-black text-navy-deep leading-none tracking-tighter">{confirmedCount}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Atletas Prontos</span>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Capacidade: {players.length}</span>
            <div className="h-2 w-40 bg-slate-100 rounded-full overflow-hidden p-[1px]">
              <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(237,29,35,0.4)]" style={{ width: `${(confirmedCount/players.length)*100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-6 mt-4 pb-32">
        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] ml-2">Lista de Presença</h3>
        {players.map(player => (
          <div 
            key={player.id} 
            className={`group flex items-center gap-4 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50 transition-all hover:shadow-md hover:-translate-y-0.5 ${player.status === 'presente' ? 'border-l-4 border-l-primary' : 'opacity-40 grayscale'}`}
          >
            <div className="relative shrink-0">
              <div className="rounded-2xl h-14 w-14 border-2 border-white shadow-md bg-cover bg-center transition-transform group-hover:scale-105" style={{ backgroundImage: `url(${player.photoUrl})` }}></div>
              {player.number && (
                <div className="absolute -top-1 -right-1 bg-navy-deep text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-black">{player.number}</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-navy-deep text-lg font-black tracking-tight truncate group-hover:text-primary transition-colors">{player.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[9px] font-black uppercase tracking-widest ${player.status === 'presente' ? 'text-primary' : 'text-slate-400'}`}>
                  {player.status === 'presente' ? 'CONFIRMADO' : 'PENDENTE'}
                </span>
                <span className="text-slate-200 text-[8px]">|</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">{player.position}</span>
              </div>
            </div>
            <div className="shrink-0">
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${player.status === 'presente' ? 'bg-primary/5 border-primary text-primary shadow-lg shadow-primary/10' : 'border-slate-100 text-slate-100'}`}>
                {player.status === 'presente' && <span className="material-symbols-outlined text-[18px] font-black">check</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prominent Success Modal */}
      {showResultModal && teams && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy-deep/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl p-8 flex flex-col items-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
            {/* Visual Header */}
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
               <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping"></div>
               <span className="material-symbols-outlined text-[56px] text-primary relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            
            <h3 className="text-3xl font-black text-navy-deep text-center mb-2 tracking-tighter leading-none">
              Arena <span className="text-primary italic">Equilibrada!</span>
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">IA otimizou as escalações</p>

            <div className="w-full space-y-4 mb-8">
               <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-white font-black text-xs">{teams.teamRed.length}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Red</p>
                    <p className="text-xs font-bold text-navy-deep truncate max-w-[180px]">
                      {teams.teamRed.slice(0, 3).join(', ')}...
                    </p>
                  </div>
               </div>

               <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-navy flex items-center justify-center shadow-lg shadow-navy/20">
                    <span className="text-white font-black text-xs">{teams.teamBlue.length}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Blue</p>
                    <p className="text-xs font-bold text-navy-deep truncate max-w-[180px]">
                      {teams.teamBlue.slice(0, 3).join(', ')}...
                    </p>
                  </div>
               </div>
            </div>

            <button 
              onClick={() => setShowResultModal(false)}
              className="w-full h-16 bg-navy-deep text-white font-black rounded-2xl tracking-[0.2em] uppercase text-xs active:scale-95 transition-all shadow-xl shadow-navy-deep/20 flex items-center justify-center gap-3"
            >
              Visualizar Times <span className="material-symbols-outlined text-sm">visibility</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerList;
