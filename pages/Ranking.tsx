
import React, { useState } from 'react';
import { Player, Page } from '../types.ts';

const Ranking: React.FC<{ players: Player[], onPageChange: (page: Page) => void }> = ({ players, onPageChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";
  
  const goal = 800;
  const current = 650;
  const percentage = (current / goal) * 100;

  const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-900 animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => onPageChange(Page.Dashboard)} className="material-symbols-outlined text-slate-300 hover:text-primary transition-colors active:scale-90">arrow_back</button>
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={mainLogoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-primary tracking-[0.3em] leading-none mb-0.5">ARENA</span>
              <h2 className="text-sm font-black text-navy uppercase italic tracking-tighter leading-none">O&A FINANÇAS</h2>
            </div>
          </div>
          <button onClick={() => alert("Relatório PDF em breve")} className="w-10 h-10 rounded-xl bg-white shadow-soft border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[20px]">description</span>
          </button>
        </div>
      </header>

      <section className="px-6 mt-6">
        {/* Card Financeiro Estilo Home */}
        <div className="relative overflow-hidden rounded-apple-xl bg-white border border-slate-100 shadow-soft p-8 mb-8 group">
          <div className="absolute inset-0 z-0 bg-croatia opacity-[0.03]"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div>
              <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest block mb-1">TOTAL ARRECADADO</span>
              <h2 className="text-4xl font-condensed text-navy tracking-widest leading-none">R$ {current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
              <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase italic tracking-wider">Meta: R$ {goal.toLocaleString('pt-BR')} (Mensalistas)</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-sm">
              <span className="material-symbols-outlined text-3xl fill-1">account_balance_wallet</span>
            </div>
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="text-emerald-600">{Math.round(percentage)}% DA META ALCANÇADA</span>
              <span className="text-slate-300">OUTUBRO</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50 shadow-inner">
              <div 
                className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-1000" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Busca Premium */}
        <div className="relative mb-6">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">search</span>
          <input 
            type="text" 
            placeholder="Buscar atleta na tesouraria..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 bg-white border border-slate-100 rounded-2xl pl-14 pr-6 text-sm font-bold text-navy placeholder:text-slate-300 shadow-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          />
        </div>

        {/* Lista de Pagamentos */}
        <div className="space-y-3 pb-40">
          {filteredPlayers.map((p, idx) => (
            <div key={p.id} className="bg-white rounded-apple p-5 border border-slate-100 shadow-soft flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl overflow-hidden grayscale opacity-40 border border-slate-100 p-0.5">
                    <img src={p.photoUrl} className="w-full h-full object-cover rounded-lg" alt={p.name} />
                  </div>
                  {idx % 2 === 0 && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[10px] text-white font-black">check</span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-navy uppercase italic text-sm tracking-tight leading-none mb-1">{p.name}</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Via Pix • 15 Out</p>
                </div>
              </div>
              <div className="text-right">
                 <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-1 inline-block ${idx % 2 === 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                  {idx % 2 === 0 ? 'PAGO' : 'PENDENTE'}
                </span>
                <p className="text-sm font-black text-navy leading-none">R$ 40,00</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Botão Flutuante Padronizado */}
      <div className="fixed bottom-24 left-0 right-0 px-6 py-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-50">
        <button onClick={() => alert("Registrar pagamento via PIX")} className="w-full h-16 bg-primary text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/30 active:scale-95 transition-all">
          <span className="material-symbols-outlined">payments</span>
          LANÇAR RECEBIMENTO
        </button>
      </div>
    </div>
  );
};

export default Ranking;
