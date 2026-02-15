
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
    } catch (e) { alert("Erro ao salvar."); } finally { setLoadingId(null); }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="px-8 pt-12 pb-6 glass-white sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={mainLogoUrl} className="w-10 h-10 object-contain" alt="Logo" />
          <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter">FINANCEIRO</h2>
        </div>
        <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[8px] font-black text-navy uppercase tracking-widest">
           {activePlayers.length} ATIVOS
        </div>
      </header>

      <main className="px-6 mt-8">
        {/* CARD FINANCEIRO LIMPO */}
        <div className="bg-white rounded-[2.5rem] p-9 border border-slate-100 shadow-heavy relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-1 h-full bg-primary"></div>
          <div className="space-y-1 mb-8">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">TOTAL EM CAIXA</span>
            <h2 className="text-5xl font-condensed italic text-navy leading-none tracking-tighter">R$ {totals.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="flex items-center justify-between pt-6 border-t border-slate-50">
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">A RECEBER</span>
                <span className="text-lg font-black text-navy italic">R$ {totals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
             </div>
             <span className="material-symbols-outlined text-navy/10 text-4xl">receipt_long</span>
          </div>
        </div>

        {/* ABAS PADRONIZADAS */}
        <div className="flex bg-white p-1.5 rounded-3xl mb-10 border border-slate-100 shadow-sm">
          {(['todos', 'pendentes', 'pagos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-navy text-white shadow-lg' : 'text-slate-300 hover:text-navy'}`}
            >
              {f === 'todos' ? 'GERAL' : f === 'pendentes' ? 'DÉBITO' : 'OK'}
            </button>
          ))}
        </div>

        {/* LISTA SIMPLIFICADA */}
        <div className="space-y-4">
          {filteredPlayers.map((p, i) => {
            const isGoleiro = p.position === 'Goleiro';
            const isPaid = isGoleiro || (p.playerType === 'mensalista' ? p.monthlyPaid : p.paymentStatus === 'pago');
            return (
              <div key={p.id} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-pro flex items-center justify-between group animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img src={p.photoUrl} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 border-white flex items-center justify-center ${isPaid ? 'bg-success' : 'bg-primary'}`}>
                       <span className="material-symbols-outlined text-white text-[10px] font-bold">{isPaid ? 'check' : 'priority_high'}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-navy uppercase italic leading-none mb-1">{p.name}</h4>
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{p.playerType === 'mensalista' ? 'MENSAL' : 'AVULSO'} • R$ {isGoleiro ? 0 : (p.playerType === 'mensalista' ? prices.mensalista : prices.avulso)}</span>
                  </div>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => handleTogglePayment(p)}
                    disabled={isGoleiro}
                    className={`h-10 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${isPaid ? 'bg-slate-50 text-slate-300' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
                  >
                    {isGoleiro ? 'ISENTO' : (isPaid ? 'OK' : 'COBRAR')}
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
