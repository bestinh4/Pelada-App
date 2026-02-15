
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
    // REGRA DE OURO: Goleiro não paga nada
    if (p.position === 'Goleiro') return acc;

    const isMensalista = p.playerType === 'mensalista';
    const value = isMensalista ? prices.mensalista : prices.avulso;
    
    // Lógica: Mensalista depende do monthlyPaid, Avulso do paymentStatus
    const isPaid = isMensalista ? p.monthlyPaid : p.paymentStatus === 'pago';

    if (isPaid) {
      acc.paid += value;
    } else {
      acc.pending += value;
    }
    return acc;
  }, { paid: 0, pending: 0 });

  const filteredPlayers = activePlayers.filter(p => {
    // Goleiros sempre aparecem nos "pagos" ou "todos", pois não têm dívida
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
      alert("Erro ao salvar pagamento.");
    } finally {
      setLoadingId(null);
    }
  };

  const sendWhatsAppReminder = (player: Player) => {
    const isMensalista = player.playerType === 'mensalista';
    const value = isMensalista ? prices.mensalista : prices.avulso;
    const msg = `🇭🇷 *ARENA O&A ELITE PRO*\n\nFala *${player.name}*, passando para lembrar da sua contribuição para a arena!\n\n📋 Tipo: *${isMensalista ? 'Mensalidade' : 'Taxa Avulsa'}*\n💰 Valor: *R$ ${value},00*\n\n📲 PIX: *diiogo49@gmail.com*\n\nBora pra cima! ⚽🔥`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-32 relative z-10">
      <header className="px-6 pt-12 pb-6 glass sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" alt="Logo" />
            <div>
              <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">CAIXA & FINANÇAS</h2>
              <p className="text-[8px] font-black text-primary uppercase tracking-[0.4em] mt-1">EDIÇÃO CROÁCIA 🇭🇷</p>
            </div>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsEditingPrices(!isEditingPrices)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isEditingPrices ? 'bg-primary text-white shadow-lg' : 'bg-slate-50 text-navy border border-slate-100 shadow-sm'}`}
            >
              <span className="material-symbols-outlined text-xl">{isEditingPrices ? 'close' : 'settings_suggest'}</span>
            </button>
          )}
        </div>
      </header>

      <section className="px-6 mt-8">
        {/* TABELA DE PREÇOS (SÓ ADM) */}
        {isAdmin && isEditingPrices && (
          <div className="mb-8 bg-navy rounded-[2.5rem] p-8 text-white animate-scale-in shadow-2xl border-4 border-primary/20">
             <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">currency_exchange</span>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">REAJUSTE DE TABELA</h3>
             </div>
             <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-white/40 uppercase ml-1">MENSALISTAS</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/30">R$</span>
                    <input 
                      type="number" 
                      value={prices.mensalista}
                      onChange={(e) => setPrices({...prices, mensalista: Number(e.target.value)})}
                      className="w-full h-14 bg-white/10 border border-white/10 rounded-2xl pl-10 pr-4 font-black text-white outline-none focus:bg-white/20 transition-all text-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-white/40 uppercase ml-1">AVULSOS</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/30">R$</span>
                    <input 
                      type="number" 
                      value={prices.avulso}
                      onChange={(e) => setPrices({...prices, avulso: Number(e.target.value)})}
                      className="w-full h-14 bg-white/10 border border-white/10 rounded-2xl pl-10 pr-4 font-black text-white outline-none focus:bg-white/20 transition-all text-xl"
                    />
                  </div>
                </div>
             </div>
             <p className="text-[7px] text-white/40 font-black tracking-widest text-center uppercase mb-6">* Goleiros possuem isenção de 100% no sistema Elite.</p>
             <button 
              onClick={() => {
                setDoc(doc(db, "settings", "finance"), prices);
                setIsEditingPrices(false);
              }}
              className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
             >
               CONSOLIDAR VALORES
             </button>
          </div>
        )}

        {/* RESUMO FINANCEIRO */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="bg-navy rounded-[2.5rem] p-8 text-white shadow-pro relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                <span className="material-symbols-outlined text-8xl">payments</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-2">ARRECADAÇÃO LÍQUIDA</span>
                <h2 className="text-5xl font-condensed italic leading-none text-white">R$ {totals.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                   <div>
                      <span className="text-[8px] font-black text-primary uppercase tracking-widest block mb-1">A RECEBER</span>
                      <span className="text-xl font-black text-white/90">R$ {totals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="text-right">
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">DATA</span>
                      <span className="text-[10px] font-black text-white/60 uppercase">{new Date().toLocaleDateString('pt-BR')}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl mb-10 border border-slate-200 backdrop-blur-sm">
          {(['todos', 'pendentes', 'pagos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-navy shadow-md scale-[1.02] border border-slate-100' : 'text-slate-400 hover:text-navy'}`}
            >
              {f === 'todos' ? 'CONVOCADOS' : f === 'pendentes' ? 'DÉBITOS' : 'LIQUIDADOS'}
            </button>
          ))}
        </div>

        {/* LISTA DE PAGAMENTOS */}
        <div className="space-y-4">
          {filteredPlayers.length > 0 ? filteredPlayers.map((p, i) => {
            const isGoleiro = p.position === 'Goleiro';
            const isMensalista = p.playerType === 'mensalista';
            const isPaid = isGoleiro || (isMensalista ? p.monthlyPaid : p.paymentStatus === 'pago');
            const value = isGoleiro ? 0 : (isMensalista ? prices.mensalista : prices.avulso);
            const isProcessing = loadingId === p.id;

            return (
              <div key={p.id} className={`bg-white rounded-[2rem] p-5 border shadow-pro flex items-center justify-between group animate-slide-up ${isGoleiro ? 'border-amber-100 bg-amber-50/20' : 'border-slate-50'}`} style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 ${isGoleiro ? 'border-amber-400' : (isMensalista ? 'border-navy' : 'border-slate-100')} shadow-sm bg-slate-50`}>
                      <img 
                        src={p.photoUrl && p.photoUrl !== "" ? p.photoUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=003876&color=fff`} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                        alt={p.name} 
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=003876&color=fff`; }}
                      />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center border-2 border-white shadow-md ${isGoleiro ? 'bg-amber-500' : (isMensalista ? 'bg-navy' : 'bg-slate-400')}`}>
                       <span className="material-symbols-outlined text-white text-[12px] fill-1">
                         {isGoleiro ? 'verified' : (isMensalista ? 'calendar_today' : 'confirmation_number')}
                       </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-navy uppercase italic leading-none mb-1.5">{p.name}</h4>
                    <div className="flex items-center gap-2">
                       <span className={`text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${isGoleiro ? 'bg-amber-100 text-amber-700' : (isMensalista ? 'bg-navy/5 text-navy' : 'bg-slate-100 text-slate-500')}`}>
                         {isGoleiro ? 'GOLEIRO ISENTO' : (isMensalista ? 'MENSALISTA' : 'AVULSO')}
                       </span>
                       {!isGoleiro && <span className="text-[10px] font-black text-slate-300 italic">R$ {value}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isPaid && !isGoleiro && isAdmin && (
                    <button 
                      onClick={() => sendWhatsAppReminder(p)}
                      className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 active:scale-90 transition-all shadow-sm"
                    >
                       <span className="material-symbols-outlined text-xl">chat</span>
                    </button>
                  )}
                  {isAdmin ? (
                    <button 
                      type="button"
                      disabled={isProcessing || isGoleiro}
                      onClick={() => handleTogglePayment(p)}
                      className={`min-w-[100px] h-11 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 border ${isPaid ? (isGoleiro ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20') : 'bg-primary text-white border-primary shadow-lg shadow-primary/20'}`}
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">{isPaid ? 'check_circle' : 'payments'}</span>
                          {isGoleiro ? 'PAREDÃO' : (isPaid ? 'PAGO' : 'CONFIRMAR')}
                        </>
                      )}
                    </button>
                  ) : (
                    <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border ${isPaid ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                      {isPaid ? 'CONCLUÍDO' : 'PENDENTE'}
                    </div>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white/50 backdrop-blur-sm">
               <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">account_balance_wallet</span>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Nenhum registro ativo</p>
            </div>
          )}
        </div>
      </section>

      {isAdmin && activePlayers.length > 0 && (
        <div className="px-6 mt-12 mb-20">
          <button 
            type="button"
            onClick={() => window.print()}
            className="w-full h-18 bg-navy text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl shadow-navy/30 border-b-4 border-primary"
          >
            <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
            EXPORTAR FECHAMENTO 🇭🇷
          </button>
        </div>
      )}
    </div>
  );
};

export default Ranking;
