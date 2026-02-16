
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
    concededGoals: 0, 
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

  const gkSlots = match?.gkSlots || 4;
  const fieldSlots = match?.fieldSlots || 30;

  const confirmedGks = confirmed.filter(p => p.position === 'Goleiro').slice(0, gkSlots);
  const confirmedField = confirmed.filter(p => p.position !== 'Goleiro').slice(0, fieldSlots);

  const handleShareList = () => {
    const dateStr = match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : '--/--';
    let message = `🏆 *ELENCO O&A* 🇭🇷\n🗓️ *DATA:* ${dateStr}\n⏱️ *HORA:* ${match?.time || '--:--'}H\n────────────────────\n\n📢 *STATUS:* ${confirmed.length} CONFIRMADOS ✅\n🔗 *APP:* ${window.location.origin}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleQuickToggle = async (player: Player) => {
    if (!isCurrentUserAdmin || processingId) return;
    setProcessingId(player.id);
    try {
      await updateDoc(doc(db, "players", player.id), {
        status: player.status === 'presente' ? 'pendente' : 'presente'
      });
    } catch (e) {
      alert("Erro ao confirmar jogador.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreatePlayer = async () => {
    if (!newPlayer.name.trim()) return;
    setIsSavingStats(true);
    try {
      await addDoc(collection(db, "players"), {
        name: newPlayer.name,
        position: newPlayer.position,
        playerType: newPlayer.playerType,
        goals: 0, assists: 0, concededGoals: 0,
        status: 'pendente',
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newPlayer.name)}&background=0051a2&color=fff`,
        role: 'player'
      });
      setIsAddingPlayer(false);
    } catch (e) { alert("Erro ao criar."); } finally { setIsSavingStats(false); }
  };

  const handleSaveStats = async () => {
    if (!selectedPlayerForStats || isSavingStats) return;
    setIsSavingStats(true);
    try {
      await updateDoc(doc(db, "players", selectedPlayerForStats.id), {
        goals: Number(statsData.goals),
        assists: Number(statsData.assists),
        role: statsData.role,
        playerType: statsData.playerType,
        status: statsData.status
      });
      setSelectedPlayerForStats(null);
    } catch (e) { alert("Falha na atualização."); } finally { setIsSavingStats(false); }
  };

  const handleDeletePlayer = async (player: Player) => {
    if (!isCurrentUserAdmin || player.id === currentUser?.uid) return;
    if (!confirm(`Remover ${player.name} permanentemente?`)) return;
    setIsDeletingId(player.id);
    try { await deleteDoc(doc(db, "players", player.id)); } catch (e) { alert("Erro."); } finally { setIsDeletingId(null); }
  };

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-10 flex flex-col gap-8">
        <div className="flex items-center justify-between">
           <div className="flex flex-col gap-1">
             <h2 className="text-2xl font-black text-navy uppercase italic tracking-tighter leading-none">CONVOCADOS</h2>
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">LISTA DE PRESENÇA</p>
           </div>
           <div className="flex gap-3">
             <button onClick={handleShareList} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-all">
                <span className="material-symbols-outlined text-navy">share</span>
             </button>
             {isCurrentUserAdmin && (
                <button onClick={() => setIsAddingPlayer(true)} className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-glow-red active:scale-90 transition-all">
                  <span className="material-symbols-outlined">person_add</span>
                </button>
             )}
           </div>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-lg">search</span>
          <input 
            type="text" placeholder="Buscar pelo nome..." value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 bg-white border border-slate-100 rounded-2xl pl-12 pr-4 text-sm font-bold text-navy outline-none shadow-sm" 
          />
        </div>
      </header>

      <main className="space-y-12 pb-40">
        <PlayerSection 
          title="DENTRO DO JOGO" 
          list={[...confirmedGks, ...confirmedField]} 
          isAdmin={isCurrentUserAdmin} 
          onQuickToggle={handleQuickToggle}
          onEdit={(p) => {
            setSelectedPlayerForStats(p);
            setStatsData({ 
              goals: p.goals || 0, 
              assists: p.assists || 0, 
              concededGoals: p.concededGoals || 0, 
              role: (p.role as 'admin' | 'player') || 'player', 
              playerType: p.playerType || 'avulso', 
              status: p.status || 'pendente' 
            });
          }} 
          onDelete={handleDeletePlayer} 
          isDeletingId={isDeletingId}
          processingId={processingId}
          type="confirmed"
        />

        <PlayerSection 
          title="AUSENTES / AGUARDANDO" 
          list={pending} 
          isAdmin={isCurrentUserAdmin} 
          onQuickToggle={handleQuickToggle}
          onEdit={(p) => {
            setSelectedPlayerForStats(p);
            setStatsData({ 
              goals: p.goals || 0, 
              assists: p.assists || 0, 
              concededGoals: p.concededGoals || 0, 
              role: (p.role as 'admin' | 'player') || 'player', 
              playerType: p.playerType || 'avulso', 
              status: p.status || 'pendente' 
            });
          }} 
          onDelete={handleDeletePlayer} 
          isDeletingId={isDeletingId}
          processingId={processingId}
          type="pending"
        />
      </main>

      {/* MODAL EDIT - Neo Champions Style */}
      {selectedPlayerForStats && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-md z-[110] flex items-center justify-center p-6 overflow-y-auto">
           <div className="w-full max-w-[360px] bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up my-auto">
              <div className="p-8 bg-navy text-white flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <img src={selectedPlayerForStats.photoUrl} className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20" alt="" />
                    <h3 className="text-lg font-black uppercase italic tracking-tighter leading-none">{selectedPlayerForStats.name}</h3>
                 </div>
                 <button onClick={() => setSelectedPlayerForStats(null)} className="material-symbols-outlined text-white/40">close</button>
              </div>
              <div className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block px-1">GOLS</label>
                       <input type="number" value={statsData.goals} onChange={e => setStatsData({...statsData, goals: Number(e.target.value)})} className="w-full h-14 bg-slate-50 rounded-2xl border border-slate-100 font-black text-navy text-center text-xl focus:border-primary outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block px-1">ASSISTS</label>
                       <input type="number" value={statsData.assists} onChange={e => setStatsData({...statsData, assists: Number(e.target.value)})} className="w-full h-14 bg-slate-50 rounded-2xl border border-slate-100 font-black text-navy text-center text-xl focus:border-primary outline-none" />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block px-1">PRESENÇA</label>
                    <select value={statsData.status} onChange={e => setStatsData({...statsData, status: e.target.value as any})} className="w-full h-14 bg-slate-50 rounded-2xl border border-slate-100 font-black text-navy px-6 focus:border-primary outline-none">
                      <option value="presente">CONFIRMADO</option>
                      <option value="pendente">AUSENTE</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block px-1">VÍNCULO</label>
                    <select value={statsData.playerType} onChange={e => setStatsData({...statsData, playerType: e.target.value as any})} className="w-full h-14 bg-slate-50 rounded-2xl border border-slate-100 font-black text-navy px-6 focus:border-primary outline-none">
                      <option value="mensalista">MENSALISTA</option>
                      <option value="avulso">AVULSO</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest block px-1">NÍVEL DE ACESSO</label>
                    <select value={statsData.role} onChange={e => setStatsData({...statsData, role: e.target.value as any})} className="w-full h-14 bg-slate-100 rounded-2xl border-2 border-primary/20 font-black text-navy px-6 focus:border-primary outline-none">
                      <option value="player">ATLETA</option>
                      <option value="admin">DIRETORIA (ADM)</option>
                    </select>
                 </div>
                 
                 <button onClick={handleSaveStats} disabled={isSavingStats} className="w-full h-18 bg-primary text-white rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-glow-red active:scale-95 transition-all mt-4">
                    {isSavingStats ? "PROCESSANDO..." : "ATUALIZAR DADOS"}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL ADD PLAYER */}
      {isAddingPlayer && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-md z-[110] flex items-center justify-center p-6">
           <div className="w-full max-w-[360px] bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-8 bg-primary text-white">
                 <h3 className="text-lg font-black uppercase italic tracking-[0.2em] leading-none">NOVO ATLETA</h3>
              </div>
              <div className="p-10 space-y-6">
                 <input type="text" placeholder="Nome do Jogador" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} className="w-full h-14 bg-slate-50 rounded-2xl border border-slate-100 px-6 font-bold text-navy focus:border-primary outline-none" />
                 <select value={newPlayer.position} onChange={e => setNewPlayer({...newPlayer, position: e.target.value})} className="w-full h-14 bg-slate-50 rounded-2xl border border-slate-100 px-6 font-bold text-navy focus:border-primary outline-none">
                    <option value="Atacante">Atacante</option>
                    <option value="Meia">Meia</option>
                    <option value="Volante">Volante</option>
                    <option value="Zagueiro">Zagueiro</option>
                    <option value="Goleiro">Goleiro</option>
                 </select>
                 <div className="flex gap-4 pt-4">
                    <button onClick={() => setIsAddingPlayer(false)} className="flex-1 h-16 bg-slate-100 text-navy rounded-2xl font-black uppercase text-[10px] tracking-widest">CANCELAR</button>
                    <button onClick={handleCreatePlayer} className="flex-1 h-16 bg-navy text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-elite">CRIAR</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const PlayerSection = ({ title, list, isAdmin, onQuickToggle, onEdit, onDelete, isDeletingId, processingId, type }: any) => (
  <section className="animate-slide-up">
    <div className="flex items-center justify-between mb-6 px-1">
       <div className="flex items-center gap-3">
          <div className={`w-1.5 h-4 ${type === 'confirmed' ? 'bg-success shadow-[0_0_8px_#10B981]' : 'bg-slate-200'} rounded-full`}></div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-navy italic">{title}</h3>
       </div>
       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{list.length} ATLETAS</span>
    </div>
    <div className="space-y-4">
      {list.map((p: Player) => (
        <div key={p.id} className={`bg-white rounded-[2rem] p-4 border border-slate-100 shadow-soft-white flex items-center justify-between group transition-all hover:shadow-elite ${type === 'pending' ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm">
                <img src={p.photoUrl} className="w-full h-full object-cover" alt="" />
              </div>
              {isAdmin && (
                <button 
                  onClick={() => onQuickToggle(p)}
                  disabled={processingId === p.id}
                  className={`absolute -top-2 -right-2 w-8 h-8 rounded-xl border-2 border-white shadow-xl flex items-center justify-center transition-all ${p.status === 'presente' ? 'bg-success text-white' : 'bg-slate-100 text-slate-400'}`}
                >
                  {processingId === p.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : (
                    <span className="material-symbols-outlined text-[16px] font-black">{p.status === 'presente' ? 'check' : 'add'}</span>
                  )}
                </button>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-[15px] font-black text-navy uppercase italic leading-none">{p.name}</h4>
                {p.role === 'admin' && <span className="bg-navy text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest">DIR</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold uppercase tracking-widest ${p.position === 'Goleiro' ? 'text-primary' : 'text-slate-400'}`}>{p.position}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                <span className="text-[9px] font-bold text-navy/40 uppercase tracking-widest">{p.playerType === 'mensalista' ? 'MENSAL' : 'AVULSO'}</span>
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
               <button onClick={() => onEdit(p)} className="w-10 h-10 rounded-xl bg-slate-50 text-navy flex items-center justify-center border border-slate-100 hover:bg-navy hover:text-white transition-all">
                  <span className="material-symbols-outlined text-lg">edit</span>
               </button>
               <button onClick={() => onDelete(p)} disabled={isDeletingId === p.id} className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center border border-red-50 hover:bg-primary hover:text-white transition-all">
                  {isDeletingId === p.id ? '...' : <span className="material-symbols-outlined text-lg">delete</span>}
               </button>
            </div>
          )}
        </div>
      ))}
    </div>
  </section>
);

export default PlayerList;
