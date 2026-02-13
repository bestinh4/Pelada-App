
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
    } catch (e) { console.error(e); } finally { setIsUpdating(false); }
  };

  const handleShuffle = async () => {
    const present = players.filter(p => p.status === 'presente');
    if (present.length < 2) return alert("Mínimo de 2 jogadores!");
    setIsBalancing(true);
    try {
      const teams = await balanceTeams(present);
      alert(`Times Gerados:\nVermelho: ${teams.teamRed.join(', ')}\nAzul: ${teams.teamBlue.join(', ')}`);
    } catch (e) { console.error(e); } finally { setIsBalancing(false); }
  };

  return (
    <div className="p-8 pb-32 animate-in slide-in-from-right duration-500">
      <header className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black tracking-tighter">Convocação</h2>
        <button onClick={togglePresence} disabled={isUpdating} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${isUpdating ? 'animate-spin' : ''}`}>
          <span className="material-symbols-outlined">check</span>
        </button>
      </header>

      <button onClick={handleShuffle} disabled={isBalancing} className="w-full h-20 bg-navy-deep text-white rounded-3xl font-black uppercase flex items-center justify-center gap-3 active:scale-95 shadow-xl transition-all">
        <span className="material-symbols-outlined">auto_awesome</span>
        {isBalancing ? 'Analisando...' : 'Escalar com IA'}
      </button>

      <div className="mt-10 space-y-4">
        {players.map(p => (
          <div key={p.id} className={`flex items-center gap-4 p-4 bg-white rounded-2xl border ${p.status === 'presente' ? 'border-primary' : 'opacity-40 grayscale border-slate-50'}`}>
            <img src={p.photoUrl} className="w-12 h-12 rounded-xl object-cover" />
            <div className="flex-1">
              <p className="font-black text-navy-deep">{p.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{p.position}</p>
            </div>
            {p.status === 'presente' && <span className="material-symbols-outlined text-primary">check_circle</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
