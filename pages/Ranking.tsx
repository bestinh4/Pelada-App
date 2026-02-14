
import React, { useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';
import { db, doc, updateDoc, setDoc, onSnapshot } from '../services/firebase.ts';

const Ranking: React.FC<{ players: Player[], currentUser: any, onPageChange: (page: Page) => void }> = ({ players, currentUser, onPageChange }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'todos' | 'pendentes' | 'pagos'>('todos');
  const [isEditingPrices, setIsEditingPrices] = useState(false);
  const [prices, setPrices] = useState({ mensalista: 60, avulso: 40 });
  const [isSavingPrices, setIsSavingPrices] = useState(false);

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

  // Jogadores que confirmaram presença na pelada atual
  const activePlayers = players.filter(p => p.status === 'presente');

  const totals = activePlayers.reduce((acc, p) => {
    // REGRA: Goleiro não paga
    if (p.position === 'Goleiro') return acc;

    const isMensalista = p.playerType === 'mensalista';
    const value = isMensalista ? prices.mensalista : prices.avulso;
    
    const isPaid = isMensalista ? p.monthlyPaid : p.paymentStatus === 'pago';

    if (isPaid) {
      acc.paid += value;
    } else {
      acc.pending += value;
    }
    return acc;
  }, { paid: 0, pending: 0 });

  const filteredPlayers = activePlayers.filter(p => {
    if (p.position === 'Goleiro') return filter === 'todos' || filter === 'pagos'; // Goleiro sempre aparece como "pago/resolvido"
    
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

  const saveNewPrices = async () => {
    if (!isAdmin) return;
    setIsSavingPrices(true);
    try {
      await setDoc(doc(db, "settings", "finance"), prices);
      setIsEditingPrices(false);
    } catch (err) {
      alert("Erro ao salvar novos valores.");
    } finally {
      setIsSavingPrices(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-32">
      <header className="px-6 pt-12 pb-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" alt="Logo" />
            <div>
              <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">CAIXA DA ARENA</h2>
              <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mt-1">SISTEMA DE COBRANÇA ELITE</p>
            </div>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsEditingPrices(!isEditingPrices)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isEditingPrices ? 'bg-primary text-white' : 'bg-slate-50 text-navy border border-slate-100'}`}
            >
              <span className="material-symbols-outlined text-xl">{isEditingPrices ? 'close' : 'settings'}</span>
            </button>
          )}
        </div>
      </header>

      <section className="px-6 mt-6">
        {isAdmin && isEditingPrices && (
          <div className="mb-8 bg-navy rounded-[2.5rem] p-8 text-white animate-scale-in shadow-2xl shadow-navy/20">
             <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">payments</span>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">TABELA DE PREÇOS</h3>
             </div>
             <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-white/40 uppercase ml-1">MENSALIDADE</label>
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
                  <label className="text-[8px] font-black text-white/40 uppercase ml-1">AVULSO</label>
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
             <p className="text-[7px] text-white/40 uppercase font-black tracking-widest text-center mb-6 italic">* Goleiros possuem isenção automática no sistema.</p>
             <button 
              onClick={saveNewPrices}
              disabled={isSavingPrices}
              className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
             >
               {isSavingPrices ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'ATUALIZAR PREÇOS'}
             </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-soft relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-5xl text-emerald-500">account_balance_wallet</span>
             </div>
             <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 block mb-2">RECEBIDO</span>
             <h2 className="text-3xl font-condensed italic leading-none text-emerald-500">R$ {totals.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
             <div className="mt-4 h-1 w-12 bg-emerald-500 rounded-full"></div>
          </div>
          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-soft relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-5xl text-primary">error</span>
             </div>
             <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 block mb-2">PENDENTE</span>
             <h2 className="text-3xl font-condensed italic leading-none text-primary">R$ {totals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
             <div className="mt-4 h-1 w-12 bg-primary rounded-full"></div>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 border border-slate-200">
          {(['todos', 'pendentes', 'pagos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${filter === f ? 'bg-white text-navy shadow-md scale-[1.02]' : 'text-slate-400 hover:text-navy'}`}
            >
              {f === 'todos' ? 'TODOS' : f === 'pendentes' ? 'DÍVIDA' : 'OK'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredPlayers.length > 0 ? filteredPlayers.map((p, i) => {
            const isGoleiro = p.position === 'Goleiro';
            const isMensalista = p.playerType === 'mensalista';
            const isPaid = isGoleiro || (isMensalista ? p.monthlyPaid : p.paymentStatus === 'pago');
            const value = isGoleiro ? 0 : (isMensalista ? prices.mensalista : prices.avulso);
            const isProcessing = loadingId === p.id;

            return (
              <div key={p.id} className={`bg-white rounded-[2rem] p-5 border shadow-soft flex items-center justify-between group animate-slide-in-right ${isGoleiro ? 'border-amber-100 bg-amber-50/10' : 'border-slate-100'}`} style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-50 shadow-sm bg-slate-50">
                      <img 
                        src={p.photoUrl && p.photoUrl !== "" ? p.photoUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=003876&color=fff`} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                        alt={p.name} 
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=003876&color=fff`; }}
                      />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center border-2 border-white shadow-sm ${isGoleiro ? 'bg-amber-500' : (isMensalista ? 'bg-navy' : 'bg-slate-400')}`}>
                       <span className="material-symbols-outlined text-white text-[14px]">
                         {isGoleiro ? 'front_hand' : (isMensalista ? 'calendar_today' : 'confirmation_number')}
                       </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-navy uppercase italic leading-none mb-1.5">{p.name}</h4>
                    <div className="flex items-center gap-2">
                       <span className={`text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${isGoleiro ? 'bg-amber-500 text-white' : (isMensalista ? 'bg-navy/5 text-navy' : 'bg-slate-100 text-slate-500')}`}>
                         {isGoleiro ? 'PAREDÃO' : (isMensalista ? 'MENSALISTA' : 'AVULSO')}
                       </span>
                       <span className={`text-[10px] font-black italic ${isGoleiro ? 'text-amber-600' : 'text-slate-300'}`}>
                         {isGoleiro ? 'ISENTO' : `R$ ${value}`}
                       </span>
                    </div>
                  </div>
                </div>

                {isAdmin ? (
                  <button 
                    type="button"
                    disabled={isProcessing || isGoleiro}
                    onClick={() => handleTogglePayment(p)}
                    className={`min-w-[110px] h-12 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 border ${isPaid ? (isGoleiro ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100') : 'bg-primary text-white border-primary shadow-lg shadow-primary/20'}`}
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-navy/10 border-t-navy rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">{isPaid ? 'check_circle' : 'payments'}</span>
                        {isGoleiro ? 'ISENTO' : (isPaid ? 'CONCLUÍDO' : 'CONFIRMAR')}
                      </>
                    )}
                  </button>
                ) : (
                  <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border ${isPaid ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                    {isPaid ? 'OK' : 'PENDENTE'}
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white/40">
               <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 animate-pulse">receipt_long</span>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2">Nenhum registro encontrado</p>
            </div>
          )}
        </div>
      </section>

      {isAdmin && activePlayers.length > 0 && (
        <div className="px-6 mt-12 mb-20">
          <button 
            type="button"
            onClick={() => window.print()}
            className="w-full h-18 bg-navy text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl shadow-navy/30"
          >
            <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
            EXPORTAR FECHAMENTO
          </button>
        </div>
      )}
    </div>
  );
};

export default Ranking;
