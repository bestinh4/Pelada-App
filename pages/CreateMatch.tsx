
import React, { useState } from 'react';
import { Page } from '../types.ts';

const CreateMatch: React.FC<{ onMatchCreated: () => void, onPageChange: (page: Page) => void }> = ({ onMatchCreated, onPageChange }) => {
  const [numTeams, setNumTeams] = useState(2);
  const [randomDraw, setRandomDraw] = useState(true);
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-900 animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onPageChange(Page.Dashboard)} className="material-symbols-outlined text-slate-300 hover:text-primary transition-colors active:scale-90">arrow_back</button>
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={mainLogoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-primary tracking-[0.3em] leading-none mb-0.5">ARENA</span>
              <h2 className="text-sm font-black text-navy uppercase italic tracking-tighter leading-none">O&A SORTEIO</h2>
            </div>
          </div>
          <button onClick={() => alert("Settings")} className="w-10 h-10 rounded-xl bg-white shadow-soft border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>
      </header>

      <section className="px-6 mt-8">
        <div className="flex justify-between items-center mb-6 px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">CONFIGURAÇÃO TÉCNICA</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">14 Atletas Prontos</span>
        </div>

        <div className="bg-white rounded-apple-xl p-8 border border-slate-100 shadow-soft space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-croatia opacity-[0.02] pointer-events-none"></div>
          
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h4 className="font-black text-navy uppercase italic text-sm tracking-tight">Número de Times</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">7 atletas por equipe</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-2 border border-slate-100">
              <button onClick={() => setNumTeams(Math.max(2, numTeams - 1))} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-navy active:scale-90 transition-transform"><span className="material-symbols-outlined">remove</span></button>
              <span className="text-2xl font-black text-navy w-6 text-center">{numTeams}</span>
              <button onClick={() => setNumTeams(numTeams + 1)} className="w-10 h-10 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center active:scale-90 transition-transform"><span className="material-symbols-outlined">add</span></button>
            </div>
          </div>

          <div className="relative z-10 flex justify-between items-center pt-6 border-t border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                 <span className="material-symbols-outlined fill-1">shuffle</span>
              </div>
              <h4 className="font-black text-navy uppercase italic text-sm tracking-tight">Equilíbrio de Elite</h4>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={randomDraw} onChange={() => setRandomDraw(!randomDraw)} />
              <div className="w-12 h-6 bg-slate-100 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
            </label>
          </div>
        </div>
      </section>

      <section className="px-6 mt-10 mb-40">
        <div className="flex justify-between items-center mb-6 px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">EQUIPES GERADAS</h3>
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-sm">share</span> COMPARTILHAR
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <TeamCard name="Time Vermelho" color="primary" players={["Luka Modrić", "Mateo Kovačić", "Ivan Perišić"]} />
          <TeamCard name="Time Branco" color="navy" players={["Joško Gvardiol", "Andrej Kramarić"]} />
        </div>
      </section>

      <div className="fixed bottom-24 left-0 right-0 px-6 py-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-50">
        <button onClick={onMatchCreated} className="w-full h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
          <span className="material-symbols-outlined">sports</span>
          GERAR CONVOCAÇÃO
        </button>
      </div>
    </div>
  );
};

const TeamCard = ({ name, color, players }: any) => (
  <div className="bg-white rounded-apple-xl border border-slate-100 shadow-soft overflow-hidden animate-in zoom-in-95 duration-300">
    <div className={`px-6 py-4 flex justify-between items-center border-b border-slate-50 ${color === 'primary' ? 'bg-primary/[0.02]' : 'bg-navy/[0.02]'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic shadow-sm ${color === 'primary' ? 'bg-primary text-white shadow-primary/20' : 'bg-navy text-white shadow-navy/20'}`}>
          {name.split(' ')[1].charAt(0)}
        </div>
        <h4 className="font-black text-navy uppercase italic text-sm tracking-tight">{name}</h4>
      </div>
      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{players.length} ATLETAS</span>
    </div>
    <div className="p-6 space-y-4">
      {players.map((p: any) => (
        <div key={p} className="flex items-center gap-4 group">
           <div className="w-10 h-10 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 p-0.5 group-hover:scale-105 transition-transform">
             <img src={`https://i.pravatar.cc/100?u=${p}`} className="w-full h-full object-cover rounded-lg" />
           </div>
           <span className="text-xs font-black text-navy uppercase italic tracking-tight">{p}</span>
        </div>
      ))}
      <div className="pt-2 text-center border-t border-slate-50">
        <span className="text-[8px] font-black text-slate-200 uppercase tracking-[0.3em]">+ EQUIPE COMPLETA</span>
      </div>
    </div>
  </div>
);

export default CreateMatch;
