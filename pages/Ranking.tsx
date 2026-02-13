
import React from 'react';
import { Player, Page } from '../types.ts';

const Ranking: React.FC<{ players: Player[], onPageChange: (page: Page) => void }> = ({ players, onPageChange }) => {
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";
  
  const current = 840;
  const goal = 1200;
  const percentage = (current / goal) * 100;

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" />
            <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter">TESOURARIA</h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-soft flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
        </div>
      </header>

      <section className="px-6 mt-8">
        {/* Financial Card */}
        <div className="bg-navy rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-navy/20 mb-10">
          <div className="absolute inset-0 bg-croatia opacity-[0.05]"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-[9px] font-black uppercase text-white/40 tracking-[0.3em] block mb-2">SALDO DISPONÍVEL</span>
                <h2 className="text-5xl font-condensed tracking-tight">R$ {current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl">
                 <span className="material-symbols-outlined text-emerald-400">payments</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                <span className="text-emerald-400 italic">{Math.round(percentage)}% DA META</span>
                <span className="text-white/40">FUNDO DE RESERVA</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">HISTÓRICO DE PAGAMENTOS</h3>
            <span className="text-[10px] font-black text-primary italic">SETEMBRO</span>
          </div>

          {players.slice(0, 8).map((p, idx) => (
            <div key={p.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft flex items-center justify-between group hover:bg-slate-50 transition-colors">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 grayscale transition-all group-hover:grayscale-0">
                    <img src={p.photoUrl} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-navy uppercase italic tracking-tight">{p.name}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">VIA PIX • 12 SET</p>
                  </div>
               </div>
               <div className="text-right">
                 <span className={`text-[9px] font-black px-3 py-1 rounded-md mb-2 inline-block ${idx % 2 === 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                   {idx % 2 === 0 ? 'PAGO' : 'PENDENTE'}
                 </span>
                 <p className="text-sm font-black text-navy tracking-widest">R$ 40,00</p>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Action Button for Payments */}
      <button className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[80%] h-16 bg-white border border-slate-100 text-navy rounded-2xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined text-primary">qr_code_2</span>
        <span className="text-[11px] font-black uppercase tracking-[0.2em]">ENVIAR COMPROVANTE</span>
      </button>
    </div>
  );
};

export default Ranking;
