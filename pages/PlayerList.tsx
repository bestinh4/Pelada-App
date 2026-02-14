
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

interface SectionProps {
  title: string;
  color: string;
  badgeColor: string;
  list: Player[];
  countText: string;
  isWaitlist?: boolean;
  isNotPlaying?: boolean;
  isAdmin: boolean;
  onToggleAdmin: (p: Player) => void;
  onDelete: (p: Player) => void;
  promotingId: string | null;
  isDeletingId: string | null;
  currentUser: any;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentUser, match, onPageChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newPlayerData, setNewPlayerData] = useState({
    name: '',
    position: 'Atacante',
    playerType: 'avulso' as 'mensalista' | 'avulso'
  });

  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const adminUser = players.find(p => p.id === currentUser?.uid);
  const isCurrentUserAdmin = adminUser?.role === 'admin' || currentUser?.email === MASTER_ADMIN_EMAIL;

  const fieldSlots = match?.fieldSlots || 30;
  const gkSlots = match?.gkSlots || 4;

  const handleToggleAdmin = async (player: Player) => {
    if (!isCurrentUserAdmin || promotingId) return;
    
    if (player.email === MASTER_ADMIN_EMAIL) {
       alert("Você não pode alterar o cargo do Master Admin.");
       return;
    }

    const action = player.role === 'admin' ? 'remover o acesso ADM de' : 'promover a ADM';
    if (!confirm(`Deseja realmente ${action} ${player.name}?`)) return;

    setPromotingId(player.id);
    try {
      const playerRef = doc(db, "players", player.id);
      await updateDoc(playerRef, { role: player.role === 'admin' ? 'player' : 'admin' });
    } catch (e) {
      alert("Erro ao alterar cargo.");
    } finally {
      setPromotingId(null);
    }
  };

  const handleDeletePlayer = async (player: Player) => {
    if (!isCurrentUserAdmin || isDeletingId) return;
    
    if (player.id === currentUser?.uid) {
       alert("Você não pode se excluir!");
       return;
    }

    if (player.email === MASTER_ADMIN_EMAIL) {
       alert("O Master Admin não pode ser removido!");
       return;
    }

    if (!confirm(`⚠️ ATENÇÃO: Deseja realmente EXCLUIR permanentemente o atleta ${player.name}?`)) return;

    setIsDeletingId(player.id);
    try {
      await deleteDoc(doc(db, "players", player.id));
    } catch (e) {
      alert("Erro ao excluir jogador.");
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerData.name.trim() || isAdding) return;

    setIsAdding(true);
    try {
      await addDoc(collection(db, "players"), {
        name: newPlayerData.name.trim(),
        position: newPlayerData.position,
        playerType: newPlayerData.playerType,
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newPlayerData.name)}&background=random&color=fff&size=200`,
        goals: 0,
        assists: 0,
        concededGoals: 0,
        status: 'pendente',
        paymentStatus: 'pendente',
        role: 'player'
      });
      setShowAddModal(false);
      setNewPlayerData({ name: '', position: 'Atacante', playerType: 'avulso' });
    } catch (e) {
      alert("Erro ao adicionar jogador.");
    } finally {
      setIsAdding(false);
    }
  };

  const groupedPlayers = useMemo(() => {
    const confirmed: Player[] = [];
    const waitlist: Player[] = [];
    const notPlaying: Player[] = [];

    let currentGKs = 0;
    let currentField = 0;

    const filtered = players.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (a.role !== 'admin' && b.role === 'admin') return 1;
      if (a.status === 'presente' && b.status === 'pendente') return -1;
      if (a.status === 'pendente' && b.status === 'presente') return 1;
      return 0;
    });

    sorted.forEach(p => {
      if (p.status === 'presente') {
        const isGK = p.position === 'Goleiro';
        if (isGK) {
          if (currentGKs < gkSlots) {
            confirmed.push(p);
            currentGKs++;
          } else {
            waitlist.push(p);
          }
        } else {
          if (currentField < fieldSlots) {
            confirmed.push(p);
            currentField++;
          } else {
            waitlist.push(p);
          }
        }
      } else {
        notPlaying.push(p);
      }
    });

    return { confirmed, waitlist, notPlaying, currentGKs, currentField };
  }, [players, searchQuery, fieldSlots, gkSlots]);

  const handleShareList = () => {
    if (!match) {
      alert("Nenhuma partida agendada.");
      return;
    }

    const dateStr = new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { 
      weekday: 'long', day: '2-digit', month: 'long' 
    });

    const appUrl = window.location.origin;
    const remainingField = Math.max(0, fieldSlots - groupedPlayers.currentField);
    const remainingGKs = Math.max(0, gkSlots - groupedPlayers.currentGKs);
    const flag = "🇭🇷";

    let message = `⚽ *CONVOCAÇÃO O&A ELITE* ${flag} ⚽\n\n`;
    message += `📍 *Local:* ${match.location} ${flag}\n`;
    message += `📅 *Data:* ${dateStr}\n`;
    message += `⏰ *Hora:* ${match.time}h\n\n`;

    message += `✅ *CONFIRMADOS (${groupedPlayers.confirmed.length}):*\n`;
    groupedPlayers.confirmed.forEach((p, index) => {
      message += `${index + 1}. ${p.name} (${p.position})${p.role === 'admin' ? ' ⭐' : ''}\n`;
    });

    if (groupedPlayers.waitlist.length > 0) {
      message += `\n⏳ *LISTA DE ESPERA (${groupedPlayers.waitlist.length}):*\n`;
      groupedPlayers.waitlist.forEach((p, index) => {
        message += `${index + 1}. ${p.name} (${p.position})\n`;
      });
    }

    message += `\n📊 *VAGAS RESTANTES:*\n🏃 Linha: ${remainingField}\n🧤 Goleiros: ${remainingGKs}\n\n`;
    message += `🔗 *Confirme pelo App:* \n${appUrl}`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-40 relative">
      <header className="px-6 pt-12 pb-6 bg-white/80 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" alt="Logo" />
            <div>
              <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">CONVOCAÇÃO ELITE</h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 text-primary">🇭🇷 OUSADIA & ALEGRIA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCurrentUserAdmin && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center shadow-lg active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined text-xl">person_add</span>
              </button>
            )}
            <button 
              onClick={handleShareList}
              className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-navy shadow-sm active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-xl">ios_share</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xl">search</span>
          <input 
            type="text"
            placeholder="Filtrar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-navy outline-none"
          />
        </div>
      </header>

      <main className="px-6 mt-8 space-y-12">
        <Section 
          title="CONFIRMADOS" 
          color="bg-emerald-500" 
          badgeColor="bg-emerald-50 text-emerald-600" 
          list={groupedPlayers.confirmed} 
          countText="ATLETAS" 
          isAdmin={isCurrentUserAdmin}
          onToggleAdmin={handleToggleAdmin}
          onDelete={handleDeletePlayer}
          promotingId={promotingId}
          isDeletingId={isDeletingId}
          currentUser={currentUser}
        />
        <Section 
          title="FILA DE ESPERA" 
          color="bg-amber-500" 
          badgeColor="bg-amber-50 text-amber-600" 
          list={groupedPlayers.waitlist} 
          countText="EM ESPERA" 
          isWaitlist 
          isAdmin={isCurrentUserAdmin}
          onToggleAdmin={handleToggleAdmin}
          onDelete={handleDeletePlayer}
          promotingId={promotingId}
          isDeletingId={isDeletingId}
          currentUser={currentUser}
        />
        <Section 
          title="FORA DA PELADA" 
          color="bg-slate-300" 
          badgeColor="bg-slate-100 text-slate-400" 
          list={groupedPlayers.notPlaying} 
          countText="AUSENTES" 
          isNotPlaying 
          isAdmin={isCurrentUserAdmin}
          onToggleAdmin={handleToggleAdmin}
          onDelete={handleDeletePlayer}
          promotingId={promotingId}
          isDeletingId={isDeletingId}
          currentUser={currentUser}
        />
      </main>

      {/* Modal e Botão Flutuante (omitidos para brevidade, mas mantidos na lógica) */}
      <div className="fixed bottom-32 right-8 z-50">
        <button 
          onClick={handleShareList}
          className="w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 border-4 border-white"
        >
          <span className="material-symbols-outlined text-3xl">share</span>
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="px-8 pt-8 pb-4 flex justify-between items-center">
                 <h3 className="text-lg font-black text-navy uppercase italic">NOVO ATLETA ELITE</h3>
                 <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-sm">close</span>
                 </button>
              </div>
              <form onSubmit={handleManualAdd} className="p-8 space-y-5">
                 <input 
                  required
                  type="text" 
                  value={newPlayerData.name}
                  onChange={e => setNewPlayerData({...newPlayerData, name: e.target.value})}
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-navy"
                  placeholder="Nome do Jogador"
                />
                <select 
                  value={newPlayerData.position}
                  onChange={e => setNewPlayerData({...newPlayerData, position: e.target.value})}
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-navy"
                >
                  <option>Goleiro</option><option>Zagueiro</option><option>Lateral</option><option>Volante</option><option>Meia</option><option>Atacante</option>
                </select>
                <button type="submit" disabled={isAdding} className="w-full h-16 bg-navy text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                  {isAdding ? "Adicionando..." : "ADICIONAR À ARENA"}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const Section: React.FC<SectionProps> = ({ title, color, badgeColor, list, countText, isWaitlist, isNotPlaying, isAdmin, onToggleAdmin, onDelete, promotingId, isDeletingId, currentUser }) => (
  <section>
    <div className="flex items-center justify-between mb-6 px-2">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-6 ${color} rounded-full`}></div>
        <h3 className={`text-xs font-black uppercase tracking-widest text-navy ${isNotPlaying ? 'opacity-50' : ''}`}>{title}</h3>
      </div>
      <span className={`${badgeColor} text-[10px] font-black px-3 py-1 rounded-lg`}>
        {list.length} {countText}
      </span>
    </div>
    <div className={`space-y-4 ${isNotPlaying ? 'opacity-60 grayscale' : ''}`}>
      {list.map((p) => {
        const isTargetMaster = p.email === MASTER_ADMIN_EMAIL || (p.id === currentUser?.uid && currentUser?.email === MASTER_ADMIN_EMAIL);
        
        return (
          <div key={p.id} className={`bg-white rounded-[2rem] p-5 border border-slate-100 shadow-soft flex items-center gap-4 group ${isNotPlaying ? 'border-dashed' : 'hover:border-primary/20'}`}>
            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 ${p.role === 'admin' ? (isTargetMaster ? 'border-primary shadow-glow' : 'border-amber-400') : 'border-slate-50'}`}>
                <img src={p.photoUrl} className="w-full h-full object-cover" alt={p.name} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-black text-navy uppercase italic tracking-tight text-sm leading-none mb-1">{p.name}</h4>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">{p.position}</span>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                     <button 
                        onClick={() => onToggleAdmin(p)}
                        disabled={promotingId === p.id || isTargetMaster}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isTargetMaster ? 'bg-slate-100 text-slate-300' : (p.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300 hover:bg-navy hover:text-white')}`}
                      >
                        <span className="material-symbols-outlined text-xl">{isTargetMaster ? 'shield_person' : 'verified_user'}</span>
                      </button>
                      <button 
                        onClick={() => onDelete(p)}
                        disabled={isDeletingId === p.id || isTargetMaster}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-red-50 text-red-500 hover:bg-red-500 hover:text-white ${isTargetMaster ? 'opacity-30' : ''}`}
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
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
