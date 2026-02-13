
import React, { useState } from 'react';
import { Page, Player } from '../types.ts';
import { balanceTeams } from '../services/geminiService.ts';

const CreateMatch: React.FC<{ players: Player[], onPageChange: (page: Page) => void }> = ({ players, onPageChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [teams, setTeams] = useState<{ teamRed: string[], teamBlue: string[] } | null>(null);
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const confirmedPlayers = players.filter(p => p.status === 'presente');

  const handleGenerateTeams = async () => {
    if (confirmedPlayers.length < 4) {
      alert("Mínimo de 4 jogadores confirmados para sortear.");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await balanceTeams(confirmedPlayers);
      setTeams(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-900 animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => onPageChange(Page.Dashboard)} className="material-symbols-outlined text-slate-300">arrow_back</button>
          <div className="w-10 h-10">
            <img src={mainLogoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-sm font-black text-navy uppercase italic tracking-tighter">SORTEIO DE ELITE</h2>
        </div>
      </header>

      <section className="px-6 mt-8">
        <div className="bg-white rounded-apple-xl p-8 border border-slate-100 shadow-soft relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-croatia opacity-[0.02]"></div>
          <div className="relative z-10 flex justify-between items-center mb-6">
            <div>
              <h4 className="font-black text-navy uppercase italic text-sm tracking-tight">Equilíbrio por IA</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{confirmedPlayers.length} Atletas Disponíveis</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined fill-1">auto_awesome</span>
            </div>
          </div>
          
          <button 
            onClick={handleGenerateTeams}
            disabled={isGenerating}
            className="w-full h-14 bg-navy text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-navy/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isGenerating ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> PROCESSANDO SKILLS...</>
            ) : (
              <><span className="material-symbols-outlined text-sm">shuffle</span> GERAR TIMES EQUILIBRADOS</>
            )}
          </button>
        </div>

        {teams && (
          <div className="grid grid-cols-1 gap-6 pb-40">
            <TeamCard name="Team Blue" color="navy" players={teams.teamBlue} allPlayers={players} />
            <TeamCard name="Team Red" color="primary" players={teams.teamRed} allPlayers={players} />
          </div>
        )}
      </section>
    </div>
  );
};

const TeamCard = ({ name, color, players, allPlayers }: any) => (
  <div className="bg-white rounded-apple-xl border border-slate-100 shadow-soft overflow-hidden animate-in zoom-in-95">
    <div className={`px-6 py-4 flex justify-between items-center ${color === 'primary' ? 'bg-primary text-white' : 'bg-navy text-white'}`}>
      <h4 className="font-black uppercase italic text-sm tracking-widest">{name}</h4>
      <span className="text-[9px] font-black opacity-60 uppercase">{players.length} ATLETAS</span>
    </div>
    <div className="p-6 space-y-4">
      {players.map((pName: string) => {
        const p = allPlayers.find((x: any) => x.name === pName);
        return (
          <div key={pName} className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100">
               <img src={p?.photoUrl || `https://i.pravatar.cc/100?u=${pName}`} className="w-full h-full object-cover" />
             </div>
             <div>
               <p className="text-xs font-black text-navy uppercase italic">{pName}</p>
               <p className="text-[8px] font-bold text-slate-300 uppercase">{p?.position || 'Atleta'}</p>
             </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default CreateMatch;
