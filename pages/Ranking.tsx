
import React, { useState } from 'react';
import { Player, Page } from '../types.ts';

const Ranking: React.FC<{ players: Player[], onPageChange: (page: Page) => void }> = ({ players, onPageChange }) => {
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";
  
  const current = 650;
  const goal = 1000;
  const percentage = (current / goal) * 100;

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10">
            <img src={mainLogoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-[8px] font-black uppercase text-primary tracking-widest leading-none block">ARENA</span>
            <h2 className="text-sm font-black text-navy uppercase italic tracking-tighter leading-none">TESOURARIA</h2>
          </div>
        </div>
      </header>

      <section className="px-6 mt-8">
        <div className="bg-white rounded-apple-xl p-8 border border-slate-100 shadow-soft mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-croatia opacity-[0.03]"></div>
          <div className="relative z-10 flex justify-between items-center mb-6">
            <div>
              <span className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em] block mb-1">SALDO DO MÊS</span>
              <h2 className="text-4xl font-condensed text-navy tracking-tight">R$ {current.toLocaleString('pt-BR')}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
              <span className="material-symbols-outlined text-2xl fill-1">account_balance</span>
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2">
              <span className="text-emerald-500">{Math.round(percentage)}% DA META</span>
              <span className="text-slate-300">META: R$ {goal}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4 px-2 italic">ULTIMOS LANÇAMENTOS</h3>
          {players.slice(0, 8).map((p, idx) => (
            <div key={p.id} className="bg-white rounded-apple p-4 border border-slate-100 shadow-soft flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 overflow-hidden border border-slate-100 grayscale opacity-50">
                    <img src={p.photoUrl} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-navy uppercase">{p.name}</h4>
                    <p className="text-[8px] font-bold text-slate-300 uppercase">Mensalista • Outubro</p>
                  </div>
               </div>
               <span className={`text-[10px] font-black ${idx % 2 === 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                 {idx % 2 === 0 ? '+ R$ 40,00' : 'PENDENTE'}
               </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Ranking;
