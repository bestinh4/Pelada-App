
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
    <div className="flex flex-col">
      <header className="px-6 pt-10 pb-6 glass-header sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-primary rounded-full"></div>
          <h2 className="text-base font-black text-navy uppercase italic tracking-tighter">AGENDAR JOGO</h2>
        </div>
      </header>

      <main className="px-5 mt-8 space-y-6">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-elite space-y-5">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest px-1">LOCAL</label>
            <input 
              type="text" 
              placeholder="Ex: Arena Pro Elite" 
              value={matchData.location}
              onChange={e => setMatchData({...matchData, location: e.target.value})}
              className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-navy outline-none focus:ring-1 focus:ring-primary/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
               <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest px-1">DATA</label>
               <input type="date" value={matchData.date} onChange={e => setMatchData({...matchData, date: e.target.value})} className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-3 font-bold text-navy" />
            </div>
            <div className="space-y-1.5">
               <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest px-1">HORA</label>
               <input type="time" value={matchData.time} onChange={e => setMatchData({...matchData, time: e.target.value})} className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-3 font-bold text-navy" />
            </div>
          </div>

          <button 
            onClick={handleCreateNewMatch}
            disabled={isSavingMatch}
            className="w-full h-14 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
          >
            {isSavingMatch ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "PUBLICAR NA ARENA"}
          </button>
        </div>

        <div className="bg-navy rounded-[2rem] p-7 text-white relative overflow-hidden group shadow-2xl">
           <div className="relative z-10">
              <span className="text-[7px] font-black uppercase tracking-widest opacity-40 mb-1 block">TÁTICA AVANÇADA</span>
              <h3 className="text-xl font-condensed italic uppercase leading-tight mb-6">DIVIDIR TIMES COM INTELIGÊNCIA ARTICIAL</h3>
              <button 
                onClick={() => onPageChange(Page.TeamBalancing)}
                className="w-full h-14 bg-white text-navy rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
              >
                ABRIR SALA TÁTICA
                <span className="material-symbols-outlined text-lg">bolt</span>
              </button>
           </div>
        </div>
      </main>

      {/* PURE ELITE SUCCESS MODAL - REFINED SCALE */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[320px] rounded-[2.5rem] p-8 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-primary/20">
              <span className="material-symbols-outlined text-3xl font-bold">check</span>
            </div>
            <h3 className="text-xl font-black text-navy uppercase italic tracking-tighter mb-1.5">FECHADO!</h3>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-6 leading-relaxed">A convocação oficial foi disparada para toda a elite.</p>
            
            <div className="bg-slate-50 rounded-2xl p-4 mb-8 text-left space-y-2 border border-slate-100/50">
               <div className="flex justify-between items-center">
                  <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">LOCAL</span>
                  <span className="text-[9px] font-black text-navy uppercase italic truncate ml-2">{lastCreatedMatch?.location}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">AGENDA</span>
                  <span className="text-[9px] font-black text-navy uppercase italic">
                    {new Date(lastCreatedMatch?.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {lastCreatedMatch?.time}H
                  </span>
               </div>
            </div>

            <button 
              onClick={() => onPageChange(Page.Dashboard)}
              className="w-full h-14 bg-navy text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
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
