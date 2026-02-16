
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
          <h1 className="text-2xl font-black text-navy uppercase italic tracking-tighter leading-none">ARENA O&A</h1>
        </div>
        {isAdmin && !match && (
          <button onClick={() => onPageChange(Page.CreateMatch)} className="w-12 h-12 bg-navy text-white rounded-2xl flex items-center justify-center shadow-elite animate-float">
             <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        )}
      </header>

      <main className="space-y-8">
        {match ? (
          <div className="mesh-gradient-champions relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-elite min-h-[380px] flex flex-col justify-between">
            {/* LOGO FLUTUANTE DE FUNDO */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-[0.15] pointer-events-none animate-float select-none">
                <img src={mainLogoUrl} className="w-full h-full object-contain brightness-[200%] grayscale" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <span className="text-[9px] font-black opacity-60 uppercase tracking-[0.3em] block">PRÓXIMO RACHA</span>
                  <h2 className="text-4xl font-condensed italic font-black uppercase tracking-tight">{match.location}</h2>
                </div>
                {isAdmin && (
                  <button onClick={handleClearAllMatches} className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 active:bg-primary transition-all">
                    <span className="material-symbols-outlined text-white">delete_sweep</span>
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase opacity-60 italic">
                    <span>JOGADORES DE LINHA</span>
                    <span>{confirmedField.length}/{fieldSlots}</span>
                  </div>
                  <div className="h-2.5 bg-white/20 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-white shadow-[0_0_15px_white] transition-all duration-1000 rounded-full" style={{ width: `${lineProgress}%` }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase opacity-60 italic">
                    <span>GOLEIROS</span>
                    <span>{confirmedGKs.length}/{gkSlots}</span>
                  </div>
                  <div className="h-2.5 bg-white/20 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-primary-bright shadow-[0_0_15px_#ff1a1a] transition-all duration-1000 rounded-full" style={{ width: `${gkProgress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6">
              <div className="flex items-center gap-8 mb-6 border-t border-white/10 pt-6">
                 <div className="flex items-center gap-3">
                   <span className="material-symbols-outlined text-sm opacity-40">event</span>
                   <p className="text-sm font-black italic">{new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}</p>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="material-symbols-outlined text-sm opacity-40">timer</span>
                   <p className="text-sm font-black italic">{match.time}H</p>
                 </div>
              </div>

              <button 
                onClick={togglePresence}
                disabled={isUpdating}
                className={`w-full h-18 rounded-[1.75rem] font-black uppercase text-[11px] tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${isConfirmed ? 'bg-white text-navy' : 'bg-primary-bright text-white shadow-glow-red'}`}
              >
                {isUpdating ? <div className="w-5 h-5 border-2 border-current/20 border-t-current rounded-full animate-spin"></div> : (
                  <>{isConfirmed ? 'CONFIRMADO ✅' : 'MARCAR PRESENÇA ⚽'}</>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-8 animate-fade-in bg-white border border-slate-100 rounded-[3rem] shadow-soft-white p-10">
             <img src={mainLogoUrl} className="w-24 h-24 object-contain opacity-20 animate-float" />
             <div>
                <h3 className="text-2xl font-black text-navy uppercase italic tracking-tighter">LISTA FECHADA</h3>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-3">Aguardando definição da diretoria</p>
             </div>
             {isAdmin && (
               <button onClick={() => onPageChange(Page.CreateMatch)} className="h-16 px-10 bg-navy text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-elite active:scale-95 transition-all">
                 ABRIR NOVA CONVOCAÇÃO
               </button>
             )}
          </div>
        )}

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-navy italic">DESTAQUES</h3>
            <button onClick={() => onPageChange(Page.PlayerList)} className="text-[10px] font-black text-primary uppercase">VER TODOS</button>
          </div>
          <div className="space-y-4">
            {players.filter(p => p.goals > 0).sort((a,b) => b.goals - a.goals).slice(0, 3).map((p, i) => (
              <div key={p.id} className="bg-white border border-slate-100 p-5 rounded-[2rem] flex items-center justify-between shadow-soft-white">
                <div className="flex items-center gap-5">
                  <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-black italic text-sm shadow-inner">{i+1}</div>
                  <img src={p.photoUrl} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-50" />
                  <p className="text-[15px] font-black text-navy uppercase italic">{p.name}</p>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-condensed italic font-black text-primary leading-none">{p.goals}</p>
                   <p className="text-[8px] font-black text-slate-300 uppercase">GOLS</p>
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
