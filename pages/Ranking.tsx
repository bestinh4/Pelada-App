
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
    <div className="flex flex-col">
      <header className="px-8 pt-12 pb-6 glass-header sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={mainLogoUrl} className="w-9 h-9 object-contain" alt="Logo" />
          <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter">FINANCEIRO</h2>
        </div>
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
           {activePlayers.length} ATLETAS
        </div>
      </header>

      <main className="px-6 mt-8">
        {/* SUMMARY CARD */}
        <div className="bg-navy rounded-[2.5rem] p-9 text-white relative overflow-hidden mb-10 shadow-elite">
          <div className="absolute top-0 right-0 h-full w-1.5 bg-primary"></div>
          <div className="space-y-1 mb-8">
             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">SALDO EM CAIXA</span>
             <h2 className="text-5xl font-condensed italic leading-none tracking-tighter">R$ {totals.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-white/10">
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">A RECEBER</span>
                <span className="text-lg font-black italic">R$ {totals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
             </div>
             <span className="material-symbols-outlined text-white/20 text-4xl">payments</span>
          </div>
        </div>

        {/* TABS */}
        <div className="flex bg-white p-1.5 rounded-3xl mb-8 border border-slate-100 shadow-elite">
          {(['todos', 'pendentes', 'pagos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-navy text-white' : 'text-slate-300'}`}
            >
              {f === 'todos' ? 'GERAL' : f === 'pendentes' ? 'DÉBITO' : 'OK'}
            </button>
          ))}
        </div>

        {/* PLAYER LIST */}
        <div className="space-y-3">
          {filteredPlayers.map((p, i) => {
            const isGoleiro = p.position === 'Goleiro';
            const isPaid = isGoleiro || (p.playerType === 'mensalista' ? p.monthlyPaid : p.paymentStatus === 'pago');
            return (
              <div key={p.id} className="bg-white rounded-[1.8rem] p-4 border border-slate-100 flex items-center justify-between group animate-in slide-in-from-bottom-5" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={p.photoUrl} className="w-11 h-11 rounded-xl object-cover" alt="" />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 border-white flex items-center justify-center ${isPaid ? 'bg-success' : 'bg-primary'}`}>
                       <span className="material-symbols-outlined text-white text-[10px] font-bold">{isPaid ? 'check' : 'priority_high'}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-navy uppercase italic leading-none mb-1">{p.name}</h4>
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{isGoleiro ? 'ISENTO' : (p.playerType === 'mensalista' ? 'MENSALISTA' : 'AVULSO')}</span>
                  </div>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => handleTogglePayment(p)}
                    disabled={isGoleiro}
                    className={`h-10 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isPaid ? 'bg-slate-50 text-slate-300' : 'bg-primary text-white shadow-button'}`}
                  >
                    {isGoleiro ? 'FREE' : (isPaid ? 'PAGO' : 'PAGAR')}
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
