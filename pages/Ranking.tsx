
import React, { useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';
import { db, doc, updateDoc, getDoc, setDoc, onSnapshot } from '../services/firebase.ts';

const Ranking: React.FC<{ players: Player[], currentUser: any, onPageChange: (page: Page) => void }> = ({ players, currentUser, onPageChange }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'todos' | 'pendentes' | 'pagos'>('todos');
  const [isEditingPrices, setIsEditingPrices] = useState(false);
  const [prices, setPrices] = useState({ mensalista: 50, avulso: 35 });
  const [isSavingPrices, setIsSavingPrices] = useState(false);

  const currentPlayer = players.find(p => p.id === currentUser?.uid);
  const isAdmin = currentPlayer?.role === 'admin';

  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "finance"), (docSnap) => {
      if (docSnap.exists()) {
        setPrices(docSnap.data() as { mensalista: number, avulso: number });
      } else if (isAdmin) {
        setDoc(doc(db, "settings", "finance"), { mensalista: 50, avulso: 35 });
      }
    });
    return () => unsub();
  }, [isAdmin]);

  const totals = players.reduce((acc, p) => {
    const value = p.playerType === 'mensalista' ? prices.mensalista : prices.avulso;
    if (p.paymentStatus === 'pago') {
      acc.paid += value;
    } else {
      acc.pending += value;
    }
    return acc;
  }, { paid: 0, pending: 0 });

  const filteredPlayers = players.filter(p => {
    if (filter === 'pendentes') return p.paymentStatus !== 'pago';
    if (filter === 'pagos') return p.paymentStatus === 'pago';
    return true;
  });

  const handleTogglePayment = async (player: Player) => {
    if (!isAdmin || loadingId) return;
    setLoadingId(player.id);
    try {
      const playerRef = doc(db, "players", player.id);
      const newStatus = player.paymentStatus === 'pago' ? 'pendente' : 'pago';
      await updateDoc(playerRef, { paymentStatus: newStatus });
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
      alert("Erro ao salvar. Verifique sua conexão.");
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
      <header className="px-6 pt-12 pb-6 bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" alt="Logo" />
            <div>
              <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">CAIXA DA ARENA</h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">FECHAMENTO FINANCEIRO</p>
            </div>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsEditingPrices(!isEditingPrices)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isEditingPrices ? 'bg-primary text-white' : 'bg-slate-100 text-navy hover:bg-slate-200'}`}
            >
              <span className="material-symbols-outlined text-xl">{isEditingPrices ? 'close' : 'settings_suggest'}</span>
            </button>
          )}
        </div>
      </header>

      <section className="px-6 mt-6">
        {isAdmin && isEditingPrices && (
          <div className="mb-8 bg-navy rounded-[2rem] p-6 text-white animate-in slide-in-from-top-4 duration-300 shadow-xl shadow-navy/20">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">REAJUSTE DE VALORES</h3>
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-white/60 uppercase ml-1">MENSALISTA (R$)</label>
                  <input 
                    type="number" 
                    value={prices.mensalista}
                    onChange={(e) => setPrices({...prices, mensalista: Number(e.target.value)})}
                    className="w-full h-12 bg-white/10 border border-white/10 rounded-xl px-4 font-bold text-white outline-none focus:bg-white/20 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-white/60 uppercase ml-1">AVULSO (R$)</label>
                  <input 
                    type="number" 
                    value={prices.avulso}
                    onChange={(e) => setPrices({...prices, avulso: Number(e.target.value)})}
                    className="w-full h-12 bg-white/10 border border-white/10 rounded-xl px-4 font-bold text-white outline-none focus:bg-white/20 transition-all"
                  />
                </div>
             </div>
             <button 
              onClick={saveNewPrices}
              disabled={isSavingPrices}
              className="w-full h-12 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
             >
               {isSavingPrices ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'SALVAR REAJUSTE'}
             </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-emerald-500 rounded-[2rem] p-5 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
             <div className="absolute inset-0 bg-croatia opacity-[0.05]"></div>
             <span className="text-[8px] font-black uppercase tracking-widest text-white/60 block mb-1">RECEBIDO</span>
             <h2 className="text-2xl font-condensed italic leading-none">R$ {totals.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
             <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-4xl opacity-20">check_circle</span>
          </div>
          <div className="bg-primary rounded-[2rem] p-5 text-white shadow-lg shadow-primary/20 relative overflow-hidden">
             <div className="absolute inset-0 bg-croatia opacity-[0.05]"></div>
             <span className="text-[8px] font-black uppercase tracking-widest text-white/60 block mb-1">A RECEBER</span>
             <h2 className="text-2xl font-condensed italic leading-none">R$ {totals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
             <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-4xl opacity-20">pending</span>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          {(['todos', 'pendentes', 'pagos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-navy shadow-sm' : 'text-slate-400'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredPlayers.length > 0 ? filteredPlayers.map((p) => {
            const isMensalista = p.playerType === 'mensalista';
            const isPaid = p.paymentStatus === 'pago';
            const value = isMensalista ? prices.mensalista : prices.avulso;
            const isProcessing = loadingId === p.id;

            return (
              <div key={p.id} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-soft flex items-center justify-between group transition-all">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                      <img src={p.photoUrl} className="w-full h-full object-cover" alt={p.name} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-navy uppercase italic leading-none mb-1.5">{p.name}</h4>
                    <div className="flex items-center gap-2">
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-400 uppercase tracking-widest`}>
                         {isMensalista ? 'MENSALISTA' : 'AVULSO'}
                       </span>
                       <span className="text-[10px] font-black text-navy italic">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {isAdmin ? (
                  <button 
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleTogglePayment(p)}
                    className={`min-w-[100px] h-11 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${isPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-navy/10 border-t-navy rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">{isPaid ? 'check_circle' : 'payments'}</span>
                        {isPaid ? 'PAGO' : 'CONFIRMAR'}
                      </>
                    )}
                  </button>
                ) : (
                  <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest ${isPaid ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                    {isPaid ? 'CONCLUÍDO' : 'PENDENTE'}
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem]">
               <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">search_off</span>
               <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Nenhum jogador encontrado</p>
            </div>
          )}
        </div>
      </section>

      {isAdmin && (
        <div className="px-6 mt-12 mb-20">
          <button 
            type="button"
            onClick={() => window.print()}
            className="w-full h-16 bg-navy text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-navy/20"
          >
            <span className="material-symbols-outlined">description</span>
            EXPORTAR RELATÓRIO PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default Ranking;
