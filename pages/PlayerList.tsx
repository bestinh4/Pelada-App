
import React, { useState, useMemo } from 'react';
import { Player, Page, Match } from '../types.ts';
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
  const isCurrentUserAdmin = adminUser?.role === 'admin';

  const fieldSlots = match?.fieldSlots || 30;
  const gkSlots = match?.gkSlots || 4;

  const handleToggleAdmin = async (player: Player) => {
    if (!isCurrentUserAdmin || promotingId) return;
    
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
      // Admins primeiro na lista dentro de cada categoria
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

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-40">
      <header className="px-6 pt-12 pb-6 bg-white/80 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" alt="Logo" />
            <div>
              <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">CONVOCAÇÃO ELITE</h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">SITUAÇÃO DOS ATLETAS</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-navy shadow-sm active:scale-90 transition-all">
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
        />
      </main>
    </div>
  );
};

const Section = ({ title, color, badgeColor, list, countText, isWaitlist, isNotPlaying, isAdmin, onToggleAdmin, promotingId }: any) => (
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
      {list.map((p: Player) => (
        <div key={p.id} className={`bg-white rounded-[2rem] p-5 border border-slate-100 shadow-soft flex items-center gap-4 transition-all group ${isNotPlaying ? 'border-dashed' : 'hover:border-primary/20'}`}>
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 ${p.role === 'admin' ? 'border-amber-400 p-0.5' : 'border-slate-50'}`}>
              <img src={p.photoUrl} className="w-full h-full object-cover rounded-[14px]" alt={p.name} />
            </div>
            {p.role === 'admin' && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                <span className="material-symbols-outlined text-[14px] fill-1">military_tech</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <div className="truncate">
                <div className="flex items-center gap-1.5 mb-1">
                  <h4 className="font-black text-navy uppercase italic tracking-tight text-sm leading-none truncate">{p.name}</h4>
                  {p.role === 'admin' && (
                    <span className="text-[7px] font-black text-amber-500 border border-amber-200 px-1 rounded uppercase">STAFF</span>
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
                
                {/* Ferramenta de ADM para promover outros */}
                {isAdmin && (
                  <button 
                    onClick={() => onToggleAdmin(p)}
                    disabled={promotingId === p.id}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${p.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300 hover:bg-navy hover:text-white'}`}
                  >
                    {promotingId === p.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className={`material-symbols-outlined text-xl ${p.role === 'admin' ? 'fill-1' : ''}`}>
                        {p.role === 'admin' ? 'verified_user' : 'add_moderator'}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      {list.length === 0 && <p className="py-6 text-center text-[9px] font-black uppercase tracking-widest text-slate-300 border-2 border-dashed border-slate-50 rounded-[2rem]">Nenhum registro</p>}
    </div>
  </section>
);

export default PlayerList;
