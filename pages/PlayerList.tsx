
import React, { useState } from 'react';
import { Player, Page } from '../types.ts';

const PlayerList: React.FC<{ players: Player[], currentUser: any, onPageChange: (page: Page) => void }> = ({ players, currentUser, onPageChange }) => {
  const [activeTab, setActiveTab] = useState<'confirmados' | 'espera'>('confirmados');
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const confirmed = players.filter(p => p.status === 'presente');
  const waiting = players.filter(p => p.status === 'pendente');

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" />
            <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter">CONVOCAÇÃO ELITE</h2>
          </div>
          <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-navy active:scale-90">
            <span className="material-symbols-outlined text-xl">person_search</span>
          </button>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] border border-slate-200">
          <TabButton 
            active={activeTab === 'confirmados'} 
            onClick={() => setActiveTab('confirmados')}
            label="CONFIRMADOS"
            count={confirmed.length}
          />
          <TabButton 
            active={activeTab === 'espera'} 
            onClick={() => setActiveTab('espera')}
            label="NA ESPERA"
            count={waiting.length}
          />
        </div>
      </header>

      <section className="px-6 mt-8 space-y-4">
        {(activeTab === 'confirmados' ? confirmed : waiting).map((p, idx) => (
          <div key={p.id} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-soft flex items-center gap-5 transition-all hover:border-primary/20 group">
            {/* Player Image with Rank */}
            <div className="relative">
              <div className="w-16 h-16 rounded-[1.2rem] overflow-hidden border-2 border-slate-50 shadow-sm group-hover:scale-105 transition-transform">
                <img src={p.photoUrl} className="w-full h-full object-cover" alt={p.name} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-navy rounded-lg border-2 border-white flex items-center justify-center">
                <span className="text-[10px] font-black text-white italic">PRO</span>
              </div>
            </div>

            {/* Player Info & Skills */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-black text-navy uppercase italic tracking-tight text-sm">{p.name}</h4>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{p.position}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-primary">{p.goals}</span>
                  <span className="material-symbols-outlined text-primary text-xs fill-1">sports_soccer</span>
                </div>
              </div>

              {/* Skill Bars ( FIFA Style ) */}
              <div className="flex gap-2">
                 <SkillBar label="ATA" value={p.skills?.attack || 70} color="bg-primary" />
                 <SkillBar label="DEF" value={p.skills?.defense || 70} color="bg-navy" />
                 <SkillBar label="STM" value={p.skills?.stamina || 70} color="bg-emerald-500" />
              </div>
            </div>

            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </div>
          </div>
        ))}
      </section>

      {/* Modern FAB */}
      <button className="fixed bottom-32 right-8 w-16 h-16 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center active:scale-95 transition-all z-40 border-4 border-slate-50">
        <span className="material-symbols-outlined text-3xl">add_reaction</span>
      </button>
    </div>
  );
};

const TabButton = ({ active, onClick, label, count }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${active ? 'bg-white text-navy shadow-sm' : 'text-slate-400 hover:text-navy'}`}
  >
    {label}
    <span className={`px-2 py-0.5 rounded-md text-[8px] ${active ? 'bg-navy text-white' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
  </button>
);

const SkillBar = ({ label, value, color }: any) => (
  <div className="flex-1 flex flex-col gap-1">
    <div className="flex justify-between text-[7px] font-black text-slate-300 uppercase tracking-tighter">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default PlayerList;
