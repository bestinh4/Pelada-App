import React, { useState, useMemo } from 'react';
import { Player, Page, Match } from '../types.ts';
import { MASTER_ADMIN_EMAIL } from '../constants.tsx';
import { db, doc, updateDoc } from '../services/firebase.ts';

interface PlayerListProps {
  players: Player[];
  currentUser: any;
  match: Match | null;
  onPageChange: (page: Page) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentUser, match, onPageChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const adminUser = players.find(p => p.id === currentUser?.uid);
  const isCurrentUserAdmin = adminUser?.role === 'admin' || currentUser?.email === MASTER_ADMIN_EMAIL;

  const fieldSlots = match?.fieldSlots || 30;
  const gkSlots = match?.gkSlots || 4;

  const handleToggleAdmin = async (player: Player) => {
    if (!isCurrentUserAdmin || promotingId) return;
    
    if (player.id === currentUser?.uid && currentUser?.email === MASTER_ADMIN_EMAIL) {
       alert("Você é o Master Admin. Sua hierarquia é absoluta.");
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

    return { confirmed, waitlist, notPlaying };
  }, [players, searchQuery, fieldSlots, gkSlots]);

  const handleShareList = () => {
    if (!match) {
      alert("Nenhuma partida agendada para compartilhar.");
      return;
    }

    const dateStr = new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { 
      weekday: 'long', day: '2-digit', month: 'long' 
    });

    // Link da aplicação
    const appUrl = window.location.origin;

    // Monta a mensagem com ícones reconhecíveis e a bandeira da croácia 🇭🇷
    let message = `⚽ *CONVOCAÇÃO O&A ELITE* ⚽\n\n`;
    message += `📍 *Local:* ${match.location} 🇭🇷\n`;
    message += `📅 *Data:* ${dateStr}\n`;
    message += `⏰ *Hora:* ${match.time}h\n\n`;

    message += `✅ *CONFIRMADOS (${groupedPlayers.confirmed.length}):*\n`;
    groupedPlayers.confirmed.forEach((p, index) => {
      message += `${index + 1}. ${p.name} (${p.position})${p.role === 'admin' ? ' ⭐' : ''}\n`;
    });

    if (groupedPlayers.waitlist.length > 0) {
      message += `\n⏳ *LISTA DE ESPERA:* \n`;
      groupedPlayers.waitlist.forEach((p, index) => {
        message += `${index + 1}. ${p.name} (${p.position})\n`;
      });
    }

    // Link direto para o app
    message += `\n🔗 *Confirme sua presença pelo App:* \n${appUrl}\n`;
    message += `\n_Ousadia & Alegria_ 🔥`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-40 relative">
      <header className="px-6 pt-12 pb-6 bg-white/80 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" alt="Logo" />
            <div>
              <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">CONVOCAÇÃO ELITE</h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">SITUAÇÃO DOS ATLETAS</p>
            </div>
          </div>
          <button 
            onClick={handleShareList}
            className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-navy shadow-sm active:scale-90 transition-all hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100"
            title="Compartilhar no WhatsApp"
          >
            <span className="material-symbols-outlined text-xl">ios_share</span>
          </button>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xl">search</span>
          <input 
            type="text"
            placeholder="Filtrar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-navy placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
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
          promotingId={promotingId}
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
          promotingId={promotingId}
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
          promotingId={promotingId}
          currentUser={currentUser}
        />
      </main>

      <div className="fixed bottom-32 right-8 z-50">
        <button 
          onClick={handleShareList}
          className="w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 hover:scale-105 border-4 border-white"
          title="Compartilhar Lista no WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

const Section = ({ title, color, badgeColor, list, countText, isWaitlist, isNotPlaying, isAdmin, onToggleAdmin, promotingId, currentUser }: any) => (
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
      {list.map((p: Player) => {
        const isTargetMaster = p.id === currentUser?.uid && currentUser?.email === MASTER_ADMIN_EMAIL;
        
        return (
          <div key={p.id} className={`bg-white rounded-[2rem] p-5 border border-slate-100 shadow-soft flex items-center gap-4 transition-all group ${isNotPlaying ? 'border-dashed' : 'hover:border-primary/20'}`}>
            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 ${p.role === 'admin' ? (isTargetMaster ? 'border-primary ring-4 ring-primary/10 shadow-glow' : 'border-amber-400 p-0.5') : 'border-slate-50'}`}>
                <img src={p.photoUrl} className="w-full h-full object-cover rounded-[14px]" alt={p.name} />
              </div>
              {p.role === 'admin' && (
                <div className={`absolute -top-2 -right-2 w-6 h-6 ${isTargetMaster ? 'bg-primary' : 'bg-amber-400'} text-white rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce`}>
                  <span className="material-symbols-outlined text-[14px] fill-1">{isTargetMaster ? 'star' : 'military_tech'}</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <div className="truncate">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h4 className="font-black text-navy uppercase italic tracking-tight text-sm leading-none truncate">{p.name}</h4>
                    {p.role === 'admin' && (
                      <span className={`text-[7px] font-black ${isTargetMaster ? 'text-primary border-primary' : 'text-amber-500 border-amber-200'} border px-1 rounded uppercase animate-pulse`}>
                        {isTargetMaster ? 'MASTER ADM' : 'STAFF'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isWaitlist ? 'bg-amber-500' : isNotPlaying ? 'bg-slate-300' : 'bg-emerald-500'}`}></div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">{p.position}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!isNotPlaying && (
                    <div className="flex items-center gap-1.5 bg-primary/5 px-2.5 py-1 rounded-lg">
                      <span className="text-[12px] font-black text-primary">{p.goals}</span>
                      <span className="material-symbols-outlined text-primary text-[14px] fill-1">sports_soccer</span>
                    </div>
                  )}
                  
                  {isAdmin && (
                    <button 
                      onClick={() => onToggleAdmin(p)}
                      disabled={promotingId === p.id || isTargetMaster}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isTargetMaster ? 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-50' : (p.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300 hover:bg-navy hover:text-white')}`}
                    >
                      {promotingId === p.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className={`material-symbols-outlined text-xl ${(p.role === 'admin' && !isTargetMaster) ? 'fill-1' : ''}`}>
                          {isTargetMaster ? 'shield_person' : (p.role === 'admin' ? 'verified_user' : 'add_moderator')}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

export default PlayerList;