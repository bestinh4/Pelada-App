
import React, { useState } from 'react';
import { Player, Page, Match } from '../types.ts';
import { MASTER_ADMIN_EMAIL } from '../constants.tsx';
import { db, doc, updateDoc, deleteDoc } from '../services/firebase.ts';

interface PlayerListProps {
  players: Player[];
  currentUser: any;
  match: Match | null;
  onPageChange: (page: Page) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentUser, match, onPageChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState<Player | null>(null);
  const [statsData, setStatsData] = useState({ goals: 0, assists: 0, concededGoals: 0 });
  const [isSavingStats, setIsSavingStats] = useState(false);

  const adminUser = players.find(p => p.id === currentUser?.uid);
  const isCurrentUserAdmin = adminUser?.role === 'admin' || currentUser?.email === MASTER_ADMIN_EMAIL;

  const handleOpenStats = (player: Player) => {
    setSelectedPlayerForStats(player);
    setStatsData({ goals: player.goals || 0, assists: player.assists || 0, concededGoals: player.concededGoals || 0 });
  };

  const handleSaveStats = async () => {
    if (!selectedPlayerForStats || isSavingStats) return;
    setIsSavingStats(true);
    try {
      await updateDoc(doc(db, "players", selectedPlayerForStats.id), {
        goals: Number(statsData.goals),
        assists: Number(statsData.assists),
        concededGoals: Number(statsData.concededGoals)
      });
      setSelectedPlayerForStats(null);
    } catch (e) { alert("Falha na atualização."); } finally { setIsSavingStats(false); }
  };

  const handleDeletePlayer = async (player: Player) => {
    if (!isCurrentUserAdmin || isDeletingId || player.id === currentUser?.uid) return;
    if (!confirm(`Remover ${player.name}?`)) return;
    setIsDeletingId(player.id);
    try { await deleteDoc(doc(db, "players", player.id)); } catch (e) { alert("Erro."); } finally { setIsDeletingId(null); }
  };

  const filtered = players.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const confirmed = filtered.filter(p => p.status === 'presente');
  const missing = filtered.filter(p => p.status !== 'presente');

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="px-6 pt-10 pb-6 glass-header sticky top-0 z-40">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-base font-black text-navy uppercase italic tracking-tighter">CONVOCAÇÃO</h2>
           <div className="px-2.5 py-1 bg-navy text-white rounded-lg text-[8px] font-black uppercase tracking-widest">
              {confirmed.length} ATLETAS
           </div>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-lg">search</span>
          <input 
            type="text" 
            placeholder="Buscar craque..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 text-xs font-bold text-navy outline-none focus:ring-1 focus:ring-primary/20" 
          />
        </div>
      </header>

      <main className="px-5 mt-8 space-y-10">
        <Section title="CONFIRMADOS" list={confirmed} isAdmin={isCurrentUserAdmin} onEdit={handleOpenStats} onDelete={handleDeletePlayer} isDeletingId={isDeletingId} currentUser={currentUser} type="confirmed" />
        <Section title="LISTA DE ESPERA" list={missing} isAdmin={isCurrentUserAdmin} onEdit={handleOpenStats} onDelete={handleDeletePlayer} isDeletingId={isDeletingId} currentUser={currentUser} type="missing" />
      </main>

      {/* MODAL STATS - CORRECTED SCALE */}
      {selectedPlayerForStats && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fade-in">
           <div className="w-full max-w-[340px] bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-6 bg-navy text-white flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <img src={selectedPlayerForStats.photoUrl} className="w-10 h-10 rounded-lg object-cover border border-white/20" alt="" />
                    <h3 className="text-xs font-black uppercase italic">{selectedPlayerForStats.name}</h3>
                 </div>
                 <button onClick={() => setSelectedPlayerForStats(null)} className="material-symbols-outlined text-white/40">close</button>
              </div>
              <div className="p-6 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">GOLS</label>
                       <input type="number" value={statsData.goals} onChange={e => setStatsData({...statsData, goals: Number(e.target.value)})} className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100 font-black text-navy text-center" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">ASSISTS</label>
                       <input type="number" value={statsData.assists} onChange={e => setStatsData({...statsData, assists: Number(e.target.value)})} className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100 font-black text-navy text-center" />
                    </div>
                 </div>
                 <button onClick={handleSaveStats} disabled={isSavingStats} className="w-full h-14 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">
                    ATUALIZAR STATS
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, list, isAdmin, onEdit, onDelete, isDeletingId, currentUser, type }: any) => (
  <section>
    <div className="flex items-center gap-2 mb-4 px-1">
       <div className={`w-1 h-4 ${type === 'confirmed' ? 'bg-success' : 'bg-slate-200'} rounded-full`}></div>
       <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-navy italic">{title}</h3>
    </div>
    <div className="grid grid-cols-1 gap-2">
      {list.map((p: Player, i: number) => (
        <div key={p.id} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-elite flex items-center justify-between group animate-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 30}ms` }}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl overflow-hidden border-2 ${p.role === 'admin' ? 'border-primary/20' : 'border-slate-50'}`}>
              <img src={p.photoUrl} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-navy uppercase italic leading-none mb-0.5">{p.name}</h4>
              <div className="flex items-center gap-1.5">
                <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">{p.position}</span>
                {p.role === 'admin' && <span className="w-1 h-1 bg-primary rounded-full"></span>}
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-1.5">
               <button onClick={() => onEdit(p)} className="w-8 h-8 rounded-lg bg-slate-50 text-navy flex items-center justify-center border border-slate-100"><span className="material-symbols-outlined text-base">edit</span></button>
               {p.id !== currentUser?.uid && (
                <button onClick={() => onDelete(p)} disabled={isDeletingId === p.id} className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center border border-red-100"><span className="material-symbols-outlined text-base">delete</span></button>
               )}
            </div>
          )}
        </div>
      ))}
    </div>
  </section>
);

export default PlayerList;
