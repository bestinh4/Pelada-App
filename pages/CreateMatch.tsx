
import React, { useState } from 'https://esm.sh/react@18.2.0';
import { db, collection, addDoc } from '../services/firebase.ts';

const CreateMatch: React.FC<{ onMatchCreated: () => void }> = ({ onMatchCreated }) => {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if(!name) return alert("Preencha o nome!");
    setIsCreating(true);
    try {
      await addDoc(collection(db, "matches"), {
        name,
        date: new Date().toLocaleDateString(),
        confirmedPlayers: 0,
        totalSlots: 24,
        type: 'Society'
      });
      onMatchCreated();
    } catch(e) { console.error(e); } finally { setIsCreating(false); }
  };

  return (
    <div className="p-8 animate-in zoom-in-95 duration-500">
      <h2 className="text-3xl font-black tracking-tighter mb-10">Novo Jogo</h2>
      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Nome da Arena</label>
          <input className="w-full h-16 rounded-2xl border-slate-100 bg-white px-6 font-black text-navy-deep outline-none focus:ring-2 focus:ring-primary/20" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Final de Quarta" />
        </div>
        <button onClick={handleCreate} disabled={isCreating} className="w-full h-20 bg-primary text-white rounded-3xl font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-primary/20">
          {isCreating ? 'Criando...' : 'Marcar Pelada'}
        </button>
      </div>
    </div>
  );
};

export default CreateMatch;
