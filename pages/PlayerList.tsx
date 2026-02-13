
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
      alert(`⚔️ ESCALAÇÃO DEFINIDA PELA IA ⚔️\n\n🔴 TIME VERMELHO:\n${teams.teamRed.join('\n')}\n\n🔵 TIME AZUL:\n${teams.teamBlue.join('\n')}\n\nBoa sorte, guerreiros!`);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsBalancing(false); 
    }
  };

  return (
    <div className="p-6 pb-32 animate-in fade-in slide-in-from-right duration-700 min-h-full">
      <header className="flex flex-col mb-10 pt-4">
        <div className="flex justify-between items-end mb-1">
          <h2 className="text-4xl font-black italic tracking-tighter text-navy-deep leading-none">CONVOCAÇÃO</h2>
          <span className="px-3 py-1 bg-primary/10 rounded-lg text-[10px] font-black text-primary uppercase tracking-widest">
            {players.filter(p => p.status === 'presente').length} Confirmados
          </span>
        </div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Lista de Atletas Ativos</p>
      </header>

      {/* Botões de Ação Superior */}
      <div className="flex flex-col gap-4 mb-10">
        <button 
          onClick={handleShuffle} 
          disabled={isBalancing}
          className="relative overflow-hidden group w-full h-24 bg-navy-deep rounded-apple shadow-2xl transition-all active:scale-[0.98] disabled:opacity-70"
        >
          <div className="absolute inset-0 bg-croatia opacity-5 group-hover:opacity-10 transition-opacity"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          
          <div className="relative z-10 flex items-center justify-between px-8">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span className="text-primary text-[10px] font-black uppercase tracking-widest">Gemini Engine</span>
              </div>
              <span className="text-white text-xl font-black tracking-tighter italic">ESCALAR COM IA</span>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isBalancing ? 'bg-white/5 animate-spin' : 'bg-primary shadow-lg shadow-primary/20 hover:scale-110'}`}>
              <span className="material-symbols-outlined text-white text-3xl">{isBalancing ? 'sync' : 'auto_awesome'}</span>
            </div>
          </div>
        </button>

        <button 
          onClick={togglePresence} 
          disabled={isUpdating}
          className={`w-full h-16 rounded-apple border-2 flex items-center justify-center gap-3 transition-all active:scale-[0.98] font-black uppercase tracking-widest text-xs ${isUpdating ? 'bg-slate-50 border-slate-100 opacity-50' : 'bg-white border-slate-100 text-navy-deep hover:bg-slate-50'}`}
        >
          {isUpdating ? (
            <span className="material-symbols-outlined animate-spin">sync</span>
          ) : (
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${players.find(x => x.id === currentUser?.uid)?.status === 'presente' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
              <span className="material-symbols-outlined text-[14px]">check</span>
            </div>
          )}
          {players.find(x => x.id === currentUser?.uid)?.status === 'presente' ? 'Retirar Minha Presença' : 'Confirmar Minha Presença'}
        </button>
      </div>

      {/* Grid de Jogadores */}
      <div className="grid grid-cols-1 gap-3">
        {players.map((p, idx) => (
          <div 
            key={p.id} 
            className={`flex items-center gap-4 p-4 bg-white rounded-2xl border transition-all duration-300 ${p.status === 'presente' ? 'border-primary/20 shadow-md ring-1 ring-primary/5' : 'border-slate-100 opacity-60'}`}
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <div className="relative">
              <img src={p.photoUrl} className={`w-16 h-16 rounded-2xl object-cover border-2 ${p.status === 'presente' ? 'border-primary' : 'border-slate-50'}`} alt={p.name} />
              {p.status === 'presente' && (
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-[12px] text-white font-black">done_all</span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <p className="font-black text-navy-deep text-base leading-none mb-1 group-hover:text-primary transition-colors">{p.name}</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${p.status === 'presente' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                  {p.position}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  {p.status === 'presente' ? 'Relacionado' : 'Ausente'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
               <span className="text-2xl font-condensed text-navy-deep leading-none">{p.goals}</span>
               <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Gols</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
