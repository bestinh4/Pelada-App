
import React, { useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';
import { balanceTeams } from '../services/geminiService.ts';

interface TeamBalancingProps {
  players: Player[];
  onPageChange: (page: Page) => void;
}

interface TeamData {
  name: string;
  field: string[];
  goalkeeper: string | null;
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

  const togglePlayer = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleGenerate = async () => {
    const selectedPlayers = players.filter(p => selectedIds.has(p.id));
    if (selectedPlayers.length < 4) { alert("Selecione pelo menos 4 atletas."); return; }
    setIsGenerating(true);
    try {
      const result = await balanceTeams(selectedPlayers);
      setTeamsResult(result.teams);
    } catch (e) { alert("Falha no balanceamento IA."); } finally { setIsGenerating(false); }
  };

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onPageChange(Page.Dashboard)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-navy border border-slate-100">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h2 className="text-xl font-black text-navy uppercase italic tracking-tighter leading-none">SALA TÁTICA</h2>
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">SORTEIO IA</p>
          </div>
        </div>
        <img src={mainLogoUrl} className="w-10 h-10 object-contain opacity-20" alt="" />
      </header>

      <main className="space-y-8 pb-40">
        {!teamsResult ? (
          <>
            {/* HERO SELECTOR */}
            <div className="bg-navy rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-elite">
              <div className="absolute top-0 right-0 h-full w-2 bg-primary"></div>
              <div className="relative z-10 flex justify-between items-center mb-10">
                <div>
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">SELECIONADOS</span>
                   <h3 className="text-5xl font-condensed italic leading-none">{selectedIds.size} <span className="text-xl opacity-40">KINGS</span></h3>
                </div>
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                   <span className="material-symbols-outlined text-white/40">groups</span>
                </div>
              </div>
              
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || selectedIds.size < 4}
                className="w-full h-18 bg-primary text-white rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-glow-red flex items-center justify-center gap-4 active:scale-95 transition-all"
              >
                {isGenerating ? <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div> : "BALANCEAR EQUIPES"}
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-navy italic px-2">QUEM ESTÁ PRESENTE</h4>
              <div className="grid grid-cols-1 gap-3">
                {confirmedPlayers.map((p) => (
                  <div key={p.id} onClick={() => togglePlayer(p.id)} className={`bg-white border p-4 rounded-[1.75rem] flex items-center justify-between cursor-pointer transition-all ${selectedIds.has(p.id) ? 'border-primary shadow-soft-white' : 'border-slate-100 opacity-50'}`}>
                    <div className="flex items-center gap-4">
                      <img src={p.photoUrl} className="w-12 h-12 rounded-2xl object-cover grayscale" alt="" />
                      <div>
                        <p className="text-[14px] font-black text-navy uppercase italic leading-none mb-1.5">{p.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.position}</p>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${selectedIds.has(p.id) ? 'bg-primary border-primary text-white scale-110 shadow-glow-red' : 'border-slate-100'}`}>
                       {selectedIds.has(p.id) && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-navy italic">ESQUADRÕES DEFINIDOS</h3>
              <button onClick={() => setTeamsResult(null)} className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/20 pb-1">REFAZER</button>
            </div>

            <div className="space-y-6">
              {teamsResult.map((team, idx) => (
                <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft-white overflow-hidden">
                  <div className={`px-8 py-5 flex justify-between items-center ${idx % 2 === 0 ? 'bg-navy' : 'bg-primary'} text-white`}>
                    <h4 className="font-black uppercase italic tracking-tighter text-[14px]">{team.name}</h4>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">CROATIA ELITE</span>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    {team.goalkeeper && (
                      <div className="pb-4 border-b border-slate-50">
                        <PlayerRow name={team.goalkeeper} isGK={true} allPlayers={players} />
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-4">
                       {team.field.map((name, i) => (
                         <PlayerRow key={i} name={name} allPlayers={players} />
                       ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                let msg = `⚽ *ESCALAÇÃO O&A* 🇭🇷\n\n`;
                teamsResult.forEach(t => msg += `*${t.name.toUpperCase()}*\n🧤 GK: ${t.goalkeeper || '...'}\n🏃: ${t.field.join(', ')}\n\n`);
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="w-full h-20 bg-success text-white rounded-[2rem] font-black uppercase text-[12px] tracking-[0.4em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              <span className="material-symbols-outlined">share</span>
              WHATSAPP
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const PlayerRow = ({ name, isGK = false, allPlayers }: any) => {
  const p = allPlayers.find((x: any) => x.name === name);
  if (!name) return null;
  return (
    <div className="flex items-center gap-4">
      <img src={p?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0051a2&color=fff`} className="w-12 h-12 rounded-2xl object-cover grayscale" alt="" />
      <div>
        <h5 className="text-[14px] font-black text-navy uppercase italic leading-none mb-1.5">{name}</h5>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${isGK ? 'bg-primary text-white' : 'bg-slate-50 text-slate-300'}`}>
          {isGK ? 'GOLEIRO' : (p?.position || 'LINHA')}
        </span>
      </div>
    </div>
  );
};

export default TeamBalancing;
