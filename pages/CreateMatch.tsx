
import React, { useState } from 'react';
import { Page, Match } from '../types.ts';
import { db, addDoc, collection } from '../services/firebase.ts';
import { broadcastNotification } from '../services/notificationService.ts';

interface CreateMatchProps {
  onPageChange: (page: Page) => void;
}

const CreateMatch: React.FC<CreateMatchProps> = ({ onPageChange }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [matchData, setMatchData] = useState({
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: '07:00',
    price: 10,
    fieldSlots: 30,
    gkSlots: 5
  });

  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const handleCreate = async () => {
    if (!matchData.location.trim()) return alert("Insira o local.");
    setIsSaving(true);
    try {
      await addDoc(collection(db, "matches"), {
        ...matchData,
        type: 'Mini-Campo',
        confirmedPlayers: 0,
        createdAt: new Date().toISOString()
      });
      
      // Notificar todos os jogadores sobre a nova convocação
      await broadcastNotification(
        "⚽ NOVA CONVOCAÇÃO!", 
        `O racha na ${matchData.location.toUpperCase()} está aberto! Confirme sua presença.`
      );

      onPageChange(Page.Dashboard);
    } catch (err) { alert("Falha ao criar."); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-12 flex items-center gap-6">
        <button onClick={() => onPageChange(Page.Dashboard)} className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-navy shadow-soft-white">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-navy uppercase italic tracking-tighter leading-none">NOVO RACHA</h2>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">ABRIR CONVOCAÇÃO</p>
        </div>
      </header>

      <main className="space-y-10 pb-48">
        <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-elite space-y-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 opacity-[0.08] pointer-events-none rotate-12">
              <img src={mainLogoUrl} className="w-full h-full grayscale" />
          </div>

          <div className="space-y-4 relative z-10">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">LOCAL DO ESTÁDIO</label>
            <input type="text" placeholder="Ex: Arena Ousadia" value={matchData.location} onChange={e => setMatchData({...matchData, location: e.target.value})} className="w-full h-18 bg-slate-50 border border-slate-100 rounded-2xl px-8 font-black text-navy text-lg focus:border-navy outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">DATA DO JOGO</label>
               <input type="date" value={matchData.date} onChange={e => setMatchData({...matchData, date: e.target.value})} className="w-full h-18 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-black text-navy outline-none" />
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">HORÁRIO</label>
               <input type="time" value={matchData.time} onChange={e => setMatchData({...matchData, time: e.target.value})} className="w-full h-18 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-black text-navy outline-none" />
            </div>
          </div>

          <button 
            onClick={handleCreate}
            disabled={isSaving}
            className="w-full h-22 bg-navy text-white rounded-[2.5rem] font-black uppercase text-[12px] tracking-widest shadow-elite active:scale-95 transition-all flex items-center justify-center gap-4 mt-6"
          >
            {isSaving ? <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div> : (
              <><span className="material-symbols-outlined">send</span> DISPARAR CONVOCAÇÃO</>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default CreateMatch;
