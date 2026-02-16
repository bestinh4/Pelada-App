
import React, { useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';
import { MASTER_ADMIN_EMAIL } from '../constants.tsx';
import { db, doc, updateDoc, setDoc, onSnapshot } from '../services/firebase.ts';
import { GlassCard } from '../components/ui/GlassCard.tsx';

const Ranking: React.FC<{ players: Player[], currentUser: any, onPageChange: (page: Page) => void }> = ({ players, currentUser, onPageChange }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'todos' | 'pendentes' | 'pagos'>('todos');
  const [prices, setPrices] = useState({ mensalista: 60, avulso: 40 });

  const currentPlayer = players.find(p => p.id === currentUser?.uid);
  const isAdmin = currentPlayer?.role === 'admin' || currentUser?.email === MASTER_ADMIN_EMAIL;

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "finance"), (docSnap) => {
      if (docSnap.exists()) {
        setPrices(docSnap.data() as { mensalista: number, avulso: number });
      } else if (isAdmin) {
        setDoc(doc(db, "settings", "finance"), { mensalista: 60, avulso: 40 });
      }
    });
    return () => unsub();
  }, [isAdmin]);

  const activePlayers = players.filter(p => p.status === 'presente');
  const totals = activePlayers.reduce((acc, p) => {
    if (p.position === 'Goleiro') return acc;
    const isMensalista = p.playerType === 'mensalista';
    const value = isMensalista ? prices.mensalista : prices.avulso;
    const isPaid = isMensalista ? p.monthlyPaid : p.paymentStatus === 'pago';
    if (isPaid) acc.paid += value; else acc.pending += value;
    return acc;
  }, { paid: 0, pending: 0 });

  const filteredPlayers = activePlayers.filter(p => {
    if (p.position === 'Goleiro') return filter === 'todos' || filter === 'pagos';
    const isPaid = p.playerType === 'mensalista' ? p.monthlyPaid : p.paymentStatus === 'pago';
    if (filter === 'pendentes') return !isPaid;
    if (filter === 'pagos') return isPaid;
    return true;
  });

  const handleTogglePayment = async (player: Player) => {
    if (!isAdmin || loadingId || player.position === 'Goleiro') return;
    setLoadingId(player.id);
    try {
      const playerRef = doc(db, "players", player.id);
      if (player.playerType === 'mensalista') {
        await updateDoc(playerRef, { monthlyPaid: !player.monthlyPaid });
      } else {
        await updateDoc(playerRef, { paymentStatus: player.paymentStatus === 'pago' ? 'pendente' : 'pago' });
      }
    } catch (e) { alert("Erro ao processar."); } finally { setLoadingId(null); }
  };

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h2 className="text-2xl font-black text-navy uppercase italic tracking-tighter">COFRE O&A</h2>
        </div>
        <div className="bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full">
           <span className="text-[10px] font-black text-navy uppercase tracking-widest">{activePlayers.length} ATLETAS</span>
        </div>
      </header>

      <main className="space-y-8">
        {/* FINANCIAL SUMMARY CARD */}
        <div className="bg-navy rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-elite">
          <div className="absolute top-0 right-0 h-full w-2 bg-primary"></div>
          <div className="relative z-10">
            <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] block mb-3">ARRECADADO</span>
            <h2 className="text-5xl font-condensed italic leading-none tracking-tighter mb-10">
              R$ {totals.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            
            <div className="flex justify-between items-center pt-8 border-t border-white/10">
              <div className="space-y-1">
                 <span className="text-[9px] font-black text-primary-bright uppercase tracking-widest">A RECEBER</span>
                 <p className="text-2xl font-condensed italic font-black">R$ {totals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                 <span className="material-symbols-outlined text-white/40 text-3xl">payments</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS PILL STYLE */}
        <div className="flex bg-white border border-slate-100 p-1.5 rounded-full shadow-sm">
          {(['todos', 'pendentes', 'pagos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filter === f ? 'bg-navy text-white shadow-lg' : 'text-slate-300 hover:text-navy/50'}`}
            >
              {f === 'todos' ? 'TODOS' : f === 'pendentes' ? 'DÉBITO' : 'QUITADO'}
            </button>
          ))}
        </div>

        {/* PLAYER LIST */}
        <div className="space-y-3 pb-32">
          {filteredPlayers.map((p) => {
            const isGoleiro = p.position === 'Goleiro';
            const isPaid = isGoleiro || (p.playerType === 'mensalista' ? p.monthlyPaid : p.paymentStatus === 'pago');
            return (
              <div key={p.id} className="bg-white border border-slate-100 rounded-[2rem] p-3.5 flex items-center justify-between group shadow-soft-white hover:shadow-elite transition-all animate-slide-up">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={p.photoUrl} className="w-12 h-12 rounded-2xl object-cover border border-slate-50" alt="" />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${isPaid ? 'bg-success' : 'bg-primary'}`}>
                       <span className="material-symbols-outlined text-white text-[10px] font-bold">{isPaid ? 'check' : 'priority_high'}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-navy uppercase italic leading-none mb-1.5">{p.name}</h4>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{isGoleiro ? 'ISENTO 🧤' : (p.playerType === 'mensalista' ? 'MENSALISTA' : 'AVULSO')}</span>
                  </div>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => handleTogglePayment(p)}
                    disabled={isGoleiro || loadingId === p.id}
                    className={`h-11 px-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isPaid ? 'bg-slate-50 text-slate-400 border border-slate-100' : 'bg-primary text-white shadow-glow-red'}`}
                  >
                    {loadingId === p.id ? '...' : (isGoleiro ? 'FREE' : (isPaid ? 'EDITAR' : 'QUITAR'))}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Ranking;
