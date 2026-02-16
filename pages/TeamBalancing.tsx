
import React, { useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';
import { db, doc, setDoc } from '../services/firebase.ts';

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
  const [isSavingArena, setIsSavingArena] = useState(false);
  const [teamsResult, setTeamsResult] = useState<TeamData[] | null>(null);

  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";
  const confirmedPlayers = players.filter(p => p.status === 'presente');

  useEffect(() => {
    setSelectedIds(new Set(confirmedPlayers.map(p => p.id)));
  }, [players]);

  const handleGenerateNormal = () => {
    const selectedPlayers = players.filter(p => selectedIds.has(p.id));
    if (selectedPlayers.length < 4) return alert("Selecione pelo menos 4 atletas.");
    
    setIsGenerating(true);
    
    // Simulação de "embaralhamento" visual
    setTimeout(() => {
      const gks = selectedPlayers.filter(p => p.position === 'Goleiro');
      const field = selectedPlayers.filter(p => p.position !== 'Goleiro');

      // Fisher-Yates shuffle
      const shuffledGks = [...gks].sort(() => Math.random() - 0.5);
      const shuffledField = [...field].sort(() => Math.random() - 0.5);

      const playersPerTeam = 7;
      const numTeams = Math.ceil(selectedPlayers.length / playersPerTeam);
      const teams: TeamData[] = [];

      for (let i = 0; i < numTeams; i++) {
        const teamGk = shuffledGks.pop() || null;
        const teamField: string[] = [];
        
        while (teamField.length < (teamGk ? 6 : 7) && shuffledField.length > 0) {
          const p = shuffledField.pop();
          if (p) teamField.push(p.id);
        }

        teams.push({
          name: `ESQUADRÃO ${String.fromCharCode(65 + i)}`,
          fieldIds: teamField,
          goalkeeperId: teamGk ? teamGk.id : null
        });
      }

      setTeamsResult(teams);
      setIsGenerating(false);
    }, 1500);
  };

  const handlePushToArena = async () => {
    if (!teamsResult) return;
    setIsSavingArena(true);
    try {
      const arenaTeams = teamsResult.map((t, idx) => ({
        id: `team_${idx}_${Date.now()}`,
        name: t.name,
        playerIds: t.goalkeeperId ? [t.goalkeeperId, ...t.fieldIds] : t.fieldIds,
        hasGoalkeeper: !!t.goalkeeperId,
        consecutiveWins: 0,
        totalWins: 0,
        isIncomplete: (t.goalkeeperId ? 1 : 0) + t.fieldIds.length < 7
      }));

      const newSession = {
        id: "current",
        status: "active",
        teams: arenaTeams,
        waitingQueue: arenaTeams.slice(2).map(t => t.id),
        activeMatch: {
          teamAId: arenaTeams[0]?.id || null,
          teamBId: arenaTeams[1]?.id || null,
          scoreA: 0,
          scoreB: 0,
          startedAt: Date.now()
        },
        createdAt: Date.now()
      };

      await setDoc(doc(db, "sessions", "current"), newSession);
      onPageChange(Page.ArenaPanel);
    } catch (e) {
      alert("Erro ao enviar para Arena.");
    } finally {
      setIsSavingArena(false);
    }
  };

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onPageChange(Page.Dashboard)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-navy shadow-sm">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-xl font-black text-navy uppercase italic tracking-tighter leading-none">SORTEIO ELITE</h2>
        </div>
        <img src={mainLogoUrl} className="w-12 h-12 animate-float" />
      </header>

      <main className="pb-40">
        {!teamsResult ? (
          <div className="space-y-8">
            <div className="mesh-gradient-champions rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-elite min-h-[240px] flex flex-col justify-center">
               <img src={mainLogoUrl} className="absolute -right-10 -bottom-10 w-48 h-48 opacity-[0.15] rotate-12 grayscale brightness-[200%] animate-float" />
               <div className="relative z-10">
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2">GERENCIADOR DE CONFRONTOS</p>
                <h3 className="text-4xl font-condensed italic font-black mb-10">{selectedIds.size} ATLETAS NA FILA</h3>
                <button 
                  onClick={handleGenerateNormal}
                  disabled={isGenerating || selectedIds.size < 4}
                  className="w-full h-18 bg-white text-navy rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all"
                >
                  {isGenerating ? <div className="w-6 h-6 border-3 border-navy/20 border-t-navy rounded-full animate-spin"></div> : (
                    <>
                      <span className="material-symbols-outlined">shuffle</span>
                      REALIZAR SORTEIO
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-navy italic px-2">QUEM PARTICIPA?</h4>
              <div className="grid grid-cols-1 gap-3">
                {confirmedPlayers.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => {
                      const next = new Set(selectedIds);
                      if (next.has(p.id)) next.delete(p.id); else next.add(p.id);
                      setSelectedIds(next);
                    }}
                    className={`bg-white border p-4 rounded-[1.75rem] flex items-center justify-between cursor-pointer transition-all ${selectedIds.has(p.id) ? 'border-primary shadow-soft-white' : 'border-slate-100 opacity-40 scale-95'}`}
                  >
                    <div className="flex items-center gap-4">
                      <img src={p.photoUrl} className="w-12 h-12 rounded-2xl object-cover" />
                      <div>
                        <p className="text-[14px] font-black text-navy uppercase italic leading-none mb-1">{p.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.position}</p>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${selectedIds.has(p.id) ? 'bg-primary border-primary text-white shadow-glow-red' : 'border-slate-100'}`}>
                      {selectedIds.has(p.id) && <span className="material-symbols-outlined text-[14px]">check</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-navy italic">TIMES SORTEADOS</h3>
              <button onClick={() => setTeamsResult(null)} className="text-[10px] font-black text-primary uppercase border-b-2 border-primary/10 pb-1">REFAZER SORTEIO</button>
            </div>

            <div className="space-y-6">
              {teamsResult.map((team, idx) => (
                <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft-white overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 0.15}s` }}>
                  <div className={`px-8 py-5 flex justify-between items-center ${idx % 2 === 0 ? 'bg-navy' : 'bg-primary'} text-white`}>
                    <h4 className="font-black uppercase italic tracking-tighter">{team.name}</h4>
                    <span className="text-[9px] font-black opacity-50 uppercase tracking-widest">SQUAD {idx+1}</span>
                  </div>
                  <div className="p-8 space-y-6">
                    {team.goalkeeperId && (
                      <div className="pb-4 border-b border-slate-50">
                        <PlayerRow pid={team.goalkeeperId} players={players} isGK />
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-4">
                      {team.fieldIds.map((fid, i) => (
                        <PlayerRow key={i} pid={fid} players={players} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <button 
                onClick={handlePushToArena}
                disabled={isSavingArena}
                className="w-full h-20 bg-navy text-white rounded-[2rem] font-black uppercase text-[12px] tracking-widest shadow-elite active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                {isSavingArena ? <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                  <>
                    <span className="material-symbols-outlined">stadium</span>
                    INICIAR PARTIDAS COM ESTES TIMES
                  </>
                )}
              </button>
              
              <button 
                onClick={() => {
                  let msg = `⚽ *ESQUADRÕES O&A* 🇭🇷\n\n`;
                  teamsResult.forEach(t => {
                    const gk = players.find(p => p.id === t.goalkeeperId);
                    const flds = t.fieldIds.map(fid => players.find(p => p.id === fid)?.name).filter(Boolean);
                    msg += `*${t.name.toUpperCase()}*\n🧤 GK: ${gk?.name || '---'}\n🏃: ${flds.join(', ')}\n\n`;
                  });
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="w-full h-16 bg-success text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined text-lg">share</span>
                COMPARTILHAR NO GRUPO
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const PlayerRow = ({ pid, players, isGK }: any) => {
  const p = players.find((x: Player) => x.id === pid);
  if (!p) return null;
  return (
    <div className="flex items-center gap-4 animate-fade-in">
      <img src={p.photoUrl} className={`w-12 h-12 rounded-2xl object-cover border-2 ${isGK ? 'border-primary' : 'border-slate-50'}`} />
      <div>
        <p className="text-[14px] font-black text-navy uppercase italic leading-none mb-1.5">{p.name}</p>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${isGK ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
          {isGK ? 'GOLEIRO 🧤' : p.position}
        </span>
      </div>
    </div>
  );
};

export default TeamBalancing;
