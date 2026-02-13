
import React from 'react';
import { Player, Page } from '../types.ts';

const Ranking: React.FC<{ players: Player[], onPageChange: (page: Page) => void }> = ({ players, onPageChange }) => {
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";
  
  const totalBalance = 2450.00;
  const goalBalance = 5000.00;
  const monthlyGoal = 1500.00;
  const currentMonthly = 950.00;
  
  const percentageTotal = (totalBalance / goalBalance) * 100;
  const percentageMonthly = (currentMonthly / monthlyGoal) * 100;

  // Mock de despesas recentes
  const recentExpenses = [
    { id: 1, title: 'Aluguel da Quadra', value: 850, date: '05 FEV', type: 'Locação' },
    { id: 2, title: 'Nova Bola Penalty', value: 220, date: '02 FEV', type: 'Equipamento' },
  ];

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-48">
      <header className="px-6 pt-12 pb-6 bg-white/80 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" />
            <div>
              <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">TESOURARIA PRO</h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">GESTÃO FINANCEIRA ELITE</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-navy active:scale-90 transition-all">
            <span className="material-symbols-outlined text-xl">ios_share</span>
          </button>
        </div>
      </header>

      <section className="px-6 mt-8">
        {/* Card Principal de Saldo */}
        <div className="bg-navy-deep rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl mb-8">
          <div className="absolute inset-0 bg-croatia opacity-[0.05]"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] -mr-10 -mt-10"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="text-[9px] font-black uppercase text-white/40 tracking-[0.4em] block mb-2">FUNDO DE RESERVA TOTAL</span>
                <h2 className="text-5xl font-condensed tracking-tighter leading-none italic">R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                 <span className="material-symbols-outlined text-primary text-3xl fill-1">account_balance</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">PROJEÇÃO DO MÊS</p>
                  <p className="text-xl font-condensed tracking-widest text-emerald-400">R$ {currentMonthly.toLocaleString('pt-BR')} / R$ {monthlyGoal.toLocaleString('pt-BR')}</p>
                </div>
                <span className="text-2xl font-black italic text-emerald-400">{Math.round(percentageMonthly)}%</span>
              </div>
              
              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                 <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-[1.5s]" style={{ width: `${percentageMonthly}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Abas Rápidas */}
        <div className="grid grid-cols-3 gap-3 mb-10">
           <QuickAction icon="qr_code_2" label="MEU PIX" color="text-primary" />
           <QuickAction icon="list_alt" label="EXTRATO" color="text-navy" />
           <QuickAction icon="shield_with_heart" label="REGRAS" color="text-emerald-500" />
        </div>

        {/* Seção de Mensalistas */}
        <div className="space-y-6 mb-12">
          <div className="flex justify-between items-center px-2">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-navy italic">MENSALIDADES</h3>
              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">FEVEREIRO / 2026</p>
            </div>
            <span className="bg-amber-50 text-amber-600 text-[9px] font-black px-3 py-1.5 rounded-lg border border-amber-100 uppercase">
              {players.length / 2} Pendentes
            </span>
          </div>

          <div className="space-y-4">
            {players.slice(0, 10).map((p, idx) => {
              const status = idx % 3 === 0 ? 'pago' : idx % 5 === 0 ? 'atrasado' : 'pendente';
              return (
                <div key={p.id} className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-soft flex items-center justify-between group transition-all">
                   <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 ${status === 'pago' ? 'border-emerald-500/20' : 'border-slate-50'}`}>
                          <img src={p.photoUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center border-2 border-white text-[10px] ${status === 'pago' ? 'bg-emerald-500 text-white' : status === 'atrasado' ? 'bg-red-500 text-white' : 'bg-amber-400 text-white'}`}>
                          <span className="material-symbols-outlined text-[12px]">{status === 'pago' ? 'check' : status === 'atrasado' ? 'priority_high' : 'schedule'}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[13px] font-black text-navy uppercase italic leading-none mb-1.5">{p.name}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">R$ 50,00 • {status === 'pago' ? 'FECHADO' : 'EM ABERTO'}</p>
                      </div>
                   </div>
                   <button className={`w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-all ${status === 'pago' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/5 text-primary'}`}>
                      <span className="material-symbols-outlined text-lg">{status === 'pago' ? 'receipt' : 'chat'}</span>
                   </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Histórico de Despesas */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-navy italic">DESPESAS DA ARENA</h3>
          </div>

          <div className="space-y-3">
             {recentExpenses.map(exp => (
               <div key={exp.id} className="bg-slate-50 rounded-2xl p-5 border border-dashed border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined">payments</span>
                     </div>
                     <div>
                        <h5 className="text-[11px] font-black text-navy uppercase leading-none mb-1">{exp.title}</h5>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{exp.date} • {exp.type}</p>
                     </div>
                  </div>
                  <span className="text-sm font-black text-red-500 italic">- R$ {exp.value}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Floating Action Bar */}
      <div className="fixed bottom-32 left-0 right-0 px-6 z-40 pointer-events-none">
        <button className="w-full h-18 bg-white border-2 border-slate-100 text-navy rounded-[2.2rem] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all pointer-events-auto group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform group-hover:rotate-12">
            <span className="material-symbols-outlined">cloud_upload</span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">ANEXAR COMPROVANTE PIX</span>
        </button>
      </div>
    </div>
  );
};

const QuickAction = ({ icon, label, color }: { icon: string, label: string, color: string }) => (
  <button className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft flex flex-col items-center gap-2 active:scale-95 transition-all group">
    <span className={`material-symbols-outlined ${color} text-2xl transition-transform group-hover:scale-110`}>{icon}</span>
    <span className="text-[8px] font-black uppercase tracking-widest text-navy text-center">{label}</span>
  </button>
);

export default Ranking;
