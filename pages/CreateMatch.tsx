
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastCreatedMatch, setLastCreatedMatch] = useState<any>(null);
  
  const currentPlayer = players.find(p => p.id === currentUser?.uid);
  const isAdmin = currentPlayer?.role === 'admin';

  const [matchData, setMatchData] = useState({
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    price: 35,
    fieldSlots: 30,
    gkSlots: 4
  });

  const handleCreateNewMatch = async () => {
    if (!matchData.location.trim()) {
      alert("Defina o local.");
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
        confirmedPlayers: 0,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "matches"), newMatch);
      sendPushNotification("🔥 CONVOCAÇÃO ELITE!", `Nova pelada em ${newMatch.location}. Confirme agora!`);
      
      setLastCreatedMatch(newMatch);
      setShowSuccessModal(true);
    } catch (err) {
      alert("Erro ao salvar.");
    } finally {
      setIsSavingMatch(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-8 pt-12 pb-6 glass-header sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter">GESTÃO DA ARENA</h2>
        </div>
      </header>

      <main className="px-6 mt-8 space-y-8">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-elite space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">LOCAL DA BATALHA</label>
            <input 
              type="text" 
              placeholder="Ex: Arena Elite Pro" 
              value={matchData.location}
              onChange={e => setMatchData({...matchData, location: e.target.value})}
              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-navy focus:ring-2 focus:ring-primary/10 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">DATA</label>
               <input type="date" value={matchData.date} onChange={e => setMatchData({...matchData, date: e.target.value})} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl px-3 font-bold text-navy" />
            </div>
            <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">HORÁRIO</label>
               <input type="time" value={matchData.time} onChange={e => setMatchData({...matchData, time: e.target.value})} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl px-3 font-bold text-navy" />
            </div>
          </div>

          <button 
            onClick={handleCreateNewMatch}
            disabled={isSavingMatch}
            className="w-full h-18 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-button flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            {isSavingMatch ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "AGENDAR PARTIDA"}
          </button>
        </div>

        {/* AI TEAM DRAWER ACCESS */}
        <div className="bg-navy rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
           <div className="relative z-10">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-2 block">SALA TÁTICA</span>
              <h3 className="text-2xl font-condensed italic uppercase leading-none mb-6">SORTEIO COM INTELIGÊNCIA ARTICIAL</h3>
              <button 
                onClick={() => onPageChange(Page.TeamBalancing)}
                className="w-full h-16 bg-white text-navy rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                ACESSAR SORTEIO IA
                <span className="material-symbols-outlined">bolt</span>
              </button>
           </div>
        </div>
      </main>

      {/* PURE ELITE SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[360px] rounded-[3rem] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-primary text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-button">
              <span className="material-symbols-outlined text-4xl font-bold">check</span>
            </div>
            <h3 className="text-2xl font-black text-navy uppercase italic tracking-tighter mb-2">SUCESSO TOTAL!</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">A convocação foi enviada para todos os atletas da elite.</p>
            
            <div className="bg-slate-50 rounded-2xl p-5 mb-10 text-left space-y-2 border border-slate-100">
               <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">LOCAL</span>
                  <span className="text-[11px] font-black text-navy uppercase italic">{lastCreatedMatch?.location}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">DATA</span>
                  <span className="text-[11px] font-black text-navy uppercase italic">
                    {new Date(lastCreatedMatch?.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {lastCreatedMatch?.time}H
                  </span>
               </div>
            </div>

            <button 
              onClick={() => onPageChange(Page.Dashboard)}
              className="w-full h-16 bg-navy text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all"
            >
              IR PARA ARENA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMatch;
