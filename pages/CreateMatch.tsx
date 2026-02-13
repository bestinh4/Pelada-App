
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
      alert("É necessário pelo menos 4 jogadores confirmados.");
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
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => onPageChange(Page.Dashboard)} className="material-symbols-outlined text-slate-300">arrow_back</button>
            <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">EQUILIBRAR TIMES</h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined fill-1">auto_awesome</span>
          </div>
        </div>
      </header>

      <section className="px-6 mt-8">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft relative overflow-hidden mb-10">
          <div className="absolute inset-0 bg-croatia opacity-[0.03]"></div>
          <div className="relative z-10">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-navy text-white flex items-center justify-center">
                  <span className="text-2xl font-black italic">{confirmedPlayers.length}</span>
                </div>
                <div>
                  <h3 className="font-black text-navy uppercase italic leading-none mb-1">ATLETAS DISPONÍVEIS</h3>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Baseado no status de presença</p>
                </div>
             </div>
             
             <button 
                onClick={handleGenerateTeams}
                disabled={isGenerating}
                className="w-full h-18 bg-primary text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
             >
                {isGenerating ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>IA ANALISANDO SKILLS...</span>
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl">shuffle</span>
                    GERAR CONVOCAÇÃO IA
                  </>
                )}
             </button>
          </div>
        </div>

        {teams && (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
             <TeamResultCard title="Time Branco" color="navy" players={teams.teamBlue} allPlayers={players} />
             <TeamResultCard title="Time Vermelho" color="primary" players={teams.teamRed} allPlayers={players} />
          </div>
        )}
      </section>
    </div>
  );
};

const TeamResultCard = ({ title, color, players, allPlayers }: any) => (
  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
    <div className={`px-8 py-5 flex justify-between items-center ${color === 'primary' ? 'bg-primary text-white' : 'bg-navy text-white'}`}>
       <h4 className="font-black uppercase italic text-sm tracking-widest">{title}</h4>
       <span className="text-[10px] font-black uppercase opacity-60">{players.length} Atletas</span>
    </div>
    <div className="p-8 space-y-5">
       {players.map((pName: string) => {
         const p = allPlayers.find((x: any) => x.name === pName);
         return (
           <div key={pName} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                    <img src={p?.photoUrl || `https://i.pravatar.cc/100?u=${pName}`} className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <h5 className="text-xs font-black text-navy uppercase italic">{pName}</h5>
                    <p className="text-[9px] font-bold text-slate-300 uppercase">{p?.position || 'Jogador'}</p>
                 </div>
              </div>
              <div className="flex items-center gap-1">
                 <span className="text-[10px] font-black text-navy">{p?.skills?.attack || 70}</span>
                 <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
              </div>
           </div>
         );
       })}
    </div>
  </div>
);

export default CreateMatch;
