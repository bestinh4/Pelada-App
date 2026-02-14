
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

interface TeamResultCardProps {
  title: string;
  color: 'primary' | 'navy';
  players: string[];
  allPlayers: Player[];
}

const CreateMatch: React.FC<CreateMatchProps> = ({ players, currentUser, onPageChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingMatch, setIsSavingMatch] = useState(false);
  const [teams, setTeams] = useState<{ teamRed: string[], teamBlue: string[] } | null>(null);
  
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
        <h2 className="text-2xl font-black text-navy uppercase italic mb-4">ACESSO RESTRITO</h2>
        <button onClick={() => onPageChange(Page.Dashboard)} className="px-8 py-4 bg-navy text-white rounded-2xl font-black">VOLTAR</button>
      </div>
    );
  }

  const confirmedPlayers = players.filter(p => p.status === 'presente');

  const handleCreateNewMatch = async () => {
    if (!matchData.location.trim()) {
      alert("Local é obrigatório.");
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
      sendPushNotification("🔥 NOVA PELADA!", `Agendado em ${newMatch.location}. Bora pro jogo?`);
      alert("Pelada publicada com sucesso!");
      onPageChange(Page.Dashboard);
    } catch (err) {
      alert("Erro ao salvar pelada.");
    } finally {
      setIsSavingMatch(false);
    }
  };

  const handleGenerateTeams = async () => {
    if (confirmedPlayers.length < 4) {
      alert("Pelo menos 4 jogadores necessários.");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await balanceTeams(confirmedPlayers);
      setTeams(result);
    } catch (e) {
      alert("Erro no balanceamento IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-20">
      <header className="px-6 pt-12 pb-6 bg-white/70 border-b border-slate-100 sticky top-0 z-40">
        <h2 className="text-lg font-black text-navy uppercase italic">NOVO AGENDAMENTO</h2>
      </header>

      <section className="px-6 mt-8 space-y-6">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft space-y-4">
          <input 
            type="text" 
            placeholder="Local da Pelada" 
            value={matchData.location}
            onChange={e => setMatchData({...matchData, location: e.target.value})}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 font-bold text-navy"
          />
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={matchData.date} onChange={e => setMatchData({...matchData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 font-bold text-navy" />
            <input type="time" value={matchData.time} onChange={e => setMatchData({...matchData, time: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 font-bold text-navy" />
          </div>
          <button onClick={handleCreateNewMatch} disabled={isSavingMatch} className="w-full h-16 bg-navy text-white rounded-2xl font-black uppercase shadow-lg">
            {isSavingMatch ? "Salvando..." : "PUBLICAR PELADA"}
          </button>
        </div>

        <button onClick={handleGenerateTeams} disabled={isGenerating} className="w-full h-18 bg-primary text-white rounded-3xl font-black uppercase shadow-2xl">
          {isGenerating ? "IA EQUILIBRANDO..." : "SORTEAR TIMES IA"}
        </button>

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

const TeamResultCard: React.FC<TeamResultCardProps> = ({ title, color, players, allPlayers }) => (
  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
    <div className={`px-8 py-5 flex justify-between items-center ${color === 'primary' ? 'bg-primary text-white' : 'bg-navy text-white'}`}>
       <h4 className="font-black uppercase italic text-sm">{title}</h4>
       <span className="text-[10px] font-black opacity-60">{players.length} Atletas</span>
    </div>
    <div className="p-8 space-y-5">
       {players.map((pName) => {
         const p = allPlayers.find(x => x.name === pName);
         return (
           <div key={pName} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden border">
                 <img src={p?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(pName)}`} className="w-full h-full object-cover" />
              </div>
              <div>
                 <h5 className="text-xs font-black text-navy uppercase italic">{pName}</h5>
                 <p className="text-[9px] font-bold text-slate-300 uppercase">{p?.position || 'Atleta'}</p>
              </div>
           </div>
         );
       })}
    </div>
  </div>
);

export default CreateMatch;
