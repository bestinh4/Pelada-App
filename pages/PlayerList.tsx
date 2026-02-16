
import React, { useState } from 'react';
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
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', position: 'Atacante', playerType: 'avulso' as const });
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState<Player | null>(null);
  const [statsData, setStatsData] = useState({ 
    goals: 0, 
    assists: 0, 
    role: 'player' as 'admin' | 'player',
    playerType: 'avulso' as 'mensalista' | 'avulso',
    status: 'presente' as 'presente' | 'pendente'
  });
  const [isSavingStats, setIsSavingStats] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const adminUser = players.find(p => p.id === currentUser?.uid);
  const isCurrentUserAdmin = adminUser?.role === 'admin' || currentUser?.email === MASTER_ADMIN_EMAIL;

  const filtered = players.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const confirmed = filtered.filter(p => p.status === 'presente');
  const pending = filtered.filter(p => p.status !== 'presente');

  const handleShareList = () => {
    const dateStr = match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : '--/--';
    let message = `🏆 *ELENCO O&A* 🇭🇷\n🗓️ *DATA:* ${dateStr}\n\n📢 *STATUS:* ${confirmed.length} CONFIRMADOS ✅`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-12 flex flex-col gap-10">
        <div className="flex items-center justify-between">
           <div className="space-y-1">
             <h2 className="text-3xl font-black text-navy uppercase italic tracking-tighter leading-none">ELENCO O&A</h2>
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">CONVOCAÇÃO ATUAL</p>
           </div>
           <div className="flex gap-4">
             <button onClick={handleShareList} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-soft-white active:scale-90 transition-all text-navy">
                <span className="material-symbols-outlined">share</span>
             </button>
             {isCurrentUserAdmin && (
                <button onClick={() => setIsAddingPlayer(true)} className="w-12 h-12 bg-navy text-white rounded-2xl flex items-center justify-center shadow-elite active:scale-90 transition-all">
                  <span className="material-symbols-outlined">person_add</span>
                </button>
             )}
           </div>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">search</span>
          <input 
            type="text" placeholder="Buscar atleta..." value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-16 bg-white border border-slate-100 rounded-2xl pl-14 pr-6 text-[15px] font-bold text-navy outline-none shadow-soft-white focus:border-navy transition-all" 
          />
        </div>
      </header>

      <main className="space-y-14 pb-48">
        <PlayerSection 
          title="CONFIRMADOS" 
          list={confirmed} 
          isAdmin={isCurrentUserAdmin} 
          onQuickToggle={async (p: Player) => {
            setProcessingId(p.id);
            await updateDoc(doc(db, "players", p.id), { status: 'pendente' });
            setProcessingId(null);
          }}
          onEdit={(p: Player) => {
            setSelectedPlayerForStats(p);
            setStatsData({ goals: p.goals, assists: p.assists, role: p.role as any, playerType: p.playerType, status: p.status });
          }} 
          onDelete={async (p: Player) => {
            if (confirm("Remover?")) await deleteDoc(doc(db, "players", p.id));
          }}
          processingId={processingId}
          type="confirmed"
        />

        <PlayerSection 
          title="EM ESPERA" 
          list={pending} 
          isAdmin={isCurrentUserAdmin} 
          onQuickToggle={async (p: Player) => {
            setProcessingId(p.id);
            await updateDoc(doc(db, "players", p.id), { status: 'presente' });
            setProcessingId(null);
          }}
          onEdit={(p: Player) => {
            setSelectedPlayerForStats(p);
            setStatsData({ goals: p.goals, assists: p.assists, role: p.role as any, playerType: p.playerType, status: p.status });
          }} 
          onDelete={async (p: Player) => {
            if (confirm("Remover?")) await deleteDoc(doc(db, "players", p.id));
          }}
          processingId={processingId}
          type="pending"
        />
      </main>

      {selectedPlayerForStats && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
           <div className="w-full max-w-[380px] bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-10 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <img src={selectedPlayerForStats.photoUrl} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" alt="" />
                    <h3 className="text-xl font-black text-navy uppercase italic tracking-tighter leading-none">{selectedPlayerForStats.name}</h3>
                 </div>
                 <button onClick={() => setSelectedPlayerForStats(null)} className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">GOLS</label>
                       <input type="number" value={statsData.goals} onChange={e => setStatsData({...statsData, goals: Number(e.target.value)})} className="w-full h-16 bg-slate-50 rounded-2xl border border-slate-100 font-black text-navy text-center text-2xl outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">ASSISTS</label>
                       <input type="number" value={statsData.assists} onChange={e => setStatsData({...statsData, assists: Number(e.target.value)})} className="w-full h-16 bg-slate-50 rounded-2xl border border-slate-100 font-black text-navy text-center text-2xl outline-none focus:border-primary" />
                    </div>
                 </div>
                 
                 <button 
                  onClick={async () => {
                    setIsSavingStats(true);
                    await updateDoc(doc(db, "players", selectedPlayerForStats.id), statsData);
                    setIsSavingStats(false);
                    setSelectedPlayerForStats(null);
                  }}
                  className="w-full h-20 bg-navy text-white rounded-[2rem] font-black uppercase text-[12px] tracking-widest shadow-elite active:scale-95 transition-all"
                 >
                    {isSavingStats ? "SALVANDO..." : "ATUALIZAR ATLETA"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const PlayerSection = ({ title, list, isAdmin, onQuickToggle, onEdit, onDelete, processingId, type }: any) => (
  <section className="animate-slide-up">
    <div className="flex items-center justify-between mb-8 px-2">
       <div className="flex items-center gap-3">
          <div className={`w-2 h-2 ${type === 'confirmed' ? 'bg-primary shadow-glow-red' : 'bg-slate-200'} rounded-full animate-pulse`}></div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-navy italic">{title}</h3>
       </div>
       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{list.length} ATLETAS</span>
    </div>
    <div className="space-y-4">
      {list.map((p: Player) => (
        <div key={p.id} className="bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-soft-white flex items-center justify-between group transition-all hover:border-navy/20">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img src={p.photoUrl} className="w-16 h-16 rounded-[1.5rem] object-cover border-2 border-slate-50 shadow-sm" alt="" />
              {isAdmin && (
                <button 
                  onClick={() => onQuickToggle(p)}
                  className={`absolute -top-2 -right-2 w-8 h-8 rounded-xl border-2 border-white shadow-xl flex items-center justify-center transition-all ${p.status === 'presente' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-300'}`}
                >
                  <span className="material-symbols-outlined text-[16px] font-black">{p.status === 'presente' ? 'check' : 'add'}</span>
                </button>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h4 className="text-[16px] font-black text-navy uppercase italic leading-none">{p.name}</h4>
                {p.role === 'admin' && <span className="bg-navy text-white text-[7px] font-black px-2 py-0.5 rounded-md uppercase">ADM</span>}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.position}</p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-3">
               <button onClick={() => onEdit(p)} className="w-11 h-11 rounded-2xl bg-slate-50 text-navy flex items-center justify-center border border-slate-100 hover:bg-navy hover:text-white transition-all">
                  <span className="material-symbols-outlined text-lg">edit</span>
               </button>
               <button onClick={() => onDelete(p)} className="w-11 h-11 rounded-2xl bg-red-50 text-primary flex items-center justify-center border border-red-100 hover:bg-primary hover:text-white transition-all">
                  <span className="material-symbols-outlined text-lg">delete</span>
               </button>
            </div>
          )}
        </div>
      ))}
    </div>
  </section>
);

export default PlayerList;
