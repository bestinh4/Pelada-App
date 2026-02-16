
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
  
  const [matchData, setMatchData] = useState({
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    price: 35,
    fieldSlots: 30,
    gkSlots: 4
  });

  const handleCreateNewMatch = async () => {
    if (!matchData.location.trim()) return alert("Defina o local.");
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
      sendPushNotification("🔥 CONVOCAÇÃO O&A!", `Nova pelada em ${newMatch.location}. Confirme agora!`);
      setLastCreatedMatch(newMatch);
      setShowSuccessModal(true);
    } catch (err) { alert("Erro ao salvar."); } finally { setIsSavingMatch(false); }
  };

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-10 flex flex-col gap-2">
        <h2 className="text-2xl font-black text-navy uppercase italic tracking-tighter leading-none">NOVO AGENDAMENTO</h2>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">GERENCIAR ARENA</p>
      </header>

      <main className="space-y-8 pb-40">
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-elite space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">ARENA / LOCAL</label>
            <input 
              type="text" 
              placeholder="Ex: Arena Ousadia" 
              value={matchData.location}
              onChange={e => setMatchData({...matchData, location: e.target.value})}
              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-navy outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">DATA</label>
               <input type="date" value={matchData.date} onChange={e => setMatchData({...matchData, date: e.target.value})} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 font-bold text-navy" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">HORA</label>
               <input type="time" value={matchData.time} onChange={e => setMatchData({...matchData, time: e.target.value})} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 font-bold text-navy" />
            </div>
          </div>

          <button 
            onClick={handleCreateNewMatch}
            disabled={isSavingMatch}
            className="w-full h-20 bg-primary text-white rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-glow-red active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {isSavingMatch ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "PUBLICAR CONVOCAÇÃO"}
          </button>
        </div>

        <div className="mesh-gradient-champions rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl group">
           <div className="relative z-10 space-y-6">
              <span className="text-[8px] font-black uppercase tracking-[0.5em] opacity-60">SALA TÁTICA IA</span>
              <h3 className="text-2xl font-condensed italic uppercase leading-tight">SORTEIO INTELIGENTE DE EQUIPES</h3>
              <button 
                onClick={() => onPageChange(Page.TeamBalancing)}
                className="w-full h-16 bg-white text-navy rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
              >
                DIVIDIR TIMES
                <span className="material-symbols-outlined">bolt</span>
              </button>
           </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-navy/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-[340px] rounded-[3rem] p-10 text-center shadow-2xl animate-slide-up">
            <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow-red">
              <span className="material-symbols-outlined text-4xl">check</span>
            </div>
            <h3 className="text-2xl font-black text-navy uppercase italic tracking-tighter mb-2">FECHADO!</h3>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-10 leading-relaxed">A convocação oficial foi disparada para o racha.</p>
            <button onClick={() => onPageChange(Page.Dashboard)} className="w-full h-18 bg-navy text-white rounded-2xl font-black uppercase text-[11px] tracking-widest">IR PARA ARENA</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMatch;
