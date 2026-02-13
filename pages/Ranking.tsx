
import React from 'https://esm.sh/react@18.2.0';
import { Player } from '../types.ts';

const Ranking: React.FC<{ players: Player[] }> = ({ players }) => {
  const goal = 800;
  const current = 650;
  const percentage = (current / goal) * 100;

  return (
    <div className="flex flex-col min-h-full bg-navy-deep text-white animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <button className="material-symbols-outlined text-white/60">arrow_back</button>
          <h2 className="text-lg font-bold">Gestão Financeira</h2>
          <button className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/20">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        {/* Dashboard Financeiro */}
        <div className="bg-[#0E1324] rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group mb-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-1">Total Arrecadado</span>
              <h2 className="text-3xl font-black tracking-tight">R$ {current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
              <p className="text-[10px] text-white/20 font-bold mt-1">Meta: R$ {goal.toLocaleString('pt-BR')} (20 mensalistas)</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <span className="material-symbols-outlined text-3xl fill-1">account_balance_wallet</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-emerald-500">{Math.round(percentage)}% Concluído</span>
              <span className="text-white/20">Outubro 2023</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Search e Filtros */}
        <div className="relative mb-6">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/20">search</span>
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            className="w-full h-14 bg-[#0E1324] border border-white/5 rounded-2xl pl-12 pr-6 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div className="flex gap-2 mb-8">
          <FilterChip label="Todos (20)" active />
          <FilterChip label="Pagos (16)" />
          <FilterChip label="Pendentes (4)" />
        </div>

        {/* Lista de Transações */}
        <div className="space-y-4 pb-40">
          {players.map((p, idx) => (
            <div key={p.id} className="bg-[#0E1324] rounded-3xl p-5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={p.photoUrl} className="w-12 h-12 rounded-full object-cover grayscale opacity-50" alt={p.name} />
                  {idx % 2 === 0 && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#0E1324] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[10px] text-white">check</span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{p.name}</h4>
                  <p className="text-[10px] text-white/20 font-medium">Via Pix • 05/10/2023</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-1 block ${idx % 2 === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {idx % 2 === 0 ? 'PAGO' : 'PENDENTE'}
                </span>
                <p className="text-sm font-black">R$ 40,00</p>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Botão Flutuante */}
      <div className="fixed bottom-24 left-0 right-0 px-6 py-4 bg-gradient-to-t from-navy-deep via-navy-deep to-transparent z-50">
        <button className="w-full h-16 bg-primary rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 active:scale-95 transition-all">
          <span className="material-symbols-outlined">payments</span>
          Registrar Pagamento
        </button>
      </div>
    </div>
  );
};

const FilterChip = ({ label, active }: any) => (
  <button className={`px-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-primary text-white' : 'bg-white/5 text-white/30 border border-white/5'}`}>
    {label}
  </button>
);

export default Ranking;
