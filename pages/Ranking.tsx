
import React, { useState, useEffect } from 'react';
import { Player, Page, Expense } from '../types.ts';
import { MASTER_ADMIN_EMAIL } from '../constants.tsx';
import { db, doc, updateDoc, setDoc, onSnapshot, collection, addDoc, deleteDoc } from '../services/firebase.ts';

const Ranking: React.FC<{ players: Player[], currentUser: any, onPageChange: (page: Page) => void }> = ({ players, currentUser, onPageChange }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'todos' | 'pendentes' | 'pagos'>('todos');
  const [view, setView] = useState<'financeiro' | 'artilharia'>('financeiro');
  const [finView, setFinView] = useState<'receitas' | 'despesas'>('receitas');
  const [prices, setPrices] = useState({ mensalista: 60, avulso: 40 });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: 0, category: 'Outros' });
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  const currentPlayer = players.find(p => p.id === currentUser?.uid);
  const isMasterUser = currentUser?.email === MASTER_ADMIN_EMAIL;
  const isUserAdmin = currentPlayer?.role === 'admin' || isMasterUser;
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  useEffect(() => {
    const unsubPrices = onSnapshot(doc(db, "settings", "finance"), (docSnap) => {
      if (docSnap.exists()) setPrices(docSnap.data() as any);
    });

    const unsubExpenses = onSnapshot(collection(db, "expenses"), (snapshot) => {
      const expenseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(expenseList);
    });

    return () => {
      unsubPrices();
      unsubExpenses();
    };
  }, []);

  const activePlayers = players.filter(p => p.status === 'presente');
  
  // REGRA: Goleiros e ADMs (exceto o Master) são isentos
  const checkIsExempt = (p: Player) => {
    const isGoleiro = p.position === 'Goleiro';
    const isAdminExempt = p.role === 'admin' && p.email !== MASTER_ADMIN_EMAIL;
    return isGoleiro || isAdminExempt;
  };

  const totals = activePlayers.reduce((acc, p) => {
    if (checkIsExempt(p)) return acc;
    const val = p.playerType === 'mensalista' ? prices.mensalista : prices.avulso;
    const paid = p.playerType === 'mensalista' ? p.monthlyPaid : p.paymentStatus === 'pago';
    if (paid) acc.paid += val; else acc.pending += val;
    return acc;
  }, { paid: 0, pending: 0 });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totals.paid - totalExpenses;

  const filteredPlayers = activePlayers.filter(p => {
    if (filter === 'todos') return true;
    const isExempt = checkIsExempt(p);
    if (isExempt) return filter === 'pagos'; // Isentos aparecem como "pagos/quitados"
    const isPaid = p.playerType === 'mensalista' ? p.monthlyPaid : p.paymentStatus === 'pago';
    return filter === 'pagos' ? isPaid : !isPaid;
  });

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-12 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-navy uppercase italic tracking-tighter leading-none">
            {view === 'financeiro' ? 'COFRE O&A' : 'ARTILHARIA'}
          </h2>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">
            {view === 'financeiro' ? 'GESTOR FINANCEIRO' : 'RANKING DE GOLS'}
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setView(view === 'financeiro' ? 'artilharia' : 'financeiro')}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-soft-white border border-slate-100 text-navy active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined">{view === 'financeiro' ? 'emoji_events' : 'payments'}</span>
          </button>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-soft-white animate-float border border-slate-100 p-2">
            <img src={mainLogoUrl} className="w-8 h-8 object-contain" />
          </div>
        </div>
      </header>

      <main className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start pb-48">
        {view === 'financeiro' ? (
          <>
            <div className="lg:col-span-5 space-y-10">
              <div className="bg-white border border-slate-100 rounded-[3rem] p-10 relative overflow-hidden shadow-elite min-h-[350px] flex flex-col justify-between">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 opacity-[0.08] pointer-events-none animate-float">
                    <img src={mainLogoUrl} className="w-full h-full object-contain grayscale" />
                </div>

                <div className="relative z-10">
                  <span className="text-[11px] font-black text-navy/30 uppercase tracking-[0.4em] block mb-4 italic">SALDO EM CAIXA</span>
                  <h2 className={`text-6xl font-condensed italic font-black tracking-tighter leading-none ${netBalance >= 0 ? 'text-navy' : 'text-primary'}`}>
                    R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h2>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-6 pt-10 border-t border-slate-50">
                  <div className="space-y-2">
                     <span className="text-[10px] font-black text-success uppercase tracking-widest">RECEITAS</span>
                     <p className="text-2xl font-condensed italic font-black text-navy">R$ {totals.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="space-y-2">
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest">DESPESAS</span>
                     <p className="text-2xl font-condensed italic font-black text-navy">R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                
                <div className="relative z-10 pt-6 flex justify-between items-center">
                  <div className="space-y-1">
                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">PENDENTE (A RECEBER)</span>
                     <p className="text-xl font-condensed italic font-black text-slate-400">R$ {totals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  {isUserAdmin && (
                    <button 
                      onClick={() => setIsAddingExpense(true)}
                      className="w-12 h-12 bg-navy text-white rounded-2xl flex items-center justify-center shadow-elite active:scale-90 transition-all"
                      title="Adicionar Despesa"
                    >
                      <span className="material-symbols-outlined">add_card</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex bg-white border border-slate-100 p-2 rounded-full shadow-soft-white">
                {(['receitas', 'despesas'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setFinView(v)}
                    className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${finView === v ? 'bg-navy text-white shadow-elite' : 'text-slate-300 hover:text-navy/60'}`}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 mt-10 lg:mt-0">
              {finView === 'receitas' ? (
                <div className="space-y-6">
                  <div className="flex bg-slate-50 border border-slate-100 p-1.5 rounded-full">
                    {(['todos', 'pendentes', 'pagos'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.1em] transition-all ${filter === f ? 'bg-white text-navy shadow-sm' : 'text-slate-400 hover:text-navy/60'}`}
                      >
                        {f === 'todos' ? 'GERAL' : f === 'pendentes' ? 'DÉBITO' : 'QUITADO'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    {filteredPlayers.map((p) => {
                      const isExempt = checkIsExempt(p);
                      const isPaid = isExempt || (p.playerType === 'mensalista' ? p.monthlyPaid : p.paymentStatus === 'pago');
                      
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
                              <div className="flex items-center gap-2">
                                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{isExempt ? (p.position === 'Goleiro' ? 'GOLEIRO' : 'DIRETORIA') : p.playerType.toUpperCase()}</p>
                                 {isExempt && <span className="text-[9px] font-black text-primary uppercase">ISENTO 💼</span>}
                              </div>
                            </div>
                          </div>
                          {isUserAdmin && !isExempt && (
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
                          {isExempt && (
                             <div className="h-12 px-6 flex items-center text-[10px] font-black text-slate-200 uppercase tracking-widest">
                                LIBERADO
                             </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                  {expenses.length > 0 ? expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((e) => (
                    <div key={e.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 flex items-center justify-between shadow-soft-white group hover:border-navy/20 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-navy border border-slate-100">
                          <span className="material-symbols-outlined text-2xl">receipt_long</span>
                        </div>
                        <div>
                          <h4 className="text-[15px] font-black text-navy uppercase italic leading-none mb-1.5">{e.description}</h4>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{e.category} • {new Date(e.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-xl font-condensed italic font-black text-primary leading-none">R$ {e.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        {isUserAdmin && (
                          <button 
                            onClick={async () => {
                              if (confirm("Excluir este gasto?")) {
                                await deleteDoc(doc(db, "expenses", e.id));
                              }
                            }}
                            className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center bg-slate-50 border border-dashed border-slate-100 rounded-[3rem]">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Nenhuma despesa registrada</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="lg:col-span-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {players.filter(p => p.goals > 0).sort((a,b) => b.goals - a.goals).slice(0, 3).map((p, i) => {
                const rankColors = [
                  'bg-amber-400 shadow-glow-amber border-amber-500', 
                  'bg-slate-300 shadow-soft-white border-slate-400', 
                  'bg-orange-400 shadow-glow-orange border-orange-500'
                ];
                const rankIcons = ['trophy', 'military_tech', 'military_tech'];
                const rankLabels = ['ARTILHEIRO', 'VICE-ARTILHEIRO', 'TERCEIRO LUGAR'];

                return (
                  <div key={p.id} className={`relative pt-12 pb-10 px-8 rounded-[3.5rem] border-2 text-center flex flex-col items-center bg-white ${rankColors[i].split(' ')[2]}`}>
                    <div className={`absolute -top-8 w-20 h-20 rounded-[2rem] border-4 border-white flex items-center justify-center text-white shadow-2xl ${rankColors[i].split(' ')[0]}`}>
                       <span className="material-symbols-outlined text-4xl">{rankIcons[i]}</span>
                    </div>
                    
                    <div className="mt-4 mb-6">
                      <img src={p.photoUrl} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-slate-50 shadow-xl mx-auto" alt="" />
                    </div>

                    <div className="space-y-1 mb-6">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{rankLabels[i]}</span>
                      <h3 className="text-2xl font-black text-navy uppercase italic tracking-tighter leading-none">{p.name}</h3>
                      <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{p.position}</p>
                    </div>

                    <div className="w-full pt-6 border-t border-slate-50 flex justify-around">
                      <div className="text-center">
                        <p className="text-4xl font-condensed italic font-black text-navy leading-none">{p.goals}</p>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">GOLS</p>
                      </div>
                      <div className="text-center">
                        <p className="text-4xl font-condensed italic font-black text-primary leading-none">{p.assists || 0}</p>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">ASSISTS</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border border-slate-100 rounded-[3.5rem] p-10 shadow-soft-white">
              <div className="flex items-center justify-between mb-10 px-4">
                <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-navy italic">CLASSIFICAÇÃO GERAL</h3>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{players.filter(p => p.goals > 0).length} ATLETAS COM GOL</span>
              </div>

              <div className="space-y-4">
                {players.filter(p => p.goals > 0).sort((a,b) => b.goals - a.goals).slice(3).map((p, i) => (
                  <div key={p.id} className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-6 flex items-center justify-between group hover:bg-white hover:border-navy/20 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black italic text-navy shadow-sm">{i + 4}</div>
                      <img src={p.photoUrl} className="w-16 h-16 rounded-[1.5rem] object-cover border-2 border-white shadow-sm" alt="" />
                      <div>
                        <h4 className="text-[16px] font-black text-navy uppercase italic leading-none mb-1">{p.name}</h4>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{p.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="text-center">
                         <p className="text-3xl font-condensed italic font-black text-navy leading-none">{p.goals}</p>
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">GOLS</p>
                      </div>
                      <div className="text-center w-16">
                         <p className="text-3xl font-condensed italic font-black text-primary leading-none">{p.assists || 0}</p>
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ASSISTS</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL ADICIONAR DESPESA */}
      {isAddingExpense && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-md z-[2000] flex items-center justify-center p-6">
           <div className="w-full max-w-[400px] bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                       <span className="material-symbols-outlined text-2xl">add_card</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-navy uppercase italic tracking-tighter leading-none">NOVO GASTO</h3>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">REGISTRO DE SAÍDA</p>
                    </div>
                 </div>
                 <button onClick={() => setIsAddingExpense(false)} className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 active:scale-90">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>
              
              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">DESCRIÇÃO</label>
                    <input 
                      type="text" 
                      value={newExpense.description} 
                      onChange={e => setNewExpense({...newExpense, description: e.target.value})} 
                      placeholder="Ex: Aluguel da Quadra"
                      className="w-full h-16 bg-slate-50 rounded-2xl border border-slate-100 px-6 font-black text-navy outline-none focus:border-primary" 
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">VALOR (R$)</label>
                    <input 
                      type="number" 
                      value={newExpense.amount} 
                      onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} 
                      className="w-full h-16 bg-slate-50 rounded-2xl border border-slate-100 px-6 font-black text-navy text-2xl outline-none focus:border-primary" 
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">CATEGORIA</label>
                    <select 
                      value={newExpense.category} 
                      onChange={e => setNewExpense({...newExpense, category: e.target.value})} 
                      className="w-full h-16 bg-slate-50 rounded-2xl border border-slate-100 px-6 font-black text-navy outline-none focus:border-primary"
                    >
                      <option value="Quadra">Quadra</option>
                      <option value="Equipamento">Equipamento</option>
                      <option value="Evento">Evento</option>
                      <option value="Outros">Outros</option>
                    </select>
                 </div>

                 <button 
                  onClick={async () => {
                    if (!newExpense.description || newExpense.amount <= 0) return alert("Preencha os dados corretamente.");
                    setIsSavingExpense(true);
                    try {
                      await addDoc(collection(db, "expenses"), {
                        ...newExpense,
                        date: new Date().toISOString()
                      });
                      setIsAddingExpense(false);
                      setNewExpense({ description: '', amount: 0, category: 'Outros' });
                    } catch (e) {
                      alert("Erro ao salvar gasto.");
                    } finally {
                      setIsSavingExpense(false);
                    }
                  }}
                  disabled={isSavingExpense}
                  className="w-full h-20 bg-navy text-white rounded-[2rem] font-black uppercase text-[12px] tracking-[0.2em] shadow-elite active:scale-95 transition-all mt-4"
                 >
                    {isSavingExpense ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div> : "REGISTRAR GASTO"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Ranking;
