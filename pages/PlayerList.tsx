
import React, { useState, useMemo } from 'react';
import { Player, Page, Match } from '../types.ts';
import { MASTER_ADMIN_EMAIL } from '../constants.tsx';
import { db, doc, updateDoc, deleteDoc, addDoc, collection } from '../services/firebase.ts';

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

  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

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
    if (!isCurrentUserAdmin || isDeletingId || player.id === currentUser?.uid || player.email === MASTER_ADMIN_EMAIL) return;
    if (!confirm(`⚠️ Remover ${player.name} permanentemente?`)) return;
    setIsDeletingId(player.id);
    try { await deleteDoc(doc(db, "players", player.id)); } catch (e) { alert("Erro ao deletar."); } finally { setIsDeletingId(null); }
  };

  const filtered = players.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const confirmed = filtered.filter(p => p.status === 'presente');
  const missing = filtered.filter(p => p.status !== 'presente');

  return (
    <div className="flex flex-col pb-40 animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-8 glass sticky top-0 z-50">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <img src={mainLogoUrl} className="w-10 h-10 object-contain" alt="Logo" />
              <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter">CONVOCAÇÃO ELITE</h2>
           </div>
           <div className="px-3 py-1 bg-navy text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
              {confirmed.length} ATLETAS
           </div>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">search</span>
          <input 
            type="text" 
            placeholder="Buscar por nome ou posição..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 bg-slate-100 border-none rounded-2xl pl-14 pr-6 text-xs font-bold text-navy outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
          />
        </div>
      </header>

      <main className="px-6 mt-10 space-y-12">
        <Section title="PRESENTES NA ARENA" list={confirmed} isAdmin={isCurrentUserAdmin} onEdit={handleOpenStats} onDelete={handleDeletePlayer} isDeletingId={isDeletingId} currentUser={currentUser} type="confirmed" />
        <Section title="AGUARDANDO CONVOCAÇÃO" list={missing} isAdmin={isCurrentUserAdmin} onEdit={handleOpenStats} onDelete={handleDeletePlayer} isDeletingId={isDeletingId} currentUser={currentUser} type="missing" />
      </main>

      {/* MODAL STATS ELITE */}
      {selectedPlayerForStats && (
        <div className="fixed inset-0 bg-navy-deep/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade-in">
           <div className="w-full max-w-[420px] bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-scale-in">
              <div className="p-8 bg-navy text-white flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <img src={selectedPlayerForStats.photoUrl} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20" alt="" />
                    <div>
                      <h3 className="text-sm font-black uppercase italic leading-none mb-1">{selectedPlayerForStats.name}</h3>
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{selectedPlayerForStats.position}</span>
                    </div>
                 </div>
                 <button onClick={() => setSelectedPlayerForStats(null)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">⚽ GOLS</label>
                       <input type="number" value={statsData.goals} onChange={e => setStatsData({...statsData, goals: Number(e.target.value)})} className="w-full h-16 bg-slate-50 rounded-2xl border-none font-black text-navy text-2xl text-center" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">👟 ASSIST.</label>
                       <input type="number" value={statsData.assists} onChange={e => setStatsData({...statsData, assists: Number(e.target.value)})} className="w-full h-16 bg-slate-50 rounded-2xl border-none font-black text-navy text-2xl text-center" />
                    </div>
                 </div>
                 <div className="space-y-2 p-6 rounded-[2rem] bg-amber-50 border border-amber-100">
                    <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-1">🧤 GOLS SOFRIDOS (Goleiro)</label>
                    <input type="number" value={statsData.concededGoals} onChange={e => setStatsData({...statsData, concededGoals: Number(e.target.value)})} className="w-full h-14 bg-transparent border-none font-black text-navy text-4xl text-center outline-none" />
                 </div>
                 <button onClick={handleSaveStats} disabled={isSavingStats} className="w-full h-20 bg-primary text-white rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all">
                    {isSavingStats ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : 'SALVAR ESTATÍSTICAS'}
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
    <div className="flex items-center gap-3 mb-8 px-2">
       <div className={`w-2 h-6 ${type === 'confirmed' ? 'bg-emerald-500' : 'bg-slate-300'} rounded-full`}></div>
       <h3 className="text-xs font-black uppercase tracking-[0.3em] text-navy italic">{title}</h3>
    </div>
    <div className="grid grid-cols-1 gap-4">
      {list.map((p: Player, i: number) => {
        const isMaster = p.email === MASTER_ADMIN_EMAIL;
        return (
          <div key={p.id} className="bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-pro flex items-center gap-5 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className={`w-18 h-18 rounded-[1.75rem] overflow-hidden border-2 transition-all ${p.role === 'admin' ? 'border-primary shadow-[0_0_15px_rgba(237,29,35,0.2)]' : 'border-slate-50'}`}>
              <img 
                src={p.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=003876&color=fff`} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
                alt={p.name} 
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=003876&color=fff`; }}
              />
            </div>
            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-navy uppercase italic tracking-tight text-[15px] leading-none mb-2">{p.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{p.position}</span>
                      {p.role === 'admin' && <span className="text-[8px] font-black uppercase text-primary tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[10px] fill-1">verified</span> ADM</span>}
                    </div>
                  </div>
                  {isAdmin && !isMaster && (
                    <div className="flex gap-2">
                       <button onClick={() => onEdit(p)} className="w-10 h-10 rounded-xl bg-slate-50 text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-all"><span className="material-symbols-outlined text-lg">edit</span></button>
                       {p.id !== currentUser.uid && (
                        <button onClick={() => onDelete(p)} disabled={isDeletingId === p.id} className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"><span className="material-symbols-outlined text-lg">delete</span></button>
                       )}
                    </div>
                  )}
               </div>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

export default PlayerList;
