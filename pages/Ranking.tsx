
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
    } catch (e) { 
      console.error("Erro ao atualizar pagamento:", e);
      alert("Erro ao processar pagamento."); 
    } finally { 
      setLoadingId(null); 
    }
  };

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h2 className="text-xl font-black text-navy uppercase italic tracking-tighter">COFRE ELITE</h2>
        </div>
        <div className="bg-navy/5 px-3 py-1 rounded-full">
           <span className="text-[8px] font-black text-navy uppercase tracking-widest">{activePlayers.length} ATIVOS</span>
        </div>
      </header>

      <main className="space-y-10">
        {/* FINANCIAL HERO CARD */}
        <div className="bg-navy rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-elite">
          <div className="absolute top-0 right-0 h-full w-2 bg-primary"></div>
          <div className="relative z-10">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-2">SALDO EM CAIXA</span>
            <h2 className="text-5xl font-condensed italic leading-none tracking-tighter mb-8">
              R$ {totals.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            
            <div className="flex justify-between items-center pt-8 border-t border-white/10">
              <div className="space-y-1">
                 <span className="text-[9px] font-black text-primary-bright uppercase tracking-widest">A RECEBER</span>
                 <p className="text-xl font-condensed italic font-black">R$ {totals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                 <span className="material-symbols-outlined text-white/20 text-3xl">payments</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS EDITORIAL STYLE */}
        <div className="flex glass-surface p-1.5 rounded-[1.5rem]">
          {(['todos', 'pendentes', 'pagos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${filter === f ? 'bg-navy text-white shadow-lg shadow-navy/20' : 'text-slate-400'}`}
            >
              {f === 'todos' ? 'FULL' : f === 'pendentes' ? 'DÉBITO' : 'OK'}
            </button>
          ))}
        </div>

        {/* PLAYER LIST */}
        <div className="space-y-3 pb-32">
          {filteredPlayers.length > 0 ? filteredPlayers.map((p) => {
            const isGoleiro = p.position === 'Goleiro';
            const isPaid = isGoleiro || (p.playerType === 'mensalista' ? p.monthlyPaid : p.paymentStatus === 'pago');
            return (
              <GlassCard key={p.id} className="!p-3 border-white/80 flex items-center justify-between group transition-all animate-slide-up">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={p.photoUrl} className="w-11 h-11 rounded-xl object-cover border border-slate-100" alt="" />
                    <div className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-lg border-2 border-white flex items-center justify-center shadow-glass ${isPaid ? 'bg-success' : 'bg-primary'}`}>
                       <span className="material-symbols-outlined text-white text-[10px] font-bold">{isPaid ? 'check' : 'priority_high'}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-black text-navy uppercase italic leading-none mb-1">{p.name}</h4>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{isGoleiro ? 'ISENTO' : (p.playerType === 'mensalista' ? 'MENSALISTA' : 'AVULSO')}</span>
                  </div>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => handleTogglePayment(p)}
                    disabled={isGoleiro || loadingId === p.id}
                    className={`h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-90 ${isPaid ? 'bg-slate-100 text-slate-400' : 'bg-primary text-white shadow-elite shadow-primary/10'}`}
                  >
                    {loadingId === p.id ? '...' : (isGoleiro ? 'FREE' : (isPaid ? 'REVER' : 'QUITAR'))}
                  </button>
                )}
              </GlassCard>
            );
          }) : (
            <div className="py-20 text-center glass-surface rounded-[2rem] border-dashed">
              <span className="material-symbols-outlined text-slate-200 text-4xl mb-4">search_off</span>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">Nenhum registro<br/>encontrado nesta categoria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Ranking;
