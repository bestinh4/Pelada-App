
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
      alert("Erro na IA. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    if (!teamsResult) return;
    let message = `⚽ *SORTEIO ARENA O&A ELITE* 🇭🇷\n\n`;
    teamsResult.forEach(t => {
      message += `*${t.name.toUpperCase()}*\n`;
      message += `🧤 GK: ${t.goalkeeper || 'Rodízio'}\n`;
      message += `🏃 Linha: ${t.field.join(', ')}\n\n`;
    });
    message += `Bora pro jogo! 🔥`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  const gksSelected = players.filter(p => selectedIds.has(p.id) && p.position === 'Goleiro').length;
  const fieldSelected = selectedIds.size - gksSelected;

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6 glass-white sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button onClick={() => onPageChange(Page.Dashboard)} className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-navy active:scale-90 transition-all border border-slate-100">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div>
            <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">SORTEIO ELITE</h2>
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mt-1.5 flex items-center gap-1.5">
               SALA TÁTICA 🇭🇷
            </p>
          </div>
        </div>
        <img src={mainLogoUrl} className="w-10 h-10 object-contain opacity-20 grayscale" alt="" />
      </header>

      <main className="px-6 mt-8">
        {!teamsResult ? (
          <div className="space-y-8">
            {/* IA SUMMARY CARD */}
            <div className="bg-white rounded-[2.8rem] p-9 border border-slate-100 shadow-heavy relative overflow-hidden animate-scale-in">
              <div className="absolute top-0 right-0 w-20 h-20 bg-croatia-pattern opacity-5"></div>
              <div className="relative z-10 flex justify-between items-center mb-10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 block mb-2">SELEÇÃO PARA O JOGO</span>
                  <h3 className="text-4xl font-condensed italic text-navy leading-none tracking-tighter">{selectedIds.size} ATLETAS</h3>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-xl font-black text-primary font-condensed italic">{gksSelected}</p>
                    <p className="text-[7px] font-black text-slate-300 uppercase">GKs</p>
                  </div>
                  <div className="text-center border-l border-slate-100 pl-4">
                    <p className="text-xl font-black text-navy font-condensed italic">{fieldSelected}</p>
                    <p className="text-[7px] font-black text-slate-300 uppercase">LINHA</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || selectedIds.size < 4}
                className="w-full h-20 bg-primary text-white rounded-[1.8rem] font-black uppercase text-xs tracking-widest shadow-heavy flex items-center justify-center gap-5 active:scale-[0.97] transition-all"
              >
                {isGenerating ? (
                  <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-3xl">bolt</span>
                    GERAR TIMES COM IA
                  </>
                )}
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3 px-2">
                 <div className="w-1.5 h-5 bg-navy rounded-full"></div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-navy italic">CONFIRMADOS</h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {confirmedPlayers.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => togglePlayer(p.id)}
                    className={`p-5 rounded-[1.8rem] border transition-all flex items-center justify-between cursor-pointer ${selectedIds.has(p.id) ? 'bg-white border-primary/30 shadow-pro' : 'bg-slate-50/50 border-slate-100 opacity-60'}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-100">
                        <img src={p.photoUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-navy uppercase italic leading-none mb-1.5">{p.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.position}</p>
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
              <h3 className="text-xs font-black uppercase tracking-[0.5em] text-navy italic">ESCALAÇÃO VATRENI</h3>
              <button onClick={() => setTeamsResult(null)} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-8">REFAZER SORTEIO</button>
            </div>

            <div className="space-y-8">
              {teamsResult.map((team, idx) => (
                <div key={idx} className="bg-white rounded-[2.8rem] border border-slate-100 shadow-heavy overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className={`px-8 py-5 flex justify-between items-center ${idx % 2 === 0 ? 'bg-navy' : 'bg-primary'} text-white`}>
                    <div className="flex items-center gap-3">
                       <span className="material-symbols-outlined text-lg">groups</span>
                       <h4 className="font-black uppercase italic tracking-tighter text-sm">{team.name}</h4>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">VATRENI UNIT {idx+1}</span>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <PlayerRow name={team.goalkeeper} isGK={true} allPlayers={players} />
                    <div className="h-px bg-slate-50 w-full"></div>
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
              onClick={handleShare}
              className="w-full h-20 bg-success text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-5 shadow-lg active:scale-[0.97] transition-all"
            >
              <span className="material-symbols-outlined text-3xl">share</span>
              PUBLICAR ESCALAÇÃO
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
    <div className="flex items-center gap-5 group">
      <div className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-transform group-hover:scale-105 ${isGK ? 'border-primary ring-4 ring-primary/5 shadow-pro' : 'border-slate-50'}`}>
        <img 
          src={p?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=003876&color=fff`} 
          className="w-full h-full object-cover" 
          alt={name}
        />
      </div>
      <div>
        <h5 className="text-[14px] font-black text-navy uppercase italic leading-none mb-1.5">{name}</h5>
        <div className="flex items-center gap-2">
           <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${isGK ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
             {isGK ? 'GOLEIRO' : (p?.position || 'LINHA')}
           </span>
           {isGK && <span className="material-symbols-outlined text-primary text-[12px] fill-1">verified</span>}
        </div>
      </div>
    </div>
  );
};

export default TeamBalancing;
