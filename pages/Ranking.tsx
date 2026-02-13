
import React from 'react';
import { Player, Page } from '../types.ts';

const Ranking: React.FC<{ players: Player[], onPageChange: (page: Page) => void }> = ({ players, onPageChange }) => {
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";
  
  const currentBalance = 2450.00;
  const goalBalance = 5000.00;
  const percentage = (currentBalance / goalBalance) * 100;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-40">
      <header className="px-6 pt-12 pb-6 bg-white/80 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" />
            <div>
              <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter">TESOURARIA</h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">FUNDO DE RESERVA</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-navy active:scale-90">
              <span className="material-symbols-outlined text-xl">analytics</span>
            </button>
          </div>
        </div>
      </header>

      <section className="px-6 mt-8">
        {/* Financial Dashboard Card */}
        <div className="bg-navy rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-navy/30 mb-10">
          <div className="absolute inset-0 bg-croatia opacity-[0.08]"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[60px]"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.4em] block mb-2">SALDO DISPONÍVEL 2026</span>
                <h2 className="text-5xl font-condensed tracking-tighter leading-none">R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-2xl border border-white/10">
                 <span className="material-symbols-outlined text-emerald-400 text-3xl">account_balance_wallet</span>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-emerald-400 italic tracking-widest">OBJETIVO: MANUTENÇÃO ANUAL</p>
                  <p className="text-xl font-condensed tracking-widest">R$ {goalBalance.toLocaleString('pt-BR')}</p>
                </div>
                <span className="text-2xl font-black italic text-white/80">{Math.round(percentage)}%</span>
              </div>
              
              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                 <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all duration-[1.5s] ease-out" style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-10">
           <button className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex flex-col items-center gap-2 active:scale-95 transition-all">
             <span className="material-symbols-outlined text-primary text-2xl">qr_code_scanner</span>
             <span className="text-[9px] font-black uppercase tracking-widest text-navy">PAGAR MENSALIDADE</span>
           </button>
           <button className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex flex-col items-center gap-2 active:scale-95 transition-all">
             <span className="material-symbols-outlined text-navy text-2xl">receipt_long</span>
             <span className="text-[9px] font-black uppercase tracking-widest text-navy">VER BALANCETE</span>
           </button>
        </div>

        {/* Monthly Payments List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6 px-2">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-navy">MENSALISTAS</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">FEVEREIRO / 2026</p>
            </div>
            <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black text-primary uppercase">8 PENDENTES</span>
            </div>
          </div>

          {players.slice(0, 10).map((p, idx) => (
            <div key={p.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft flex items-center justify-between group hover:border-navy/10 transition-all">
               <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all ${idx % 3 === 0 ? 'border-emerald-500/20' : 'border-slate-50 grayscale group-hover:grayscale-0'}`}>
                    <img src={p.photoUrl} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-navy uppercase italic tracking-tight">{p.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${idx % 3 === 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{idx % 3 === 0 ? 'CONFIRMADO • 12 FEV' : 'AGUARDANDO PIX'}</p>
                    </div>
                  </div>
               </div>
               <div className="text-right">
                 <p className={`text-sm font-black tracking-tighter ${idx % 3 === 0 ? 'text-navy' : 'text-slate-300'}`}>R$ 50,00</p>
                 <button className={`mt-1 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded ${idx % 3 === 0 ? 'text-emerald-500 bg-emerald-50' : 'text-primary bg-primary/5 active:scale-90'}`}>
                   {idx % 3 === 0 ? 'RECIBO' : 'COBRAR'}
                 </button>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating CTA for Financial Management */}
      <div className="fixed bottom-32 left-0 right-0 px-6 z-40 pointer-events-none">
        <button className="w-full h-18 bg-white border-2 border-slate-100 text-navy rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all pointer-events-auto group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
            <span className="material-symbols-outlined">upload_file</span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">ANEXAR COMPROVANTE MENSAL</span>
        </button>
      </div>
    </div>
  );
};

export default Ranking;
