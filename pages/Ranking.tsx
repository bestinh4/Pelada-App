
import React, { useState } from 'react';
import { Player, Page } from '../types.ts';
import { db, doc, updateDoc } from '../services/firebase.ts';

const Ranking: React.FC<{ players: Player[], onPageChange: (page: Page) => void }> = ({ players, onPageChange }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";
  
  // Cálculo de saldo baseado nos pagamentos confirmados
  const currentBalance = players.reduce((acc, p) => {
    if (p.paymentStatus === 'pago') {
      return acc + (p.playerType === 'mensalista' ? 50 : 35);
    }
    return acc;
  }, 0);

  const handleTogglePayment = async (player: Player) => {
    setLoadingId(player.id);
    try {
      const playerRef = doc(db, "players", player.id);
      const newStatus = player.paymentStatus === 'pago' ? 'pendente' : 'pago';
      await updateDoc(playerRef, { paymentStatus: newStatus });
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
      alert("Falha ao comunicar com o servidor.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-20 relative">
      <header className="px-6 pt-12 pb-6 bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" alt="Logo" />
            <div>
              <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">CAIXA DA ARENA</h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">CONTROLE DE PAGAMENTOS</p>
            </div>
          </div>
        </div>
      </header>

      <section className="px-6 mt-6">
        {/* Card de Saldo */}
        <div className="bg-navy-deep rounded-[2rem] p-6 text-white shadow-xl mb-8 flex items-center justify-between overflow-hidden relative">
          <div className="absolute inset-0 bg-croatia opacity-[0.05]"></div>
          <div className="relative z-10">
            <span className="text-[9px] font-black uppercase text-white/40 tracking-widest block mb-1">TOTAL ARRECADADO</span>
            <h2 className="text-3xl font-condensed italic text-emerald-400">R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center relative z-10">
            <span className="material-symbols-outlined text-primary text-2xl">payments</span>
          </div>
        </div>

        {/* Legenda de Tipos */}
        <div className="flex gap-4 mb-6 px-2">
           <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-navy flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[12px]">calendar_month</span>
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase">Mensalista</span>
           </div>
           <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[12px]">confirmation_number</span>
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase">Avulso</span>
           </div>
        </div>

        {/* Lista de Jogadores */}
        <div className="space-y-3">
          {players.length > 0 ? players.map((p) => {
            const isMensalista = p.playerType === 'mensalista';
            const isPaid = p.paymentStatus === 'pago';
            const isProcessing = loadingId === p.id;

            return (
              <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between group transition-all">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100">
                      <img src={p.photoUrl} className="w-full h-full object-cover" alt={p.name} />
                    </div>
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${isMensalista ? 'bg-navy text-white' : 'bg-amber-500 text-white'}`}>
                       <span className="material-symbols-outlined text-[10px] fill-1">
                         {isMensalista ? 'calendar_month' : 'confirmation_number'}
                       </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-black text-navy uppercase italic leading-none mb-1">{p.name}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">
                      {isMensalista ? 'Mensalista • R$ 50' : 'Avulso • R$ 35'}
                    </p>
                  </div>
                </div>

                <button 
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleTogglePayment(p)}
                  className={`min-w-[90px] h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center ${isPaid ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    isPaid ? 'PAGO' : 'CONFIRMAR'
                  )}
                </button>
              </div>
            );
          }) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
               <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Nenhum atleta na base</p>
            </div>
          )}
        </div>
      </section>

      <div className="px-6 mt-10 mb-24">
        <button 
          type="button"
          onClick={() => window.print()}
          className="w-full py-4 bg-slate-100 text-navy rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-lg">print</span>
          Gerar Relatório de Caixa
        </button>
      </div>
    </div>
  );
};

export default Ranking;
