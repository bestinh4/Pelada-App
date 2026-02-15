
import React, { useState } from 'react';
import { Page, Player, Match } from '../types.ts';
import { db, addDoc, collection } from '../services/firebase.ts';
import { sendPushNotification } from '../services/notificationService.ts';

interface CreateMatchProps {
  players: Player[];
  currentUser: any;
  onPageChange: (page: Page) => void;
}

const CreateMatch: React.FC<CreateMatchProps> = ({ players, currentUser, onPageChange }) => {
  const [isSavingMatch, setIsSavingMatch] = useState(false);
  
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

  const confirmedPlayersCount = players.filter(p => p.status === 'presente').length;

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
        confirmedPlayers: confirmedPlayersCount,
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

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-32">
      <header className="px-6 pt-12 pb-6 glass sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter">GESTÃO DA ARENA</h2>
        </div>
      </header>

      <section className="px-6 mt-8 space-y-10">
        {/* Card de Configuração */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">stadium</span>
            <h3 className="text-xs font-black uppercase tracking-widest text-navy">AGENDAR NOVA PELADA</h3>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">LOCAL DO JOGO</label>
            <input 
              type="text" 
              placeholder="Ex: Arena Pro" 
              value={matchData.location}
              onChange={e => setMatchData({...matchData, location: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 font-bold text-navy outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
            className="w-full h-18 bg-navy text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {isSavingMatch ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "PUBLICAR AGENDAMENTO"}
          </button>
        </div>

        {/* ACESSO AO SORTEIO IA */}
        <div className="bg-navy-deep rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/40 transition-all"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary fill-1">bolt</span>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">BALANCEAMENTO INTELIGENTE</span>
              </div>
              <h3 className="text-3xl font-condensed italic leading-none mb-6 uppercase tracking-tighter">SORTEAR TIMES COM IA</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase mb-8 leading-relaxed">
                Utilize a tecnologia Gemini 3 para criar times equilibrados baseados nas habilidades e posições dos atletas confirmados.
              </p>
              <button 
                onClick={() => onPageChange(Page.TeamBalancing)}
                className="w-full h-18 bg-white text-navy rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl"
              >
                ACESSAR SALA TÁTICA
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
           </div>
        </div>
      </section>
    </div>
  );
};

export default CreateMatch;
