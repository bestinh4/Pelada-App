
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
    if (selectedPlayers.length < 4) {
      alert("Selecione pelo menos 4 atletas.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await balanceTeams(selectedPlayers);
      setTeamsResult(result.teams);
    } catch (e) {
      alert("Falha no balanceamento IA. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-32">
      <header className="px-8 pt-12 pb-6 glass-white sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onPageChange(Page.Dashboard)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-navy shadow-sm border border-slate-100">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">SALA TÁTICA</h2>
            <p className="text-[8px] font-black text-primary uppercase tracking-[0.4em] mt-1.5">GEMINI 3 ENGINE</p>
          </div>
        </div>
        <img src={mainLogoUrl} className="w-10 h-10 object-contain opacity-20 grayscale" alt="" />
      </header>

      <main className="px-6 mt-8">
        {!teamsResult ? (
          <div className="space-y-10">
            {/* CARD GERADOR LIMPO */}
            <div className="bg-white rounded-[2.5rem] p-9 border border-slate-100 shadow-heavy relative overflow-hidden">
              <div className="absolute top-0 right-0 h-full w-2 bg-primary"></div>
              <div className="flex justify-between items-center mb-10">
                <div>
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">CONVOCADOS</span>
                   <h3 className="text-4xl font-condensed italic text-navy leading-none">{selectedIds.size} ATLETAS</h3>
                </div>
                <div className="text-right">
                   <p className="text-xl font-black text-primary font-condensed italic">{players.filter(p => selectedIds.has(p.id) && p.position === 'Goleiro').length} GKs</p>
                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">PAREDÕES</p>
                </div>
              </div>
              
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || selectedIds.size < 4}
                className="w-full h-18 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-heavy flex items-center justify-center gap-4 active:scale-[0.98] transition-all"
              >
                {isGenerating ? (
                  <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl">bolt</span>
                    GERAR ESCALAÇÃO IA
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-navy italic ml-2">CONFIRMADOS NO JOGO</h4>
              <div className="grid grid-cols-1 gap-3">
                {confirmedPlayers.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => togglePlayer(p.id)}
                    className={`p-5 rounded-3xl border transition-all flex items-center justify-between cursor-pointer ${selectedIds.has(p.id) ? 'bg-white border-primary shadow-pro' : 'bg-slate-50/50 border-slate-100 opacity-60'}`}
                  >
                    <div className="flex items-center gap-4">
                      <img src={p.photoUrl} className="w-12 h-12 rounded-xl object-cover grayscale" alt="" />
                      <div>
                        <p className="text-sm font-black text-navy uppercase italic leading-none mb-1">{p.name}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{p.position}</p>
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all ${selectedIds.has(p.id) ? 'bg-primary border-primary text-white scale-110' : 'border-slate-200'}`}>
                       {selectedIds.has(p.id) && <span className="material-symbols-outlined text-lg font-bold">check</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-in slide-in-from-bottom-10">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-navy italic">ESCALAÇÃO PROCESSADA</h3>
              <button onClick={() => setTeamsResult(null)} className="text-[10px] font-black text-primary uppercase tracking-widest underline underline-offset-8">REFAZER</button>
            </div>

            <div className="space-y-8">
              {teamsResult.map((team, idx) => (
                <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-heavy overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className={`px-8 py-5 flex justify-between items-center ${idx % 2 === 0 ? 'bg-navy' : 'bg-primary'} text-white`}>
                    <h4 className="font-black uppercase italic tracking-tighter text-[13px]">{team.name}</h4>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40 italic">ELITE SQUAD</span>
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
                let msg = `⚽ *ESCALAÇÃO ELITE* 🇭🇷\n\n`;
                teamsResult.forEach(t => {
                  msg += `*${t.name.toUpperCase()}*\n🧤 GK: ${t.goalkeeper || 'Rodízio'}\n🏃: ${t.field.join(', ')}\n\n`;
                });
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="w-full h-18 bg-success text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-2xl">share</span>
              PUBLICAR NO WHATSAPP
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const PlayerRow = ({ name, isGK = false, allPlayers }: { name: string | null, isGK?: boolean, allPlayers: Player[] }) => {
  const p = allPlayers.find(x => x.name === name);
  if (!name) return null;
  return (
    <div className="flex items-center gap-4">
      <img src={p?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=003876&color=fff`} className="w-11 h-11 rounded-xl object-cover grayscale" alt="" />
      <div>
        <h5 className="text-[13px] font-black text-navy uppercase italic leading-none mb-1">{name}</h5>
        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${isGK ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
          {isGK ? 'GOLEIRO' : (p?.position || 'LINHA')}
        </span>
      </div>
    </div>
  );
};

export default TeamBalancing;
