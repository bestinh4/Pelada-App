
import React, { useState, useEffect } from 'react';
import { Match, Player, Page } from '../types.ts';
import { db, doc, updateDoc, deleteDoc } from '../services/firebase.ts';
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

  const handleDeleteMatch = async () => {
    if (!match?.id || isUpdating) return;
    if (!confirm("Deseja CANCELAR esta pelada definitivamente?")) return;
    setIsUpdating(true);
    try {
      await deleteDoc(doc(db, "matches", match.id));
      const resets = players.map(p => updateDoc(doc(db, "players", p.id), { status: 'pendente' }));
      await Promise.all(resets);
    } catch (e) { alert("Erro ao cancelar."); } finally { setIsUpdating(false); }
  };

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={mainLogoUrl} className="w-12 h-12 object-contain" />
          <h1 className="text-2xl font-black text-navy uppercase italic tracking-tighter leading-none">ARENA O&A</h1>
        </div>
        {isAdmin && !match && (
          <button onClick={() => onPageChange(Page.CreateMatch)} className="w-10 h-10 bg-navy text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
             <span className="material-symbols-outlined">add</span>
          </button>
        )}
      </header>

      <main className="space-y-8">
        {match ? (
          <div className="mesh-gradient-champions relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-elite">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="space-y-1">
                <span className="text-[9px] font-black opacity-60 uppercase tracking-widest block">PRÓXIMO JOGO</span>
                <h2 className="text-3xl font-condensed italic font-black uppercase">{match.location}</h2>
              </div>
              {isAdmin && (
                <button onClick={handleDeleteMatch} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-white">delete</span>
                </button>
              )}
            </div>

            <div className="space-y-6 mb-8 relative z-10">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase opacity-60 italic">
                  <span>ATLETAS</span>
                  <span>{confirmedField.length}/{fieldSlots}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-1000" style={{ width: `${lineProgress}%` }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase opacity-60 italic">
                  <span>GOLEIROS</span>
                  <span>{confirmedGKs.length}/{gkSlots}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-bright transition-all duration-1000" style={{ width: `${gkProgress}%` }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 mb-8 pt-6 border-t border-white/10 relative z-10">
               <div>
                 <p className="text-[9px] font-black opacity-50 uppercase tracking-widest">DATA</p>
                 <p className="text-sm font-black italic">{new Date(match.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}</p>
               </div>
               <div>
                 <p className="text-[9px] font-black opacity-50 uppercase tracking-widest">INÍCIO</p>
                 <p className="text-sm font-black italic">{match.time}H</p>
               </div>
            </div>

            <button 
              onClick={togglePresence}
              disabled={isUpdating}
              className={`w-full h-16 rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${isConfirmed ? 'bg-white text-navy' : 'bg-primary-bright text-white shadow-glow-red'}`}
            >
              {isUpdating ? <div className="w-5 h-5 border-2 border-current/20 border-t-current rounded-full animate-spin"></div> : (
                <>{isConfirmed ? 'CONFIRMADO ✅' : 'EU VOU JOGAR ⚽'}</>
              )}
            </button>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
             <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 border border-slate-100">
                <span className="material-symbols-outlined text-5xl">event_busy</span>
             </div>
             <div>
                <h3 className="text-xl font-black text-navy uppercase italic tracking-tighter">SEM PELADA AGENDADA</h3>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Aguarde a diretoria definir a nova data.</p>
             </div>
          </div>
        )}

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-navy italic">DESTAQUES</h3>
            <button onClick={() => onPageChange(Page.PlayerList)} className="text-[10px] font-black text-primary uppercase border-b border-primary/20">VER TUDO</button>
          </div>
          <div className="space-y-3">
            {players.filter(p => p.goals > 0).sort((a,b) => b.goals - a.goals).slice(0, 3).map((p, i) => (
              <div key={p.id} className="bg-white border border-slate-100 p-4 rounded-[1.5rem] flex items-center justify-between shadow-soft-white">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-black italic text-sm">{i+1}</div>
                  <img src={p.photoUrl} className="w-12 h-12 rounded-xl object-cover" />
                  <p className="text-sm font-black text-navy uppercase italic">{p.name}</p>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-condensed italic font-black text-primary leading-none">{p.goals}</p>
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
