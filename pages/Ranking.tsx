
import React from 'react';
import { Player, Page } from '../types.ts';

const Ranking: React.FC<{ players: Player[], onPageChange: (page: Page) => void }> = ({ players, onPageChange }) => {
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";
  
  // Exemplo de saldo simplificado
  const currentBalance = 1250.00;

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
        {/* Card de Saldo Ultra Simples */}
        <div className="bg-navy rounded-[2rem] p-6 text-white shadow-xl mb-8 flex items-center justify-between overflow-hidden relative">
          <div className="absolute inset-0 bg-croatia opacity-[0.05]"></div>
          <div className="relative z-10">
            <span className="text-[9px] font-black uppercase text-white/40 tracking-widest block mb-1">SALDO ATUAL</span>
            <h2 className="text-3xl font-condensed italic">R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center relative z-10">
            <span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
          </div>
        </div>

        {/* Legenda Simples */}
        <div className="flex gap-4 mb-6 px-2">
           <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-navy text-sm">calendar_month</span>
              <span className="text-[8px] font-black text-slate-400 uppercase">Mensalista</span>
           </div>
           <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-500 text-sm">confirmation_number</span>
              <span className="text-[8px] font-black text-slate-400 uppercase">Avulso</span>
           </div>
        </div>

        {/* Lista de Jogadores para Cobrança */}
        <div className="space-y-3">
          {players.map((p, idx) => {
            // Mock de tipo de jogador baseado no index para exemplo visual
            const isMensalista = idx % 2 === 0;
            const isPaid = idx % 3 === 0;

            return (
              <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100">
                      <img src={p.photoUrl} className="w-full h-full object-cover" alt={p.name} />
                    </div>
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${isMensalista ? 'bg-navy text-white' : 'bg-amber-500 text-white'}`}>
                       <span className="material-symbols-outlined text-[10px]">
                         {isMensalista ? 'calendar_month' : 'confirmation_number'}
                       </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-black text-navy uppercase italic leading-none mb-1">{p.name}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">
                      {isMensalista ? 'R$ 50,00' : 'R$ 35,00'}
                    </p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => alert(`Pagamento de ${p.name} confirmado!`)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${isPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
                >
                  {isPaid ? 'PAGO' : 'CONFIRMAR'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Botão para Gerar Relatório Simples */}
      <div className="px-6 mt-10 mb-20">
        <button 
          type="button"
          className="w-full py-4 bg-slate-100 text-navy rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          Baixar Relatório do Mês
        </button>
      </div>
    </div>
  );
};

export default Ranking;
