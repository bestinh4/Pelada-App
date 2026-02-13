
import React, { useState } from 'react';
import { Match, Player, Page } from '../types.ts';
import { db, doc, updateDoc } from '../services/firebase.ts';

interface DashboardProps {
  match: Match | null;
  players: Player[];
  user: any;
  onPageChange: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ match, players = [], user, onPageChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const currentPlayer = players.find(p => p.id === user?.uid);
  const isConfirmed = currentPlayer?.status === 'presente';
  
  const confirmedPlayers = players.filter(p => p.status === 'presente');
  const confirmedGKs = confirmedPlayers.filter(p => p.position === 'Goleiro').length;
  const confirmedField = confirmedPlayers.filter(p => p.position !== 'Goleiro').length;

  const fieldSlotsLimit = match?.fieldSlots || 30;
  const gkSlotsLimit = match?.gkSlots || 5;

  // Calculando Estatísticas da Arena
  const topArtilheiros = [...players].sort((a, b) => b.goals - a.goals).slice(0, 3);
  const topGarcons = [...players].sort((a, b) => b.assists - a.assists).slice(0, 3);
  const goleiroDestaque = [...players]
    .filter(p => p.position === 'Goleiro')
    .sort((a, b) => (a.concededGoals || 0) - (b.concededGoals || 0))[0];

  const togglePresence = async () => {
    if (!user || isUpdating) return;

    if (!isConfirmed) {
      const isGK = currentPlayer?.position === 'Goleiro';
      if (isGK && confirmedGKs >= gkSlotsLimit) {
        alert("Vagas de Goleiro esgotadas!");
        return;
      }
      if (!isGK && confirmedField >= fieldSlotsLimit) {
        alert("Vagas de Linha esgotadas!");
        return;
      }
    }

    setIsUpdating(true);
    try {
      const playerRef = doc(db, "players", user.uid);
      await updateDoc(playerRef, { status: isConfirmed ? 'pendente' : 'presente' });
    } catch (e) { console.error(e); }
    finally { setIsUpdating(false); }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-700">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-white/50 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <img src={mainLogoUrl} className="w-12 h-12 object-contain" alt="Logo" />
          <div>
            <span className="text-[8px] font-black uppercase text-primary tracking-[0.4em] leading-none mb-0.5">ARENA</span>
            <h1 className="text-xl font-black tracking-tighter text-navy uppercase italic leading-none">O&A ELITE</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 border border-slate-200">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-black text-navy uppercase tracking-widest">LIVE</span>
        </div>
      </header>

      <section className="px-6 mt-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-soft p-8 mb-6">
          <div className="absolute inset-0 bg-croatia opacity-[0.05]"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="inline-block px-3 py-1 rounded-md bg-primary text-white text-[8px] font-black uppercase tracking-widest mb-4">PRÓXIMA PELADA</span>
                <h2 className="text-4xl font-condensed text-navy tracking-tight leading-none uppercase mb-2">{match?.location || "Carregando Arena..."}</h2>
                <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  {match?.date ? new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '---'} • {match?.time || '--:--'}h
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black uppercase text-slate-400">LINHA</span>
                  <span className="text-xs font-black text-navy">{confirmedField}/{fieldSlotsLimit}</span>
                </div>
                <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (confirmedField / fieldSlotsLimit) * 100)}%` }}></div>
                </div>
              </div>
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black uppercase text-slate-400">GOLEIROS</span>
                  <span className="text-xs font-black text-navy">{confirmedGKs}/{gkSlotsLimit}</span>
                </div>
                <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (confirmedGKs / gkSlotsLimit) * 100)}%` }}></div>
                </div>
              </div>
            </div>

            <button 
              onClick={togglePresence}
              disabled={isUpdating}
              className={`w-full h-18 rounded-[1.5rem] flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl active:scale-95 ${isConfirmed ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-primary text-white shadow-primary/30'}`}
            >
              <span className="material-symbols-outlined text-2xl">{isConfirmed ? 'check_circle' : 'person_add'}</span>
              {isConfirmed ? 'VOCÊ ESTÁ NA LISTA' : 'QUERO JOGAR'}
            </button>
          </div>
        </div>

        {/* Card Único de Perfil Atual */}
        <div className="bg-white rounded-apple-xl p-6 border border-slate-100 shadow-soft flex items-center justify-between mb-8">
           <div>
              <p className="text-[8px] font-black uppercase text-slate-300 tracking-widest mb-1">SUA CONVOCAÇÃO</p>
              <p className="text-lg font-black italic text-navy uppercase">{currentPlayer?.position || 'RESERVA'}</p>
           </div>
           <div className="flex items-center gap-2 bg-navy/5 px-4 py-2 rounded-xl">
              <span className="material-symbols-outlined text-navy text-lg">workspace_premium</span>
              <span className="text-[10px] font-black text-navy uppercase">RANK #1</span>
           </div>
        </div>
      </section>

      {/* Estatísticas da Temporada - Seção Sincronizada com 2026 */}
      <section className="px-6 pb-20 space-y-8">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">ESTATÍSTICAS DA ARENA</h3>
          <span className="text-[9px] font-black text-primary uppercase italic">TEMPORADA 2026</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Artilheiros */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <span className="material-symbols-outlined text-6xl">local_fire_department</span>
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">sports_soccer</span>
              TOP 3 ARTILHEIROS
            </h4>
            <div className="space-y-4">
              {topArtilheiros.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-black italic ${i === 0 ? 'text-amber-500' : 'text-slate-300'}`}>{i + 1}º</span>
                    <img src={p.photoUrl} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                    <span className="text-xs font-black text-navy uppercase italic">{p.name}</span>
                  </div>
                  <span className="text-sm font-black text-navy tracking-tighter">{p.goals} GOLS</span>
                </div>
              ))}
            </div>
          </div>

          {/* Garçons */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <span className="material-symbols-outlined text-6xl">handshake</span>
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-navy mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">assistant</span>
              TOP 3 GARÇONS
            </h4>
            <div className="space-y-4">
              {topGarcons.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-black italic ${i === 0 ? 'text-slate-400' : 'text-slate-300'}`}>{i + 1}º</span>
                    <img src={p.photoUrl} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                    <span className="text-xs font-black text-navy uppercase italic">{p.name}</span>
                  </div>
                  <span className="text-sm font-black text-navy tracking-tighter">{p.assists} ASSIST</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goleiro Menos Vazado */}
          {goleiroDestaque && (
            <div className="bg-navy rounded-[2.5rem] p-8 text-white shadow-2xl shadow-navy/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-croatia opacity-10"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4">GOLEIRO MENOS VAZADO</h4>
                  <div className="flex items-center gap-4">
                    <img src={goleiroDestaque.photoUrl} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20" />
                    <div>
                      <p className="text-xl font-black uppercase italic tracking-tighter leading-none">{goleiroDestaque.name}</p>
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mt-2">Muralha da Arena</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-condensed tracking-widest">{goleiroDestaque.concededGoals}</p>
                   <p className="text-[8px] font-black uppercase opacity-40">GOLS SOFRIDOS</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
