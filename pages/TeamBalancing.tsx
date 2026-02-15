
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
    // Pré-selecionar todos os confirmados ao carregar
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
      alert("Selecione pelo menos 4 atletas para um sorteio equilibrado.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await balanceTeams(selectedPlayers);
      setTeamsResult(result.teams);
    } catch (e) {
      alert("Ocorreu um erro ao processar com a IA. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    if (!teamsResult) return;
    let message = `⚽ *ARENA O&A ELITE - TIMES SORTEADOS* 🇭🇷\n\n`;
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
    <div className="flex flex-col animate-in fade-in duration-500 pb-40">
      <header className="px-6 pt-12 pb-6 glass sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onPageChange(Page.Dashboard)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-navy active:scale-90 transition-all">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">SORTEIO ELITE</h2>
            <p className="text-[8px] font-black text-primary uppercase tracking-[0.4em] mt-1">SALA TÁTICA IA</p>
          </div>
        </div>
        <img src={mainLogoUrl} className="w-10 h-10 object-contain opacity-20" alt="" />
      </header>

      <main className="px-6 mt-8">
        {!teamsResult ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-10">
            {/* CARD DE RESUMO SELEÇÃO */}
            <div className="bg-navy-deep rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-pro">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10 flex justify-between items-center mb-6">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-1">ATLETAS SELECIONADOS</span>
                  <h3 className="text-4xl font-condensed italic">{selectedIds.size} CONVOCADOS</h3>
                </div>
                <div className="flex items-center gap-3">
                   <div className="text-center">
                      <p className="text-xl font-black text-emerald-400">{gksSelected}</p>
                      <p className="text-[7px] font-black uppercase text-white/30">GKS</p>
                   </div>
                   <div className="w-px h-8 bg-white/10"></div>
                   <div className="text-center">
                      <p className="text-xl font-black text-primary">{fieldSelected}</p>
                      <p className="text-[7px] font-black uppercase text-white/30">LINHA</p>
                   </div>
                </div>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || selectedIds.size < 4}
                className="w-full h-18 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-3xl">bolt</span>
                    GERAR TIMES COM GEMINI 3
                  </>
                )}
              </button>
            </div>

            {/* LISTA DE SELEÇÃO */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-navy italic ml-2">CONFIRMADOS NA ARENA</h4>
              <div className="grid grid-cols-1 gap-3">
                {confirmedPlayers.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => togglePlayer(p.id)}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${selectedIds.has(p.id) ? 'bg-white border-primary shadow-sm' : 'bg-slate-50 border-slate-100 opacity-50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <img src={p.photoUrl} className="w-10 h-10 rounded-xl object-cover" alt="" />
                      <div>
                        <p className="text-xs font-black text-navy uppercase italic leading-none mb-1">{p.name}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{p.position}</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 ${selectedIds.has(p.id) ? 'bg-primary border-primary text-white' : 'border-slate-200'}`}>
                       {selectedIds.has(p.id) && <span className="material-symbols-outlined text-sm">check</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-in slide-in-from-bottom-10">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-navy italic">ESCALAÇÃO PROCESSADA</h3>
              <button onClick={() => setTeamsResult(null)} className="text-[9px] font-black text-primary uppercase tracking-widest">REFAZER</button>
            </div>

            <div className="space-y-8">
              {teamsResult.map((team, idx) => (
                <div key={idx} className="bg-white rounded-[3rem] border border-slate-100 shadow-pro overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className={`px-8 py-5 flex justify-between items-center ${idx % 2 === 0 ? 'bg-navy' : 'bg-primary'} text-white`}>
                    <div className="flex items-center gap-3">
                       <span className="material-symbols-outlined text-lg">groups</span>
                       <h4 className="font-black uppercase italic tracking-tighter text-sm">{team.name}</h4>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-50 italic">ELITE SQUAD</span>
                  </div>
                  
                  <div className="p-8 space-y-5">
                    {/* GOLEIRO */}
                    <div className="pb-4 border-b border-slate-50">
                       <PlayerRow name={team.goalkeeper} isGK={true} allPlayers={players} />
                    </div>
                    {/* LINHA */}
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
              className="w-full h-20 bg-emerald-500 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all mt-10"
            >
              <span className="material-symbols-outlined text-3xl">share</span>
              DIVULGAR NO WHATSAPP
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const PlayerRow = ({ name, isGK = false, allPlayers }: { name: string | null, isGK?: boolean, allPlayers: Player[] }) => {
  const p = allPlayers.find(x => x.name === name);
  if (!name) return (
    <div className="flex items-center gap-4 opacity-20 italic">
       <div className="w-12 h-12 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
          <span className="material-symbols-outlined text-slate-400">person_add</span>
       </div>
       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vaga em Aberto</span>
    </div>
  );

  return (
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl overflow-hidden border-2 ${isGK ? 'border-amber-400 shadow-sm' : 'border-slate-50'}`}>
        <img 
          src={p?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`} 
          className="w-full h-full object-cover" 
          alt={name}
        />
      </div>
      <div>
        <h5 className="text-[11px] font-black text-navy uppercase italic leading-none mb-1">{name}</h5>
        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${isGK ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
          {isGK ? 'GOLEIRO' : (p?.position || 'LINHA')}
        </span>
      </div>
    </div>
  );
};

export default TeamBalancing;
