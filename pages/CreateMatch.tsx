
import React, { useState } from 'react';
import { Page, Player, Match } from '../types.ts';
import { balanceTeams } from '../services/geminiService.ts';
import { db, addDoc, collection } from '../services/firebase.ts';

const CreateMatch: React.FC<{ players: Player[], onPageChange: (page: Page) => void }> = ({ players, onPageChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingMatch, setIsSavingMatch] = useState(false);
  const [teams, setTeams] = useState<{ teamRed: string[], teamBlue: string[] } | null>(null);
  
  // States para novos dados da pelada
  const [matchData, setMatchData] = useState({
    location: 'Arena Central Society',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    price: 35
  });

  const confirmedPlayers = players.filter(p => p.status === 'presente');
  const numPossibleTeams = Math.floor(confirmedPlayers.length / 5);
  const drawRule = numPossibleTeams >= 4 ? "SAEM OS DOIS EM CASO DE EMPATE" : "SAI O TIME QUE ENTROU EM CASO DE EMPATE";

  const handleGenerateTeams = async () => {
    if (confirmedPlayers.length < 4) {
      alert("É necessário pelo menos 4 jogadores confirmados para balancear.");
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

  const handleCreateNewMatch = async () => {
    setIsSavingMatch(true);
    try {
      await addDoc(collection(db, "matches"), {
        ...matchData,
        type: 'Society',
        totalSlots: 20,
        confirmedPlayers: confirmedPlayers.length,
        createdAt: new Date().toISOString()
      });
      alert("Nova pelada agendada com sucesso!");
      onPageChange(Page.Dashboard);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar pelada.");
    } finally {
      setIsSavingMatch(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => onPageChange(Page.Dashboard)} className="material-symbols-outlined text-slate-300">arrow_back</button>
            <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">GESTÃO DA PELADA</h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined fill-1">settings</span>
          </div>
        </div>
      </header>

      <section className="px-6 mt-8 space-y-6">
        {/* Configuração da Pelada */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-soft">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">DADOS DO CONFRONTO</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="date" 
                value={matchData.date}
                onChange={e => setMatchData({...matchData, date: e.target.value})}
                className="bg-slate-50 border-none rounded-xl p-4 text-xs font-bold text-navy" 
              />
              <input 
                type="time" 
                value={matchData.time}
                onChange={e => setMatchData({...matchData, time: e.target.value})}
                className="bg-slate-50 border-none rounded-xl p-4 text-xs font-bold text-navy" 
              />
            </div>
            <input 
              type="text" 
              placeholder="Local da Pelada" 
              value={matchData.location}
              onChange={e => setMatchData({...matchData, location: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-bold text-navy" 
            />
            <button 
              onClick={handleCreateNewMatch}
              disabled={isSavingMatch}
              className="w-full h-14 bg-navy text-white rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isSavingMatch ? 'SALVANDO...' : 'PUBLICAR NOVA PELADA'}
            </button>
          </div>
        </div>

        {/* Status de Rotação Baseado em Times */}
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">PROJEÇÃO DE RODADA</span>
              <span className="px-2 py-1 bg-primary rounded text-[8px] font-black uppercase tracking-widest">SISTEMA 10 MIN / 2 GOLS</span>
            </div>
            <div className="flex items-center gap-6 mb-6">
               <div className="text-center">
                 <p className="text-3xl font-condensed text-white">{confirmedPlayers.length}</p>
                 <p className="text-[8px] font-black uppercase text-white/30">ATLETAS</p>
               </div>
               <div className="w-px h-8 bg-white/10"></div>
               <div className="text-center">
                 <p className="text-3xl font-condensed text-white">{numPossibleTeams}</p>
                 <p className="text-[8px] font-black uppercase text-white/30">TIMES</p>
               </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary italic leading-tight">
                {drawRule}
              </p>
            </div>
          </div>
        </div>

        {/* Botão de Sorteio IA */}
        <button 
          onClick={handleGenerateTeams}
          disabled={isGenerating}
          className="w-full h-18 bg-primary text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>IA EQUILIBRANDO SKILLS...</span>
            </div>
          ) : (
            <>
              <span className="material-symbols-outlined text-2xl">shuffle</span>
              SORTEAR TIMES EQUILIBRADOS
            </>
          )}
        </button>

        {teams && (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700 pb-10">
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
