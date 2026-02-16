
import React, { useState } from 'react';
import { Page, Match } from '../types.ts';
import { db, addDoc, collection } from '../services/firebase.ts';

interface CreateMatchProps {
  onPageChange: (page: Page) => void;
}

const CreateMatch: React.FC<CreateMatchProps> = ({ onPageChange }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [matchData, setMatchData] = useState({
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    price: 35,
    fieldSlots: 30,
    gkSlots: 4
  });

  const handleCreate = async () => {
    if (!matchData.location.trim()) return alert("Insira o local.");
    setIsSaving(true);
    try {
      await addDoc(collection(db, "matches"), {
        ...matchData,
        type: 'Society',
        confirmedPlayers: 0,
        createdAt: new Date().toISOString()
      });
      alert("Convocação disparada!");
      onPageChange(Page.Dashboard);
    } catch (err) {
      alert("Falha ao criar partida.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-10 flex items-center gap-4">
        <button onClick={() => onPageChange(Page.Dashboard)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-navy shadow-sm">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-black text-navy uppercase italic tracking-tighter">AGENDAR ARENA</h2>
      </header>

      <main className="space-y-8 pb-40">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-elite space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">LOCAL DA PELADA</label>
            <input 
              type="text" 
              placeholder="Ex: Arena Ousadia" 
              value={matchData.location}
              onChange={e => setMatchData({...matchData, location: e.target.value})}
              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-navy outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">DATA</label>
               <input type="date" value={matchData.date} onChange={e => setMatchData({...matchData, date: e.target.value})} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 font-bold text-navy outline-none" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">HORA</label>
               <input type="time" value={matchData.time} onChange={e => setMatchData({...matchData, time: e.target.value})} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 font-bold text-navy outline-none" />
            </div>
          </div>

          <button 
            onClick={handleCreate}
            disabled={isSaving}
            className="w-full h-18 bg-primary text-white rounded-[1.75rem] font-black uppercase text-[11px] tracking-widest shadow-glow-red active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {isSaving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "ABRIR LISTA"}
          </button>
        </div>
        
        <div className="mesh-gradient-champions rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl group cursor-pointer" onClick={() => onPageChange(Page.TeamBalancing)}>
           <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-condensed italic uppercase leading-tight">DIVISÃO DE TIMES IA</h3>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60">EQUILIBRE OS CONVOCADOS USANDO IA</p>
           </div>
           <span className="material-symbols-outlined absolute right-8 top-1/2 -translate-y-1/2 text-4xl opacity-20">bolt</span>
        </div>
      </main>
    </div>
  );
};

export default CreateMatch;
