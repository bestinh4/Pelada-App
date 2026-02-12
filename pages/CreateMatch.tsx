
import React, { useState } from 'react';
import { Player } from '../types.ts';
import { db, collection, addDoc } from '../services/firebase.ts';

interface CreateMatchProps {
  onMatchCreated?: () => void;
}

const FormField = ({ label, icon, placeholder, value, onChange }: { label: string, icon: string, placeholder: string, value: string, onChange: (v: string) => void }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">{label}</label>
    <div className="relative flex items-center bg-white border border-slate-100 rounded-2xl px-4 h-14 shadow-sm group transition-all focus-within:border-primary/30 focus-within:ring-4 ring-primary/5">
      <span className="material-symbols-outlined text-[20px] text-slate-300 mr-3 group-focus-within:text-primary transition-colors">{icon}</span>
      <input 
        type="text" 
        className="flex-1 bg-transparent border-none focus:ring-0 text-navy-deep font-black text-sm p-0 placeholder-slate-200" 
        placeholder={placeholder} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

const CreateMatch: React.FC<CreateMatchProps> = ({ onMatchCreated }) => {
  const [matchName, setMatchName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('Elite Arena Pro');
  const [type, setType] = useState<'Futsal' | 'Society' | 'Campo'>('Society');
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCreate = async () => {
    if (!matchName || !date || !time) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsCreating(true);
    try {
      await addDoc(collection(db, "matches"), {
        name: matchName,
        location,
        date,
        time,
        type,
        price: 35.00,
        confirmedPlayers: 0,
        totalSlots: 24,
        createdAt: new Date().toISOString()
      });
      setShowSuccess(true);
    } catch (error) {
      console.error("Erro ao criar partida:", error);
      alert("Erro ao salvar no banco de dados.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col animate-in zoom-in-95 duration-500 relative min-h-full bg-background">
      <header className="flex items-center justify-between px-8 pt-12 pb-6 sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-slate-50/50">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-navy active:scale-90 transition-all">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="text-xl font-black text-navy-deep tracking-tight">Agendar Elite</h1>
        <div className="w-10"></div>
      </header>

      <main className="px-6 pb-24 pt-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_8px_rgba(237,29,35,0.4)]"></div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-primary">Configuração da Arena</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Agende o próximo confronto épico</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">Nome da Partida</label>
            <div className="relative flex items-center bg-white border border-slate-100 rounded-2xl px-4 h-16 shadow-sm group focus-within:ring-4 ring-primary/5 transition-all">
              <span className="material-symbols-outlined text-[24px] text-primary/40 mr-3 group-focus-within:text-primary transition-colors">edit_note</span>
              <input 
                type="text" 
                value={matchName}
                onChange={(e) => setMatchName(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 text-navy font-black text-lg p-0 placeholder-slate-200" 
                placeholder="Ex: Final da Copa O&A" 
              />
            </div>
          </div>

          <div className="p-1 bg-slate-100 rounded-xl flex">
            {['Futsal', 'Society', 'Campo'].map((t) => (
              <button 
                key={t} 
                onClick={() => setType(t as any)}
                className={`flex-1 py-2 rounded-lg text-center text-[10px] font-bold uppercase tracking-widest transition-all ${t === type ? 'bg-white text-navy shadow-sm' : 'text-slate-400 hover:text-navy/60'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Data" icon="calendar_today" placeholder="DD/MM/AAAA" value={date} onChange={setDate} />
            <FormField label="Horário" icon="schedule" placeholder="20:00" value={time} onChange={setTime} />
          </div>

          <FormField label="Localização" icon="location_on" placeholder="Elite Arena Pro" value={location} onChange={setLocation} />

          <button 
            onClick={handleCreate}
            disabled={isCreating}
            className="mt-8 w-full h-20 bg-primary text-white font-black rounded-[2rem] shadow-[0_12px_24px_rgba(237,29,35,0.4)] flex items-center justify-center gap-4 active:scale-95 transition-all group overflow-hidden relative disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div className="relative flex items-center gap-4">
              <span className="tracking-[0.2em] uppercase text-lg">{isCreating ? 'Criando...' : 'Confirmar Agenda'}</span>
              <span className="material-symbols-outlined text-3xl group-hover:translate-x-2 transition-transform">sports_score</span>
            </div>
          </button>
        </div>
      </main>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy-deep/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl p-10 flex flex-col items-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-[64px] text-green-500">check_circle</span>
            </div>
            <h3 className="text-3xl font-black text-navy-deep text-center mb-4 tracking-tighter leading-none">
              Arena <span className="text-primary italic">Confirmada!</span>
            </h3>
            <button 
              onClick={() => onMatchCreated?.()}
              className="w-full h-16 bg-navy-deep text-white font-black rounded-2xl tracking-[0.2em] uppercase text-xs active:scale-95 transition-all shadow-xl shadow-navy-deep/20"
            >
              Ir para Painel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMatch;
