
import React, { useState } from 'react';
import { Page, Player, Match } from '../types.ts';
import { balanceTeams } from '../services/geminiService.ts';
import { db, addDoc, collection } from '../services/firebase.ts';
import { sendPushNotification } from '../services/notificationService.ts';

interface CreateMatchProps {
  players: Player[];
  currentUser: any;
  onPageChange: (page: Page) => void;
}

interface TeamData {
  name: string;
  field: string[];
  goalkeeper: string | null;
}

const CreateMatch: React.FC<CreateMatchProps> = ({ players, currentUser, onPageChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingMatch, setIsSavingMatch] = useState(false);
  const [teamsResult, setTeamsResult] = useState<TeamData[] | null>(null);
  
  const currentPlayer = players.find(p => p.id === currentUser?.uid);
  const isAdmin = currentPlayer?.role === 'admin';

  const [matchData, setMatchData] = useState({
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    price: 35,
    fieldSlots: 30,
    gkSlots: 5
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-8 text-center">
        <h2 className="text-2xl font-black text-navy uppercase italic mb-4 tracking-tighter">ACESSO RESTRITO</h2>
        <p className="text-slate-400 text-xs mb-8 uppercase font-bold tracking-widest">Apenas a diretoria pode organizar peladas.</p>
        <button onClick={() => onPageChange(Page.Dashboard)} className="px-10 py-5 bg-navy text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">VOLTAR PARA ARENA</button>
      </div>
    );
  }

  const confirmedPlayers = players.filter(p => p.status === 'presente');
  const gksCount = confirmedPlayers.filter(p => p.position === 'Goleiro').length;

  const handleCreateNewMatch = async () => {
    if (!matchData.location.trim()) {
      alert("Defina o local da batalha.");
      return;
    }

    setIsSavingMatch(true);
    try {
      const newMatch: Partial<Match> = {
        location: matchData.location.trim(),
        date: matchData.date,
        time: matchData.time,
        price: matchData.price,
        fieldSlots: matchData.fieldSlots,
        gkSlots: matchData.gkSlots,
        type: 'Society',
        confirmedPlayers: confirmedPlayers.length,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "matches"), newMatch);
      sendPushNotification("🔥 CONVOCAÇÃO ELITE!", `Nova pelada em ${newMatch.location}. Confirme agora!`);
      alert("Pelada publicada na arena!");
      onPageChange(Page.Dashboard);
    } catch (err) {
      alert("Erro ao salvar pelada.");
    } finally {
      setIsSavingMatch(false);
    }
  };

  const handleGenerateTeams = async () => {
    if (confirmedPlayers.length < 4) {
      alert("Mínimo de 4 atletas para sortear.");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await balanceTeams(confirmedPlayers);
      setTeamsResult(result.teams);
    } catch (e) {
      alert("IA ocupada. Tente novamente em instantes.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-32">
      <header className="px-6 pt-12 pb-6 bg-white/70 border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter">ORGANIZAR PELADA</h2>
        </div>
      </header>

      <section className="px-6 mt-8 space-y-8">
        {/* Card de Configuração */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft space-y-5">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">LOCAL DO JOGO</label>
            <input 
              type="text" 
              placeholder="Ex: Arena Pro" 
              value={matchData.location}
              onChange={e => setMatchData({...matchData, location: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 font-bold text-navy outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">DATA</label>
               <input type="date" value={matchData.date} onChange={e => setMatchData({...matchData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 font-bold text-navy" />
            </div>
            <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">HORÁRIO</label>
               <input type="time" value={matchData.time} onChange={e => setMatchData({...matchData, time: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 font-bold text-navy" />
            </div>
          </div>

          <button 
            onClick={handleCreateNewMatch} 
            disabled={isSavingMatch} 
            className="w-full h-16 bg-navy text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
          >
            {isSavingMatch ? "PROCESSANDO..." : "PUBLICAR AGENDAMENTO"}
          </button>
        </div>

        {/* Divisor Visual */}
        <div className="flex items-center gap-4 px-4">
          <div className="flex-1 h-px bg-slate-100"></div>
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">SORTEIO IA 6+1</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        {/* Botão de Sorteio */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-navy uppercase">{confirmedPlayers.length} CONFIRMADOS</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">GERARÁ {Math.ceil(confirmedPlayers.length/7)} TIMES</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
              <span className="material-symbols-outlined text-emerald-600 text-sm">front_hand</span>
              <span className="text-[9px] font-black text-emerald-600">{gksCount} GKS</span>
            </div>
          </div>

          <button 
            onClick={handleGenerateTeams} 
            disabled={isGenerating} 
            className="w-full h-20 bg-primary text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            {isGenerating ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-2xl fill-1">bolt</span>
                EQUILIBRAR TIMES (GEMINI 3)
              </>
            )}
          </button>
        </div>

        {/* Resultado dos Times */}
        {teamsResult && (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
             {teamsResult.map((team, idx) => (
               <TeamDisplayCard 
                key={idx} 
                team={team} 
                allPlayers={players} 
                color={idx % 2 === 0 ? 'navy' : 'primary'}
               />
             ))}
             
             <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase leading-relaxed">
                  * Vagas abertas devem ser preenchidas via rodízio<br/>
                  definido pelo ADM durante a partida.
                </p>
             </div>
          </div>
        )}
      </section>
    </div>
  );
};

// Fix: Use React.FC to properly type the component and satisfy TypeScript's check for the 'key' prop in mappings
const TeamDisplayCard: React.FC<{ team: TeamData, allPlayers: Player[], color: 'primary' | 'navy' }> = ({ team, allPlayers, color }) => {
  // Garantir que sempre existam 6 slots de linha
  const fieldSlots = Array(6).fill(null);
  team.field.forEach((name, i) => { if (i < 6) fieldSlots[i] = name; });

  const renderPlayerRow = (pName: string | null, isGK: boolean = false) => {
    if (!pName) {
      return (
        <div className="flex items-center gap-4 opacity-30">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
             <span className="material-symbols-outlined text-slate-400 text-lg">{isGK ? 'front_hand' : 'person_add'}</span>
          </div>
          <div>
            <h5 className="text-[10px] font-black text-slate-400 uppercase italic">VAGA ABERTA</h5>
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{isGK ? 'RODÍZIO GOLEIRO' : 'RODÍZIO LINHA'}</p>
          </div>
        </div>
      );
    }

    const p = allPlayers.find(x => x.name === pName);
    return (
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl overflow-hidden border-2 ${isGK ? 'border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'border-slate-50'}`}>
          <img 
            src={p?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(pName)}&background=random&color=fff`} 
            className="w-full h-full object-cover" 
            alt={pName}
          />
        </div>
        <div>
          <h5 className="text-[11px] font-black text-navy uppercase italic leading-none mb-1">{pName}</h5>
          <div className="flex items-center gap-1.5">
            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded ${isGK ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
              {isGK ? 'GOLEIRO' : (p?.position || 'LINHA')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
      <div className={`px-8 py-5 flex justify-between items-center ${color === 'primary' ? 'bg-primary text-white' : 'bg-navy text-white'}`}>
         <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">groups</span>
            <h4 className="font-black uppercase italic text-sm tracking-tighter">{team.name}</h4>
         </div>
         <span className="text-[9px] font-black uppercase tracking-widest opacity-60">SQUAD 6+1</span>
      </div>
      
      <div className="p-8 space-y-6">
        {/* Slot do Goleiro */}
        <div className="pb-4 border-b border-slate-50">
           {renderPlayerRow(team.goalkeeper, true)}
        </div>

        {/* Slots de Linha */}
        <div className="grid grid-cols-1 gap-5">
           {fieldSlots.map((name, i) => (
             <div key={i}>{renderPlayerRow(name)}</div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default CreateMatch;
