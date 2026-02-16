
import React, { useState } from 'react';
import { Player, Page, Match } from '../types.ts';
import { MASTER_ADMIN_EMAIL } from '../constants.tsx';
import { db, doc, updateDoc, deleteDoc, collection } from '../services/firebase.ts';

interface PlayerListProps {
  players: Player[];
  currentUser: any;
  match: Match | null;
  onPageChange: (page: Page) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentUser, match, onPageChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
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
  
  // Lógica de separação para a mensagem
  const allPresent = players.filter(p => p.status === 'presente');
  const maxSlots = (match?.fieldSlots || 30) + (match?.gkSlots || 4);
  
  const confirmed = allPresent.slice(0, maxSlots);
  const waitingList = allPresent.length > maxSlots ? allPresent.slice(maxSlots) : [];
  const outPlayers = players.filter(p => p.status !== 'presente');

  const handleShareList = () => {
    const dateStr = match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : '--/--';
    const location = match?.location || 'A DEFINIR';
    const time = match?.time || '--:--';

    let message = `🏆 *PELADA OUSADIA & ALEGRIA* 🇭🇷\n`;
    message += `_Convocação Oficial para a Pelada_\n`;
    message += `-------------------------------------------\n\n`;
    message += `📍 *LOCAL:* ${location.toUpperCase()}\n`;
    message += `📅 *DATA:* ${dateStr.toUpperCase()}\n`;
    message += `⏰ *HORÁRIO:* ${time}H\n\n`;

    message += `✅ *CONFIRMADOS (${confirmed.length}/${maxSlots})*\n`;
    confirmed.forEach((p, i) => {
      const posIcon = p.position === 'Goleiro' ? '🧤' : '🏃';
      message += `${i + 1}. ${p.name.toUpperCase()} (${posIcon} ${p.position})\n`;
    });

    if (waitingList.length > 0) {
      message += `\n⏳ *LISTA DE ESPERA*\n`;
      waitingList.forEach((p, i) => {
        message += `${i + 1}. ${p.name.toUpperCase()} (AGUARDANDO VAGA)\n`;
      });
    }

    if (outPlayers.length > 0) {
      message += `\n❌ *NÃO DISPONÍVEIS / FORA*\n`;
      outPlayers.forEach((p) => {
        message += `- ${p.name.toUpperCase()}\n`;
      });
    }

    message += `\n-------------------------------------------\n`;
    message += `⚽ *Acesse o App:* https://ousadia.vercel.app\n`;
    message += `_Gestao Ousadia & Alegria_`;

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
             <button onClick={handleShareList} className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-soft-white active:scale-90 transition-all text-navy group">
                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">share</span>
             </button>
           </div>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">search</span>
          <input 
            type="text" placeholder="Buscar atleta no elenco..." value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-16 bg-white border border-slate-100 rounded-2xl pl-14 pr-6 text-[15px] font-bold text-navy outline-none shadow-soft-white focus:border-navy transition-all" 
          />
        </div>
      </header>

      <main className="space-y-14 pb-48">
        <PlayerSection 
          title="CONFIRMADOS" 
          list={allPresent.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))} 
          isAdmin={isCurrentUserAdmin} 
          onQuickToggle={async (p: Player) => {
            setProcessingId(p.id);
            await updateDoc(doc(db, "players", p.id), { status: 'pendente' });
            setProcessingId(null);
          }}
          onEdit={(p: Player) => {
            setSelectedPlayerForStats(p);
            setStatsData({ 
              goals: p.goals || 0, 
              assists: p.assists || 0, 
              role: (p.role as any) || 'player', 
              playerType: p.playerType || 'avulso', 
              status: p.status || 'pendente' 
            });
          }} 
          onDelete={async (p: Player) => {
            if (confirm(`Remover ${p.name.toUpperCase()} do racha?`)) {
              await deleteDoc(doc(db, "players", p.id));
            }
          }}
          processingId={processingId}
          type="confirmed"
        />

        <PlayerSection 
          title="FORA / PENDENTES" 
          list={outPlayers.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))} 
          isAdmin={isCurrentUserAdmin} 
          onQuickToggle={async (p: Player) => {
            setProcessingId(p.id);
            await updateDoc(doc(db, "players", p.id), { status: 'presente' });
            setProcessingId(null);
          }}
          onEdit={(p: Player) => {
            setSelectedPlayerForStats(p);
            setStatsData({ 
              goals: p.goals || 0, 
              assists: p.assists || 0, 
              role: (p.role as any) || 'player', 
              playerType: p.playerType || 'avulso', 
              status: p.status || 'pendente' 
            });
          }} 
          onDelete={async (p: Player) => {
            if (confirm(`Remover ${p.name.toUpperCase()} do elenco?`)) {
              await deleteDoc(doc(db, "players", p.id));
            }
          }}
          processingId={processingId}
          type="pending"
        />
      </main>

      {selectedPlayerForStats && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
           <div className="w-full max-w-[400px] bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <img src={selectedPlayerForStats.photoUrl} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" alt="" />
                    <div>
                      <h3 className="text-xl font-black text-navy uppercase italic tracking-tighter leading-none">{selectedPlayerForStats.name}</h3>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">CONFIGURAÇÕES DE ACESSO</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedPlayerForStats(null)} className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 active:scale-90">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>
              
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto hide-scrollbar relative">
                 <img src="https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.08] grayscale pointer-events-none" />

                 <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">GOLS</label>
                       <input type="number" value={statsData.goals} onChange={e => setStatsData({...statsData, goals: Number(e.target.value)})} className="w-full h-16 bg-slate-50 rounded-2xl border border-slate-100 font-black text-navy text-center text-2xl outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">ASSISTS</label>
                       <input type="number" value={statsData.assists} onChange={e => setStatsData({...statsData, assists: Number(e.target.value)})} className="w-full h-16 bg-slate-50 rounded-2xl border border-slate-100 font-black text-navy text-center text-2xl outline-none focus:border-primary" />
                    </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">MODALIDADE FINANCEIRA</label>
                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => setStatsData({...statsData, playerType: 'mensalista'})} className={`h-14 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${statsData.playerType === 'mensalista' ? 'bg-navy border-navy text-white shadow-elite' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>MENSALISTA</button>
                       <button onClick={() => setStatsData({...statsData, playerType: 'avulso'})} className={`h-14 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${statsData.playerType === 'avulso' ? 'bg-primary border-primary text-white shadow-glow-red' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>AVULSO</button>
                    </div>
                 </div>

                 {isCurrentUserAdmin && (
                   <div className="space-y-4 relative z-10">
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest px-1">CARGO NA ARENA</label>
                      <div className="grid grid-cols-2 gap-3">
                         <button onClick={() => setStatsData({...statsData, role: 'player'})} className={`h-14 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${statsData.role === 'player' ? 'bg-navy border-navy text-white shadow-elite' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>ATLETA</button>
                         <button onClick={() => setStatsData({...statsData, role: 'admin'})} className={`h-14 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${statsData.role === 'admin' ? 'bg-primary border-primary text-white shadow-glow-red' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>DIRETOR (ADM)</button>
                      </div>
                      {statsData.role === 'admin' && selectedPlayerForStats.email !== MASTER_ADMIN_EMAIL && (
                        <p className="text-[9px] font-bold text-primary uppercase text-center animate-pulse">Este ADM será isento de pagamentos 💼</p>
                      )}
                   </div>
                 )}
                 
                 <button 
                  onClick={async () => {
                    setIsSavingStats(true);
                    try {
                      await updateDoc(doc(db, "players", selectedPlayerForStats.id), statsData);
                      setSelectedPlayerForStats(null);
                    } catch (e) {
                      alert("Erro ao salvar permissões.");
                    } finally {
                      setIsSavingStats(false);
                    }
                  }}
                  className="w-full h-20 bg-navy text-white rounded-[2rem] font-black uppercase text-[12px] tracking-[0.2em] shadow-elite active:scale-95 transition-all mt-4 relative z-10"
                 >
                    {isSavingStats ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div> : "CONFIRMAR ALTERAÇÕES"}
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
      {list.length > 0 ? list.map((p: Player) => (
        <div key={p.id} className="bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-soft-white flex items-center justify-between group transition-all hover:border-navy/20">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img src={p.photoUrl} className="w-16 h-16 rounded-[1.5rem] object-cover border-2 border-slate-50 shadow-sm" alt="" />
              {isAdmin && (
                <button 
                  disabled={processingId === p.id}
                  onClick={() => onQuickToggle(p)}
                  className={`absolute -top-2 -right-2 w-8 h-8 rounded-xl border-2 border-white shadow-xl flex items-center justify-center transition-all ${p.status === 'presente' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-300'}`}
                >
                  {processingId === p.id ? <div className="w-3 h-3 border-2 border-current/20 border-t-current rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-[16px] font-black">{p.status === 'presente' ? 'check' : 'add'}</span>}
                </button>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h4 className="text-[16px] font-black text-navy uppercase italic leading-none">{p.name}</h4>
                {p.role === 'admin' && (
                  <span className={`text-white text-[7px] font-black px-2 py-0.5 rounded-md uppercase animate-pulse ${p.email === MASTER_ADMIN_EMAIL ? 'bg-navy shadow-elite' : 'bg-primary shadow-glow-red'}`}>
                    {p.email === MASTER_ADMIN_EMAIL ? 'MASTER' : 'DIRETORIA'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.position}</p>
                 <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                 <p className={`text-[10px] font-black uppercase tracking-widest ${p.playerType === 'mensalista' ? 'text-navy' : 'text-slate-300'}`}>{p.playerType || 'avulso'}</p>
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-3">
               <button onClick={() => onEdit(p)} className="w-11 h-11 rounded-2xl bg-slate-50 text-navy flex items-center justify-center border border-slate-100 hover:bg-navy hover:text-white transition-all">
                  <span className="material-symbols-outlined text-lg">edit_document</span>
               </button>
               <button onClick={() => onDelete(p)} className="w-11 h-11 rounded-2xl bg-red-50 text-primary flex items-center justify-center border border-red-100 hover:bg-primary hover:text-white transition-all">
                  <span className="material-symbols-outlined text-lg">delete</span>
               </button>
            </div>
          )}
        </div>
      )) : (
        <div className="py-10 text-center bg-slate-50/50 border border-dashed border-slate-100 rounded-[2rem]">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Nenhum atleta nesta categoria</p>
        </div>
      )}
    </div>
  </section>
);

export default PlayerList;
