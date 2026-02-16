
import React, { useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';
import { MASTER_ADMIN_EMAIL } from '../constants.tsx';
import { db, doc, updateDoc, setDoc, onSnapshot } from '../services/firebase.ts';

const Ranking: React.FC<{ players: Player[], currentUser: any, onPageChange: (page: Page) => void }> = ({ players, currentUser, onPageChange }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'todos' | 'pendentes' | 'pagos'>('todos');
  const [prices, setPrices] = useState({ mensalista: 60, avulso: 40 });

  const currentPlayer = players.find(p => p.id === currentUser?.uid);
  const isAdmin = currentPlayer?.role === 'admin' || currentUser?.email === MASTER_ADMIN_EMAIL;
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "finance"), (docSnap) => {
      if (docSnap.exists()) setPrices(docSnap.data() as any);
    });
    return () => unsub();
  }, []);

  const activePlayers = players.filter(p => p.status === 'presente');
  const totals = activePlayers.reduce((acc, p) => {
    if (p.position === 'Goleiro') return acc;
    const val = p.playerType === 'mensalista' ? prices.mensalista : prices.avulso;
    const paid = p.playerType === 'mensalista' ? p.monthlyPaid : p.paymentStatus === 'pago';
    if (paid) acc.paid += val; else acc.pending += val;
    return acc;
  }, { paid: 0, pending: 0 });

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-12 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-navy uppercase italic tracking-tighter leading-none">COFRE O&A</h2>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">GESTOR FINANCEIRO</p>
        </div>
        <img src={mainLogoUrl} className="w-12 h-12 animate-float" />
      </header>

      <main className="space-y-10">
        <div className="bg-white border border-slate-100 rounded-[3rem] p-10 relative overflow-hidden shadow-elite min-h-[300px] flex flex-col justify-between">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 opacity-[0.08] pointer-events-none animate-float">
              <img src={mainLogoUrl} className="w-full h-full object-contain grayscale" />
          </div>

          <div className="relative z-10">
            <span className="text-[11px] font-black text-navy/30 uppercase tracking-[0.4em] block mb-4 italic">TOTAL ARRECADADO</span>
            <h2 className="text-6xl font-condensed italic font-black text-navy tracking-tighter leading-none">
              R$ {totals.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="relative z-10 flex justify-between items-center pt-10 border-t border-slate-50">
            <div className="space-y-2">
               <span className="text-[10px] font-black text-primary uppercase tracking-widest">A RECEBER</span>
               <p className="text-3xl font-condensed italic font-black text-navy">R$ {totals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center border border-slate-100 text-navy">
               <span className="material-symbols-outlined text-4xl">payments</span>
            </div>
          </div>
        </div>

        <div className="flex bg-white border border-slate-100 p-2 rounded-full shadow-soft-white">
          {(['todos', 'pendentes', 'pagos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filter === f ? 'bg-navy text-white shadow-elite' : 'text-slate-300 hover:text-navy/60'}`}
            >
              {f === 'todos' ? 'GERAL' : f === 'pendentes' ? 'DÉBITO' : 'QUITADO'}
            </button>
          ))}
        </div>

        <div className="space-y-4 pb-48">
          {activePlayers.map((p) => {
            const isGoleiro = p.position === 'Goleiro';
            const isPaid = isGoleiro || (p.playerType === 'mensalista' ? p.monthlyPaid : p.paymentStatus === 'pago');
            return (
              <div key={p.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-5 flex items-center justify-between shadow-soft-white group hover:border-navy/20 transition-all">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img src={p.photoUrl} className="w-14 h-14 rounded-2xl object-cover border border-slate-50" alt="" />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${isPaid ? 'bg-success' : 'bg-primary'}`}>
                       <span className="material-symbols-outlined text-white text-[12px] font-black">{isPaid ? 'check' : 'priority_high'}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-black text-navy uppercase italic leading-none mb-1.5">{p.name}</h4>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{isGoleiro ? 'ISENTO 🧤' : p.playerType.toUpperCase()}</p>
                  </div>
                </div>
                {isAdmin && !isGoleiro && (
                  <button 
                    onClick={async () => {
                      setLoadingId(p.id);
                      const pRef = doc(db, "players", p.id);
                      if (p.playerType === 'mensalista') await updateDoc(pRef, { monthlyPaid: !p.monthlyPaid });
                      else await updateDoc(pRef, { paymentStatus: p.paymentStatus === 'pago' ? 'pendente' : 'pago' });
                      setLoadingId(null);
                    }}
                    className={`h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isPaid ? 'bg-slate-50 text-slate-400 border border-slate-100' : 'bg-primary text-white shadow-glow-red'}`}
                  >
                    {loadingId === p.id ? '...' : (isPaid ? 'REVERTER' : 'QUITAR')}
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
