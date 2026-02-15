
import React, { useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';
import { db, doc, updateDoc, setDoc, onSnapshot } from '../services/firebase.ts';

const Ranking: React.FC<{ players: Player[], currentUser: any, onPageChange: (page: Page) => void }> = ({ players, currentUser, onPageChange }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'todos' | 'pendentes' | 'pagos'>('todos');
  const [prices, setPrices] = useState({ mensalista: 60, avulso: 40 });

  const currentPlayer = players.find(p => p.id === currentUser?.uid);
  const isAdmin = currentPlayer?.role === 'admin';

  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

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
    } catch (e) { alert("Erro."); } finally { setLoadingId(null); }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="px-6 pt-10 pb-6 glass-header sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={mainLogoUrl} className="w-8 h-8 object-contain" alt="Logo" />
          <h2 className="text-base font-black text-navy uppercase italic tracking-tighter">COFRE ELITE</h2>
        </div>
        <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
           {activePlayers.length} ATIVOS
        </div>
      </header>

      <main className="px-5 mt-8 space-y-8">
        {/* SUMMARY CARD - REFINED */}
        <div className="bg-navy rounded-[2rem] p-7 text-white relative overflow-hidden shadow-elite">
          <div className="absolute top-0 right-0 h-full w-1.5 bg-primary"></div>
          <div className="space-y-0.5 mb-6">
             <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">TOTAL EM CAIXA</span>
             <h2 className="text-4xl font-condensed italic leading-none tracking-tighter">R$ {totals.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="flex justify-between items-center pt-5 border-t border-white/5">
             <div>
                <span className="text-[7px] font-black text-primary uppercase tracking-widest">PENDENTE</span>
                <p className="text-base font-black italic">R$ {totals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
             </div>
             <span className="material-symbols-outlined text-white/10 text-3xl">account_balance</span>
          </div>
        </div>

        {/* TABS - REFINED */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
          {(['todos', 'pendentes', 'pagos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-navy text-white shadow-lg shadow-navy/20' : 'text-slate-300'}`}
            >
              {f === 'todos' ? 'TODOS' : f === 'pendentes' ? 'DÉBITO' : 'PAGOS'}
            </button>
          ))}
        </div>

        {/* COMPACT PLAYER LIST */}
        <div className="space-y-2">
          {filteredPlayers.map((p, i) => {
            const isGoleiro = p.position === 'Goleiro';
            const isPaid = isGoleiro || (p.playerType === 'mensalista' ? p.monthlyPaid : p.paymentStatus === 'pago');
            return (
              <div key={p.id} className="bg-white rounded-2xl p-3 border border-slate-100 flex items-center justify-between group transition-all">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={p.photoUrl} className="w-9 h-9 rounded-lg object-cover grayscale opacity-80" alt="" />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-md border-2 border-white flex items-center justify-center ${isPaid ? 'bg-success' : 'bg-primary'}`}>
                       <span className="material-symbols-outlined text-white text-[8px] font-bold">{isPaid ? 'check' : 'priority_high'}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-navy uppercase italic leading-none mb-0.5">{p.name}</h4>
                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">{isGoleiro ? 'ISENTO' : (p.playerType === 'mensalista' ? 'MENSAL' : 'AVULSO')}</span>
                  </div>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => handleTogglePayment(p)}
                    disabled={isGoleiro}
                    className={`h-9 px-4 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${isPaid ? 'bg-slate-50 text-slate-300' : 'bg-primary text-white shadow-lg shadow-primary/10'}`}
                  >
                    {isGoleiro ? 'FREE' : (isPaid ? 'OK' : 'COBRAR')}
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
