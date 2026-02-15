
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
    playerType: 'avulso' as 'mensalista' | 'avulso'
  });
  const [isSavingStats, setIsSavingStats] = useState(false);

  const adminUser = players.find(p => p.id === currentUser?.uid);
  const isCurrentUserAdmin = adminUser?.role === 'admin' || currentUser?.email === MASTER_ADMIN_EMAIL;

  const handleCreatePlayer = async () => {
    if (!newPlayer.name.trim()) return;
    setIsSavingStats(true);
    try {
      await addDoc(collection(db, "players"), {
        name: newPlayer.name,
        position: newPlayer.position,
        playerType: newPlayer.playerType,
        goals: 0,
        assists: 0,
        concededGoals: 0,
        status: 'pendente',
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newPlayer.name)}&background=003876&color=fff`,
        role: 'player'
      });
      setIsAddingPlayer(false);
      setNewPlayer({ name: '', position: 'Atacante', playerType: 'avulso' });
    } catch (e) { alert("Erro ao criar."); } finally { setIsSavingStats(false); }
  };

  const handleOpenStats = (player: Player) => {
    setSelectedPlayerForStats(player);
    setStatsData({ 
      goals: player.goals || 0, 
      assists: player.assists || 0, 
      concededGoals: player.concededGoals || 0,
      role: player.role || 'player',
      playerType: player.playerType || 'avulso'
    });
  };

  const handleSaveStats = async () => {
    if (!selectedPlayerForStats || isSavingStats) return;
    setIsSavingStats(true);
    try {
      await updateDoc(doc(db, "players", selectedPlayerForStats.id), {
        goals: Number(statsData.goals),
        assists: Number(statsData.assists),
        concededGoals: Number(statsData.concededGoals),
        role: statsData.role,
        playerType: statsData.playerType
      });
      setSelectedPlayerForStats(null);
    } catch (e) { alert("Falha na atualização."); } finally { setIsSavingStats(false); }
  };

  const handleDeletePlayer = async (player: Player) => {
    if (!isCurrentUserAdmin || isDeletingId || player.id === currentUser?.uid) return;
    if (!confirm(`Remover ${player.name} permanentemente da elite?`)) return;
    setIsDeletingId(player.id);
    try { await deleteDoc(doc(db, "players", player.id)); } catch (e) { alert("Erro."); } finally { setIsDeletingId(null); }
  };

  const filtered = players.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const confirmed = filtered.filter(p => p.status === 'presente');
  const pending = filtered.filter(p => p.status !== 'presente');

  const handleShareList = () => {
    const gks = confirmed.filter(p => p.position === 'Goleiro');
    const field = confirmed.filter(p => p.position !== 'Goleiro');
    
    const dateStr = match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '--/--';
    
    let message = `📋 *BOLETIM OFICIAL - O&A ELITE* 🇭🇷\n`;
    message += `🏟️ *LOCAL:* ${match?.location || 'Arena Elite'}\n`;
    message += `🗓️ *DATA:* ${dateStr} às ${match?.time || '--:--'}h\n`;
    message += `──────────────────\n\n`;
    
    message += `🧤 *PAREDÕES CONFIRMADOS* (${gks.length}/${match?.gkSlots || 4})\n`;
    if (gks.length > 0) {
      gks.forEach((p, i) => message += `${i + 1}. ${p.name.toUpperCase()}\n`);
    } else {
      message += `_Aguardando muralhas..._\n`;
    }
    
    message += `\n🏃 *LINHA DE FRENTE* (${field.length}/${match?.fieldSlots || 30})\n`;
    if (field.length > 0) {
      field.forEach((p, i) => message += `${String(i + 1).padStart(2, '0')}. ${p.name.toUpperCase()}\n`);
    } else {
      message += `_Lista aberta. Garanta sua vaga!_\n`;
    }
    
    message += `\n──────────────────\n`;
    message += `⚠️ *VAGAS RESTANTES:* ${(match?.fieldSlots || 30) - field.length}\n`;
    message += `✅ *CONFIRME PELO APP:* ${window.location.origin}`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="px-6 pt-10 pb-6 glass-header sticky top-0 z-40">
        <div className="flex items-center justify-between mb-6">
           <div className="flex flex-col">
             <h2 className="text-base font-black text-navy uppercase italic tracking-tighter">CONVOCAÇÃO</h2>
             <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em]">ELITE ROSTER</span>
           </div>
           <div className="flex gap-2">
             <button 
              onClick={handleShareList}
              className="w-10 h-10 bg-success text-white rounded-xl flex items-center justify-center shadow-lg shadow-success/20 active:scale-90 transition-all"
             >
                <span className="material-symbols-outlined text-xl">share</span>
             </button>
             {isCurrentUserAdmin && (
                <button 
                  onClick={() => setIsAddingPlayer(true)}
                  className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all"
                >
                  <span className="material-symbols-outlined text-xl font-bold">person_add</span>
                </button>
             )}
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
        <Section title="CONFIRMADOS NA PELADA" list={confirmed} isAdmin={isCurrentUserAdmin} onEdit={handleOpenStats} onDelete={handleDeletePlayer} isDeletingId={isDeletingId} currentUser={currentUser} type="confirmed" />
        <Section title="ATLETAS FORA / PENDENTES" list={pending} isAdmin={isCurrentUserAdmin} onEdit={handleOpenStats} onDelete={handleDeletePlayer} isDeletingId={isDeletingId} currentUser={currentUser} type="pending" />
      </main>

      {/* MODAL ADICIONAR ATLETA */}
      {isAddingPlayer && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-md z-[110] flex items-center justify-center p-6">
           <div className="w-full max-w-[340px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-6 bg-primary text-white flex items-center justify-between">
                 <h3 className="text-xs font-black uppercase italic tracking-widest">CADASTRAR ATLETA</h3>
                 <button onClick={() => setIsAddingPlayer(false)} className="material-symbols-outlined">close</button>
              </div>
              <div className="p-6 space-y-4">
                 <input 
                  type="text" 
                  placeholder="Nome do Jogador" 
                  value={newPlayer.name}
                  onChange={e => setNewPlayer({...newPlayer, name: e.target.value})}
                  className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100 px-4 font-bold text-navy" 
                 />
                 <select 
                  value={newPlayer.position}
                  onChange={e => setNewPlayer({...newPlayer, position: e.target.value})}
                  className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100 px-4 font-bold text-navy"
                 >
                    <option value="Goleiro">Goleiro</option>
                    <option value="Zagueiro">Zagueiro</option>
                    <option value="Lateral">Lateral</option>
                    <option value="Volante">Volante</option>
                    <option value="Meia">Meia</option>
                    <option value="Atacante">Atacante</option>
                 </select>
                 <select 
                  value={newPlayer.playerType}
                  onChange={e => setNewPlayer({...newPlayer, playerType: e.target.value as 'mensalista' | 'avulso'})}
                  className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100 px-4 font-bold text-navy"
                 >
                    <option value="mensalista">Mensalista</option>
                    <option value="avulso">Avulso</option>
                 </select>
                 <button 
                  onClick={handleCreatePlayer}
                  disabled={isSavingStats}
                  className="w-full h-14 bg-navy text-white rounded-xl font-black uppercase text-[10px] tracking-widest"
                 >
                    {isSavingStats ? "SALVANDO..." : "CONVOCAR ATLETA"}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL STATS & CARGO */}
      {selectedPlayerForStats && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-fade-in">
           <div className="w-full max-w-[340px] bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-6 bg-navy text-white flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <img src={selectedPlayerForStats.photoUrl} className="w-10 h-10 rounded-lg object-cover border border-white/20" alt="" />
                    <h3 className="text-xs font-black uppercase italic">{selectedPlayerForStats.name}</h3>
                 </div>
                 <button onClick={() => setSelectedPlayerForStats(null)} className="material-symbols-outlined text-white/40">close</button>
              </div>
              <div className="p-6 space-y-5">
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

                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">TIPO DE CONTRATO</label>
                    <select 
                      value={statsData.playerType}
                      onChange={e => setStatsData({...statsData, playerType: e.target.value as 'mensalista' | 'avulso'})}
                      className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100 font-black text-navy px-4"
                    >
                      <option value="mensalista">MENSALISTA</option>
                      <option value="avulso">AVULSO / CONVIDADO</option>
                    </select>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">CARGO NA ARENA</label>
                    <select 
                      value={statsData.role}
                      onChange={e => setStatsData({...statsData, role: e.target.value as 'admin' | 'player'})}
                      className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100 font-black text-navy px-4"
                    >
                      <option value="player">ATLETA ELITE</option>
                      <option value="admin">DIRETORIA / ADM</option>
                    </select>
                 </div>

                 <button onClick={handleSaveStats} disabled={isSavingStats} className="w-full h-14 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 mt-2">
                    ATUALIZAR DADOS
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
       <div className={`w-1 h-4 ${type === 'confirmed' ? 'bg-success' : 'bg-slate-300'} rounded-full`}></div>
       <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-navy italic">{title}</h3>
    </div>
    <div className="grid grid-cols-1 gap-2">
      {list.length > 0 ? list.map((p: Player, i: number) => (
        <div key={p.id} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-elite flex items-center justify-between group animate-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 30}ms` }}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl overflow-hidden border-2 ${p.role === 'admin' ? 'border-primary/20' : 'border-slate-50'}`}>
              <img src={p.photoUrl} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-navy uppercase italic leading-none mb-0.5">{p.name}</h4>
              <div className="flex items-center gap-1.5">
                <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">{p.position}</span>
                <span className="text-[7px] font-black text-primary uppercase tracking-widest">• {p.playerType === 'mensalista' ? 'MENSAL' : 'AVULSO'}</span>
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-1.5">
               <button onClick={() => onEdit(p)} className="w-8 h-8 rounded-lg bg-slate-50 text-navy flex items-center justify-center border border-slate-100"><span className="material-symbols-outlined text-base">edit</span></button>
               {p.id !== currentUser?.uid && (
                <button onClick={() => onDelete(p)} disabled={isDeletingId === p.id} className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center border border-red-100 active:bg-primary active:text-white">
                  <span className={`material-symbols-outlined text-base ${isDeletingId === p.id ? 'animate-spin' : ''}`}>delete</span>
                </button>
               )}
            </div>
          )}
        </div>
      )) : (
        <p className="text-[9px] text-slate-300 uppercase font-black text-center py-4 tracking-widest">Nenhum atleta nesta categoria</p>
      )}
    </div>
  </section>
);

export default PlayerList;
