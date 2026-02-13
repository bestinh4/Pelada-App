
import React, { useState } from 'https://esm.sh/react@18.2.0';
import { Player } from '../types.ts';
import { balanceTeams } from '../services/geminiService.ts';
import { db, doc, updateDoc } from '../services/firebase.ts';

const PlayerList: React.FC<{ players: Player[], currentUser: any }> = ({ players, currentUser }) => {
  const [isBalancing, setIsBalancing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const togglePresence = async () => {
    if (!currentUser) return;
    setIsUpdating(true);
    try {
      const p = players.find(x => x.id === currentUser.uid);
      const nextStatus = p?.status === 'presente' ? 'pendente' : 'presente';
      await updateDoc(doc(db, "players", currentUser.uid), { status: nextStatus });
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsUpdating(false); 
    }
  };

  const handleShuffle = async () => {
    const present = players.filter(p => p.status === 'presente');
    if (present.length < 2) return alert("Selecione pelo menos 2 guerreiros!");
    setIsBalancing(true);
    try {
      const teams = await balanceTeams(present);
      // Aqui poderíamos abrir um modal bonito, mas vamos manter o alert por enquanto para segurança
      alert(`⚔️ CONVOCAÇÃO ELITE ⚔️\n\n🔴 TIME VERMELHO: ${teams.teamRed.join(', ')}\n\n🔵 TIME AZUL: ${teams.teamBlue.join(', ')}`);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsBalancing(false); 
    }
  };

  return (
    <div className="p-6 pb-32 animate-in fade-in duration-500 min-h-full">
      <header className="flex flex-col mb-8 pt-4">
        <h2 className="text-4xl font-black italic tracking-tighter text-navy-deep mb-1">CONVOCAÇÃO</h2>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Gestão de Atletas</p>
      </header>

      <div className="grid grid-cols-1 gap-4 mb-8">
        <button 
          onClick={handleShuffle} 
          disabled={isBalancing}
          className="relative overflow-hidden group w-full h-24 bg-navy-deep rounded-apple shadow-2xl transition-all active:scale-[0.98] disabled:opacity-70"
        >
          <div className="absolute inset-0 bg-croatia opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="relative z-10 flex items-center justify-between px-8">
            <div className="flex flex-col items-start">
              <span className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">AI Powered</span>
              <span className="text-white text-lg font-black tracking-tight">EQUILIBRAR TIMES</span>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg ${isBalancing ? 'animate-spin' : ''}`}>
              <span className="material-symbols-outlined text-white">{isBalancing ? 'sync' : 'bolt'}</span>
            </div>
          </div>
        </button>

        <button 
          onClick={togglePresence} 
          disabled={isUpdating}
          className={`w-full h-16 rounded-apple border-2 flex items-center justify-center gap-3 transition-all active:scale-[0.98] font-black uppercase tracking-widest text-xs ${isUpdating ? 'opacity-50' : 'hover:bg-slate-50'}`}
        >
          <span className="material-symbols-outlined text-xl">{isUpdating ? 'hourglass_top' : 'how_to_reg'}</span>
          Confirmar Minha Presença
        </button>
      </div>

      <div className="space-y-3">
        {players.map((p, idx) => (
          <div 
            key={p.id} 
            className={`flex items-center gap-4 p-3 bg-white rounded-2xl border transition-all animate-in slide-in-from-right duration-500 ${p.status === 'presente' ? 'border-primary/30 shadow-md ring-1 ring-primary/5' : 'border-slate-100 opacity-60'}`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="relative">
              <img src={p.photoUrl} className="w-14 h-14 rounded-2xl object-cover" alt={p.name} />
              {p.status === 'presente' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[10px] text-white font-bold">check</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-black text-navy-deep text-sm leading-tight mb-0.5">{p.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-primary font-black uppercase tracking-widest">{p.position}</span>
                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  {p.status === 'presente' ? 'Escalado' : 'Aguardando'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
