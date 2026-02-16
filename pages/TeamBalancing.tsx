
import React, { useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';
import { balanceTeams } from '../services/geminiService.ts';

interface TeamBalancingProps {
  players: Player[];
  onPageChange: (page: Page) => void;
}

interface TeamData {
  name: string;
  fieldIds: string[];
  goalkeeperId: string | null;
}

const TeamBalancing: React.FC<TeamBalancingProps> = ({ players, onPageChange }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [teamsResult, setTeamsResult] = useState<TeamData[] | null>(null);

  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";
  const confirmedPlayers = players.filter(p => p.status === 'presente');

  useEffect(() => {
    setSelectedIds(new Set(confirmedPlayers.map(p => p.id)));
  }, [players]);

  const handleGenerate = async () => {
    const selectedPlayers = players.filter(p => selectedIds.has(p.id));
    if (selectedPlayers.length < 4) return alert("Selecione pelo menos 4 atletas.");
    
    setIsGenerating(true);
    try {
      const result = await balanceTeams(selectedPlayers);
      if (result?.teams) setTeamsResult(result.teams);
    } catch (e) {
      alert("Erro ao sortear. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onPageChange(Page.Dashboard)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-navy shadow-sm">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-xl font-black text-navy uppercase italic tracking-tighter">SALA TÁTICA</h2>
        </div>
        <img src={mainLogoUrl} className="w-10 h-10 opacity-20" />
      </header>

      <main className="pb-40">
        {!teamsResult ? (
          <div className="space-y-8">
            <div className="bg-navy rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-elite">
              <div className="relative z-10">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">CONVOCAÇÃO</p>
                <h3 className="text-4xl font-condensed italic font-black mb-6">{selectedIds.size} ATLETAS</h3>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-glow-red flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  {isGenerating ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "GERAR TIMES IA"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {confirmedPlayers.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => {
                    const next = new Set(selectedIds);
                    if (next.has(p.id)) next.delete(p.id); else next.add(p.id);
                    setSelectedIds(next);
                  }}
                  className={`bg-white border p-4 rounded-[1.5rem] flex items-center justify-between cursor-pointer transition-all ${selectedIds.has(p.id) ? 'border-primary shadow-soft-white' : 'border-slate-100 opacity-40'}`}
                >
                  <div className="flex items-center gap-4">
                    <img src={p.photoUrl} className="w-10 h-10 rounded-xl object-cover" />
                    <span className="text-sm font-black text-navy uppercase italic">{p.name}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${selectedIds.has(p.id) ? 'bg-primary border-primary text-white' : 'border-slate-100'}`}>
                    {selectedIds.has(p.id) && <span className="material-symbols-outlined text-xs">check</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-slide-up">
            {teamsResult.map((team, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft-white overflow-hidden">
                <div className={`px-6 py-4 flex justify-between items-center ${idx % 2 === 0 ? 'bg-navy' : 'bg-primary'} text-white`}>
                  <h4 className="font-black uppercase italic tracking-tighter">{team.name}</h4>
                  <span className="text-[9px] font-black opacity-50 uppercase tracking-widest">CROATIA ELITE</span>
                </div>
                <div className="p-6 space-y-4">
                  {team.goalkeeperId && (
                    <div className="pb-3 border-b border-slate-50">
                      <PlayerBadge pid={team.goalkeeperId} players={players} isGK />
                    </div>
                  )}
                  {team.fieldIds.map(fid => (
                    <PlayerBadge key={fid} pid={fid} players={players} />
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => setTeamsResult(null)} className="w-full py-6 text-slate-300 font-black uppercase text-[10px] tracking-widest">LIMPAR E REFAZER</button>
          </div>
        )}
      </main>
    </div>
  );
};

const PlayerBadge = ({ pid, players, isGK }: any) => {
  const p = players.find((x: any) => x.id === pid);
  if (!p) return null;
  return (
    <div className="flex items-center gap-3">
      <img src={p.photoUrl} className="w-10 h-10 rounded-xl object-cover grayscale" />
      <div>
        <p className="text-sm font-black text-navy uppercase italic leading-none">{p.name}</p>
        <span className={`text-[8px] font-black uppercase tracking-widest ${isGK ? 'text-primary' : 'text-slate-300'}`}>
          {isGK ? 'GOLEIRO 🧤' : p.position}
        </span>
      </div>
    </div>
  );
};

export default TeamBalancing;
