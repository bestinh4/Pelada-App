
import React, { useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';
import { db, doc, updateDoc, setDoc, onSnapshot } from '../services/firebase.ts';

const Ranking: React.FC<{ players: Player[], currentUser: any, onPageChange: (page: Page) => void }> = ({ players, currentUser, onPageChange }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'todos' | 'pendentes' | 'pagos'>('todos');
  const [isEditingPrices, setIsEditingPrices] = useState(false);
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
        await updateDoc(playerRef, { 
          monthlyPaid: !player.monthlyPaid,
          lastPaymentDate: !player.monthlyPaid ? new Date().toISOString() : null
        });
      } else {
        const newStatus = player.paymentStatus === 'pago' ? 'pendente' : 'pago';
        await updateDoc(playerRef, { paymentStatus: newStatus });
      }
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setLoadingId(null);
    }
  };

  const sendWhatsAppReminder = (player: Player) => {
    const isMensalista = player.playerType === 'mensalista';
    const value = isMensalista ? prices.mensalista : prices.avulso;
    const msg = `⚽ *ARENA O&A ELITE* 🇭🇷\n\nOlá *${player.name}*! Passando para lembrar da sua pendência na arena.\n\n📌 Tipo: *${isMensalista ? 'Mensalidade' : 'Taxa de Pelada'}*\n💰 Valor: *R$ ${value},00*\n\nPIX da Arena: *diiogo49@gmail.com*\n\nFavor enviar o comprovante após o pagamento! 🔥`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6 glass-white sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" alt="Logo" />
            <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">CAIXA & GESTÃO</h2>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsEditingPrices(!isEditingPrices)}
              className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-navy shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-2xl">{isEditingPrices ? 'close' : 'settings'}</span>
            </button>
          )}
        </div>
      </header>

      <section className="px-6 mt-8">
        {/* FINANCE CARD - REFINED GEOMETRY */}
        <div className="bg-white rounded-[2.5rem] p-9 border border-slate-100 shadow-heavy relative overflow-hidden mb-10 group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-croatia-pattern opacity-[0.03] group-hover:opacity-[0.07] transition-opacity"></div>
           <div className="relative z-10 flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em] mb-3 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-success"></span>
                 SALDO EM CAIXA
              </span>
              <h2 className="text-5xl font-condensed italic text-navy leading-none mb-8 tracking-tighter">R$ {totals.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PENDÊNCIAS</span>
                    <span className="text-lg font-black text-primary italic leading-none">R$ {totals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                 </div>
                 <span className="material-symbols-outlined text-primary/20 text-3xl">account_balance_wallet</span>
              </div>
           </div>
        </div>

        {/* REFINED TABS */}
        <div className="flex bg-white p-1.5 rounded-[1.8rem] mb-10 border border-slate-100 shadow-sm">
          {(['todos', 'pendentes', 'pagos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-3.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-navy text-white shadow-heavy' : 'text-slate-300 hover:text-navy'}`}
            >
              {f === 'todos' ? 'TODOS' : f === 'pendentes' ? 'DÉBITOS' : 'OK'}
            </button>
          ))}
        </div>

        {/* REFINED LIST */}
        <div className="space-y-4">
          {filteredPlayers.length > 0 ? filteredPlayers.map((p, i) => {
            const isGoleiro = p.position === 'Goleiro';
            const isMensalista = p.playerType === 'mensalista';
            const isPaid = isGoleiro || (isMensalista ? p.monthlyPaid : p.paymentStatus === 'pago');
            const value = isGoleiro ? 0 : (isMensalista ? prices.mensalista : prices.avulso);

            return (
              <div key={p.id} className="bg-white rounded-[2.2rem] p-5 border border-slate-100 shadow-pro flex items-center justify-between group transition-all animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-50 relative">
                    <img 
                      src={p.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=003876&color=fff`} 
                      className="w-full h-full object-cover" 
                      alt={p.name}
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center border-2 border-white shadow-sm ${isPaid ? 'bg-success' : 'bg-primary'}`}>
                       <span className="material-symbols-outlined text-white text-[10px] font-bold">{isPaid ? 'check' : 'priority_high'}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[14px] font-black text-navy uppercase italic leading-none mb-1.5">{p.name}</h4>
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                          {isGoleiro ? 'PAREDÃO' : (isMensalista ? 'MENSALISTA' : 'AVULSO')}
                       </span>
                       <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                       <span className="text-[10px] font-black text-navy italic">R$ {value}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!isPaid && isAdmin && (
                    <button onClick={() => sendWhatsAppReminder(p)} className="w-12 h-12 rounded-[1.2rem] bg-slate-50 text-success flex items-center justify-center border border-slate-100 active:scale-90 transition-all shadow-sm">
                       <span className="material-symbols-outlined text-xl">chat</span>
                    </button>
                  )}
                  {isAdmin ? (
                    <button 
                      onClick={() => handleTogglePayment(p)}
                      disabled={isGoleiro}
                      className={`h-12 px-6 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${isPaid ? 'bg-slate-50 text-slate-300 border border-slate-100' : 'bg-primary text-white shadow-heavy'}`}
                    >
                      {isGoleiro ? 'ISENTO' : (isPaid ? 'PAGO' : 'COBRAR')}
                    </button>
                  ) : (
                    <div className={`px-5 py-2.5 rounded-[1rem] text-[9px] font-black uppercase tracking-widest border ${isPaid ? 'text-success border-success/20 bg-success/5' : 'text-slate-300 border-slate-100 bg-slate-50'}`}>
                      {isPaid ? 'OK' : 'PENDENTE'}
                    </div>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="py-24 text-center text-slate-300 flex flex-col items-center gap-4">
               <span className="material-symbols-outlined text-5xl opacity-20">history_edu</span>
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sem registros no momento</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Ranking;
