
import React, { useState, useEffect } from 'react';
import { Match, Player, Page } from '../types.ts';
import { db, doc, updateDoc, deleteDoc, collection, getDocs } from '../services/firebase.ts';
import { MASTER_ADMIN_EMAIL } from '../constants.tsx';

interface DashboardProps {
  match: Match | null;
  players: Player[];
  user: any;
  onPageChange: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ match, players = [], user, onPageChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lineProgress, setLineProgress] = useState(0);
  const [gkProgress, setGkProgress] = useState(0);

  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const currentPlayer = players.find(p => p.id === user?.uid);
  const isConfirmed = currentPlayer?.status === 'presente';
  const isAdmin = currentPlayer?.role === 'admin' || user?.email === MASTER_ADMIN_EMAIL;
  
  const confirmedPlayers = players.filter(p => p.status === 'presente');
  const fieldSlots = match?.fieldSlots || 30;
  const gkSlots = match?.gkSlots || 4;

  const confirmedGKs = confirmedPlayers.filter(p => p.position === 'Goleiro');
  const confirmedField = confirmedPlayers.filter(p => p.position !== 'Goleiro');

  useEffect(() => {
    if (!match) {
      setLineProgress(0);
      setGkProgress(0);
      return;
    }
    const timer = setTimeout(() => {
      setLineProgress(Math.min(100, (confirmedField.length / fieldSlots) * 100));
      setGkProgress(Math.min(100, (confirmedGKs.length / gkSlots) * 100));
    }, 400);
    return () => clearTimeout(timer);
  }, [confirmedField.length, confirmedGKs.length, fieldSlots, gkSlots, match]);

  const togglePresence = async () => {
    if (!user || isUpdating || !match) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "players", user.uid), { 
        status: isConfirmed ? 'pendente' : 'presente' 
      });
    } catch (e) { alert("Erro de conexão."); } finally { setIsUpdating(false); }
  };

  const handleClearAllMatches = async () => {
    if (isUpdating) return;
    if (!confirm("⚠️ ATENÇÃO: Deseja apagar a pelada atual? Isso resetará a lista de presença para a próxima.")) return;
    
    setIsUpdating(true);
    try {
      const matchesSnap = await getDocs(collection(db, "matches"));
      const deletePromises = matchesSnap.docs.map(d => deleteDoc(doc(db, "matches", d.id)));
      await Promise.all(deletePromises);

      const resetPromises = players.map(p => updateDoc(doc(db, "players", p.id), { status: 'pendente' }));
      await Promise.all(resetPromises);
      
      alert("Pronto! Pelada encerrada.");
    } catch (e) { 
      alert("Erro ao limpar sistema."); 
    } finally { 
      setIsUpdating(false); 
    }
  };

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={mainLogoUrl} className="w-14 h-14 object-contain animate-float" />
          <h1 className="text-2xl font-black text-navy uppercase italic tracking-tighter leading-none">PELADA O&A</h1>
        </div>
        {isAdmin && !match && (
          <button onClick={() => onPageChange(Page.CreateMatch)} className="w-12 h-12 bg-navy text-white rounded-2xl flex items-center justify-center shadow-elite animate-float">
             <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        )}
      </header>

      <main className="space-y-8">
        {match ? (
          <div className="bg-white border border-slate-100 relative overflow-hidden rounded-[3rem] p-10 text-navy shadow-elite min-h-[520px] flex flex-col justify-between">
            {/* LOGO FLUTUANTE DE FUNDO (MARCA D'ÁGUA EM TEMA CLARO) - OPACIDADE AJUSTADA */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-[0.08] pointer-events-none animate-float select-none">
                <img src={mainLogoUrl} className="w-full h-full object-contain grayscale" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] block">PRÓXIMA PELADA</span>
                  <h2 className="text-5xl font-condensed italic font-black uppercase tracking-tight text-navy leading-none">{match.location}</h2>
                </div>
                {isAdmin && (
                  <button onClick={handleClearAllMatches} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 active:bg-primary active:text-white transition-all">
                    <span className="material-symbols-outlined">delete_sweep</span>
                  </button>
                )}
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-navy/40 italic">
                    <span>JOGADORES DE LINHA</span>
                    <span className="text-navy">{confirmedField.length} / {fieldSlots}</span>
                  </div>
                  <div className="h-3.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                    <div className="h-full bg-navy shadow-[0_0_15px_rgba(0,81,162,0.3)] transition-all duration-1000 rounded-full" style={{ width: `${lineProgress}%` }}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-navy/40 italic">
                    <span>GOLEIROS</span>
                    <span className="text-primary">{confirmedGKs.length} / {gkSlots}</span>
                  </div>
                  <div className="h-3.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                    <div className="h-full bg-primary shadow-[0_0_15px_rgba(227,6,19,0.3)] transition-all duration-1000 rounded-full" style={{ width: `${gkProgress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-10">
              <div className="flex items-center gap-10 mb-8 border-t border-slate-100 pt-8">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                     <span className="material-symbols-outlined text-navy text-sm">calendar_today</span>
                   </div>
                   <p className="text-sm font-black italic uppercase">{new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}</p>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                     <span className="material-symbols-outlined text-navy text-sm">schedule</span>
                   </div>
                   <p className="text-sm font-black italic uppercase">{match.time}H</p>
                 </div>
              </div>

              <div className="flex flex-col gap-5">
                <button 
                  onClick={togglePresence}
                  disabled={isUpdating}
                  className={`w-full h-20 rounded-[2rem] font-black uppercase text-[12px] tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${isConfirmed ? 'bg-navy text-white shadow-elite' : 'bg-primary text-white shadow-glow-red'}`}
                >
                  {isUpdating ? <div className="w-6 h-6 border-3 border-current/20 border-t-current rounded-full animate-spin"></div> : (
                    <>{isConfirmed ? 'VOCÊ ESTÁ CONFIRMADO ✅' : 'MARCAR MINHA PRESENÇA ⚽'}</>
                  )}
                </button>

                {isAdmin && confirmedPlayers.length >= 4 && (
                  <button 
                    onClick={() => onPageChange(Page.TeamBalancing)}
                    className="w-full h-16 bg-white text-navy border-2 border-slate-100 rounded-[1.75rem] font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 shadow-soft-white"
                  >
                    <span className="material-symbols-outlined text-lg">shuffle</span>
                    SORTEIO DE TIMES
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-10 animate-fade-in bg-white border border-slate-100 rounded-[4rem] shadow-soft-white p-12">
             <img src={mainLogoUrl} className="w-32 h-32 object-contain opacity-20 animate-float" />
             <div>
                <h3 className="text-3xl font-black text-navy uppercase italic tracking-tighter">LISTA FECHADA</h3>
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] mt-4">Aguardando convocação da diretoria</p>
             </div>
             {isAdmin && (
               <button onClick={() => onPageChange(Page.CreateMatch)} className="h-18 px-12 bg-navy text-white rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-elite active:scale-95 transition-all flex items-center gap-3">
                 <span className="material-symbols-outlined">add_circle</span>
                 ABRIR CONVOCAÇÃO
               </button>
             )}
          </div>
        )}

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-navy italic">ARTILHARIA</h3>
            <button onClick={() => onPageChange(Page.PlayerList)} className="text-[10px] font-black text-primary uppercase">VER TODOS</button>
          </div>
          <div className="space-y-4">
            {players.filter(p => p.goals > 0).sort((a,b) => b.goals - a.goals).slice(0, 3).map((p, i) => (
              <div key={p.id} className="bg-white border border-slate-100 p-6 rounded-[2.5rem] flex items-center justify-between shadow-soft-white group hover:border-navy/20 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 text-navy border border-slate-100 flex items-center justify-center font-black italic text-sm group-hover:bg-navy group-hover:text-white transition-all">{i+1}</div>
                  <img src={p.photoUrl} className="w-16 h-16 rounded-[1.5rem] object-cover border-2 border-slate-50" />
                  <p className="text-[16px] font-black text-navy uppercase italic">{p.name}</p>
                </div>
                <div className="text-right">
                   <p className="text-4xl font-condensed italic font-black text-primary leading-none tracking-tighter">{p.goals}</p>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">GOLS</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
