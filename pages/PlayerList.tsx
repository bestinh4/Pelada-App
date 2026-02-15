
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

  const adminUser = players.find(p => p.id === currentUser?.uid);
  const isCurrentUserAdmin = adminUser?.role === 'admin' || currentUser?.email === MASTER_ADMIN_EMAIL;

  const filtered = players.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const confirmed = filtered.filter(p => p.status === 'presente');
  const pending = filtered.filter(p => p.status !== 'presente');

  const gkSlots = match?.gkSlots || 4;
  const fieldSlots = match?.fieldSlots || 30;

  const allConfirmedGks = confirmed.filter(p => p.position === 'Goleiro');
  const allConfirmedField = confirmed.filter(p => p.position !== 'Goleiro');

  const gksTitulares = allConfirmedGks.slice(0, gkSlots);
  const gksEspera = allConfirmedGks.slice(gkSlots);
  
  const fieldConfirmados = allConfirmedField.slice(0, fieldSlots);
  const fieldEspera = allConfirmedField.slice(fieldSlots);

  const handleShareList = () => {
    const dateStr = match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : '--/--';
    
    let message = `🏆 *OUSADIA & ALEGRIA ELITE* 🇭🇷\n`;
    message += `🏟️ *LOCAL:* ${match?.location?.toUpperCase() || 'ARENA OUSADIA'}\n`;
    message += `🗓️ *DATA:* ${dateStr}\n`;
    message += `⏱️ *HORÁRIO:* ${match?.time || '--:--'}H\n`;
    message += `────────────────────\n\n`;
    
    message += `🧤 *GOLEIROS CONFIRMADOS* (${gksTitulares.length}/${gkSlots})\n`;
    if (gksTitulares.length > 0) {
      gksTitulares.forEach((p, i) => message += `*${i + 1}.* ${p.name.toUpperCase()}\n`);
    } else {
      message += `_Aguardando goleiros..._\n`;
    }

    if (gksEspera.length > 0) {
      message += `\n⏳ *LISTA DE ESPERA (Goleiros)*\n`;
      gksEspera.forEach((p) => message += `• ${p.name.toUpperCase()}\n`);
    }
    
    message += `\n🏃 *ATLETAS CONFIRMADOS* (${fieldConfirmados.length}/${fieldSlots})\n`;
    if (fieldConfirmados.length > 0) {
      fieldConfirmados.forEach((p, i) => message += `*${String(i + 1).padStart(2, '0')}.* ${p.name.toUpperCase()}\n`);
    } else {
      message += `_Lista aberta! Garanta sua vaga!_\n`;
    }

    if (fieldEspera.length > 0) {
      message += `\n⏳ *LISTA DE ESPERA (Linha)*\n`;
      fieldEspera.forEach((p) => message += `• ${p.name.toUpperCase()}\n`);
    }
    
    message += `\n────────────────────\n`;
    message += `📢 *STATUS:* ${confirmed.length} CONFIRMADOS ✅\n`;
    message += `🔗 *APP:* ${window.location.origin}`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
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
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newPlayer.name)}&background=0033A0&color=fff`,
        role: 'player'
      });
      setIsAddingPlayer(false);
      setNewPlayer({ name: '', position: 'Atacante', playerType: 'avulso' });
    } catch (e) { alert("Erro ao criar."); } finally { setIsSavingStats(false); }
  };

  const handleOpenEditModal = (p: Player) => {
    setSelectedPlayerForStats(p);
    setStatsData({ 
      goals: p.goals || 0, 
      assists: p.assists || 0, 
      concededGoals: p.concededGoals || 0, 
      role: p.role || 'player', 
      playerType: p.playerType || 'avulso',
      status: p.status || 'pendente'
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
        playerType: statsData.playerType,
        status: statsData.status
      });
      setSelectedPlayerForStats(null);
    } catch (e) { alert("Falha na atualização."); } finally { setIsSavingStats(false); }
  };

  const handleDeletePlayer = async (player: Player) => {
    if (!isCurrentUserAdmin || isDeletingId || player.id === currentUser?.uid) return;
    if (!confirm(`Remover ${player.name} permanentemente?`)) return;
    setIsDeletingId(player.id);
    try { await deleteDoc(doc(db, "players", player.id)); } catch (e) { alert("Erro."); } finally { setIsDeletingId(null); }
  };

  return (
    <div className="flex flex-col animate-fade-in">
      <header className="px-6 pt-12 pb-8 glass-surface sticky top-0 z-40 border-b-0 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-8">
           <div className="flex flex-col gap-1">
             <h2 className="text-xl font-black text-navy uppercase italic tracking-tighter leading-none">LISTA DE PRESENÇA</h2>
             <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-primary rounded-full"></span>
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">CONFIRMADOS PARA O SORTEIO</span>
             </div>
           </div>
           <div className="flex gap-3">
             <button onClick={handleShareList} className="w-12 h-12 bg-success text-white rounded-2xl flex items-center justify-center shadow-lg shadow-success/20 active:scale-90 transition-all">
                <span className="material-symbols-outlined text-2xl font-light">share</span>
             </button>
             {isCurrentUserAdmin && (
                <button onClick={() => setIsAddingPlayer(true)} className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-2xl font-light">person_add</span>
                </button>
             )}
           </div>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-lg">search</span>
          <input 
            type="text" placeholder="Buscar atleta na lista..." value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-white/50 border border-white/80 rounded-2xl pl-12 pr-4 text-xs font-bold text-navy outline-none shadow-inner" 
          />
        </div>
      </header>

      <main className="px-6 mt-10 space-y-12 pb-40">
        <Section 
          title="DENTRO DO JOGO" 
          list={[...gksTitulares, ...fieldConfirmados]} 
          isAdmin={isCurrentUserAdmin} 
          onEdit={handleOpenEditModal} 
          onDelete={handleDeletePlayer} 
          isDeletingId={isDeletingId} 
          currentUser={currentUser} 
          type="confirmed" 
          badge="CONFIRMADO" 
        />

        {(gksEspera.length > 0 || fieldEspera.length > 0) && (
          <Section 
            title="LISTA DE ESPERA" 
            list={[...gksEspera, ...fieldEspera]} 
            isAdmin={isCurrentUserAdmin} 
            onEdit={handleOpenEditModal} 
            onDelete={handleDeletePlayer} 
            isDeletingId={isDeletingId} 
            currentUser={currentUser} 
            type="waiting" 
            badge="ESPERA" 
          />
        )}

        <Section 
          title="BANCO / AUSENTES" 
          list={pending} 
          isAdmin={isCurrentUserAdmin} 
          onEdit={handleOpenEditModal} 
          onDelete={handleDeletePlayer} 
          isDeletingId={isDeletingId} 
          currentUser={currentUser} 
          type="pending" 
          badge="OFF" 
        />
      </main>

      {/* MODAIS (MANTIDOS) */}
      {isAddingPlayer && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-md z-[110] flex items-center justify-center p-6">
           <div className="w-full max-w-[340px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-7 bg-primary text-white flex items-center justify-between">
                 <h3 className="text-[10px] font-black uppercase italic tracking-[0.2em]">CADASTRAR ATLETA</h3>
                 <button onClick={() => setIsAddingPlayer(false)} className="material-symbols-outlined text-white/60">close</button>
              </div>
              <div className="p-8 space-y-5">
                 <div className="space-y-1.5">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">NOME DO JOGADOR</label>
                   <input type="text" placeholder="Ex: Rodrigo" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100 px-4 font-bold text-navy" />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">POSIÇÃO</label>
                   <select value={newPlayer.position} onChange={e => setNewPlayer({...newPlayer, position: e.target.value})} className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100 px-4 font-bold text-navy">
                      <option value="Goleiro">Goleiro</option>
                      <option value="Zagueiro">Zagueiro</option>
                      <option value="Lateral">Lateral</option>
                      <option value="Volante">Volante</option>
                      <option value="Meia">Meia</option>
                      <option value="Atacante">Atacante</option>
                   </select>
                 </div>
                 <button onClick={handleCreatePlayer} disabled={isSavingStats} className="w-full h-16 bg-navy text-white rounded-[1.25rem] font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all mt-4">
                    {isSavingStats ? "SALVANDO..." : "ADICIONAR À LISTA"}
                 </button>
              </div>
           </div>
        </div>
      )}

      {selectedPlayerForStats && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-md z-[110] flex items-center justify-center p-6">
           <div className="w-full max-w-[340px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-7 bg-navy text-white flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <img src={selectedPlayerForStats.photoUrl} className="w-12 h-12 rounded-xl object-cover border-2 border-white/20" alt="" />
                    <h3 className="text-xs font-black uppercase italic tracking-tighter leading-none">{selectedPlayerForStats.name}</h3>
                 </div>
                 <button onClick={() => setSelectedPlayerForStats(null)} className="material-symbols-outlined text-white/40">close</button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">GOLS</label>
                       <input type="number" value={statsData.goals} onChange={e => setStatsData({...statsData, goals: Number(e.target.value)})} className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100 font-black text-navy text-center" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">ASSISTS</label>
                       <input type="number" value={statsData.assists} onChange={e => setStatsData({...statsData, assists: Number(e.target.value)})} className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100 font-black text-navy text-center" />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-primary uppercase tracking-widest block px-1">STATUS DE PRESENÇA</label>
                    <select value={statsData.status} onChange={e => setStatsData({...statsData, status: e.target.value as any})} className="w-full h-12 bg-slate-50 rounded-xl border-2 border-primary/10 font-black text-navy px-4">
                      <option value="presente">DENTRO (CONFIRMADO)</option>
                      <option value="pendente">FORA (AUSENTE)</option>
                    </select>
                 </div>
                 
                 <button onClick={handleSaveStats} disabled={isSavingStats} className="w-full h-16 bg-primary text-white rounded-[1.25rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 mt-4 active:scale-95 transition-all">
                    {isSavingStats ? "PROCESSANDO..." : "SALVAR ALTERAÇÕES"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, list, isAdmin, onEdit, onDelete, isDeletingId, currentUser, type, badge }: any) => (
  <section className="animate-slide-up">
    <div className="flex items-center justify-between mb-5 px-1">
       <div className="flex items-center gap-3">
          <div className={`w-1.5 h-4 ${type === 'confirmed' ? 'bg-success' : type === 'waiting' ? 'bg-amber-400' : 'bg-slate-300'} rounded-full`}></div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-navy italic">{title}</h3>
       </div>
       <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{list.length} JOGADORES</span>
    </div>
    <div className="grid grid-cols-1 gap-3">
      {list.length > 0 ? list.map((p: Player, i: number) => (
        <div key={p.id} className={`bg-white rounded-[1.5rem] p-4 border border-slate-100 shadow-sm flex items-center justify-between group transition-all duration-300 hover:shadow-md ${type === 'pending' ? 'opacity-70 grayscale' : ''}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-[1rem] overflow-hidden border-2 transition-all ${p.role === 'admin' ? 'border-primary' : 'border-slate-50'}`}>
              <img src={p.photoUrl} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-[13px] font-black text-navy uppercase italic leading-none">{p.name}</h4>
                <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${type === 'confirmed' ? 'bg-success text-white' : type === 'waiting' ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {badge}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{p.position}</span>
                <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">{p.playerType === 'mensalista' ? 'MENSAL' : 'AVULSO'}</span>
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => onEdit(p)} className="w-10 h-10 rounded-xl bg-slate-50 text-navy flex items-center justify-center border border-slate-100 hover:bg-white">
                  <span className="material-symbols-outlined text-xl font-light">edit_note</span>
               </button>
               {p.id !== currentUser?.uid && (
                <button onClick={() => onDelete(p)} disabled={isDeletingId === p.id} className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center border border-red-100 hover:bg-white">
                  <span className={`material-symbols-outlined text-xl font-light ${isDeletingId === p.id ? 'animate-spin' : ''}`}>delete_sweep</span>
                </button>
               )}
            </div>
          )}
        </div>
      )) : (
        <div className="py-10 text-center glass-surface rounded-[2rem] border-dashed">
           <p className="text-[10px] text-slate-300 uppercase font-black tracking-widest">Lista de presença vazia</p>
        </div>
      )}
    </div>
  </section>
);

export default PlayerList;
