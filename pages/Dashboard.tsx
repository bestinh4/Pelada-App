
import React, { useState } from 'https://esm.sh/react@18.2.0';
import { Match, Player, Page } from '../types.ts';
import { logout, db, doc, updateDoc } from '../services/firebase.ts';

interface DashboardProps {
  match: Match | null;
  players: Player[];
  user: any;
  onPageChange: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ match, players, user, onPageChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Logos
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const currentPlayer = players.find(p => p.id === user?.uid);
  const isConfirmed = currentPlayer?.status === 'presente';
  
  const totalSlots = match?.totalSlots || 18;
  const confirmedPlayers = players.filter(p => p.status === 'presente');
  const filledSlots = confirmedPlayers.length;
  const remainingSlots = Math.max(0, totalSlots - filledSlots);

  const handleLogout = async () => {
    if (confirm("Deseja realmente sair da sua conta na Arena O&A?")) {
      try {
        await logout();
      } catch (error) {
        console.error("Erro ao deslogar:", error);
      }
    }
  };

  const updatePresence = async (status: 'presente' | 'pendente') => {
    if (!user || isUpdating) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "players", user.uid), { status });
    } catch (e) {
      console.error("Erro ao atualizar presença:", e);
    } finally {
      setIsUpdating(false);
    }
  };

  const openMap = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=Arena+Central+Soccer`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-900 animate-in fade-in duration-500">
      {/* Header com Logo no Canto Superior Esquerdo */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-30 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center cursor-pointer" onClick={() => onPageChange(Page.Dashboard)}>
            <img 
              src={mainLogoUrl} 
              alt="O&A Elite Pro Logo" 
              className="w-full h-full object-contain drop-shadow-lg" 
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em] leading-none mb-1">ARENA</span>
            <h1 className="text-xl font-black tracking-tighter text-navy uppercase italic leading-none">O&A ELITE</h1>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-11 h-11 rounded-2xl bg-white shadow-soft border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90"
          title="Sair"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </header>

      {/* Próxima Partida Section */}
      <section className="px-6 mt-6 mb-4">
        <div className="flex items-center justify-between mb-5 px-1">
           <h3 className="text-lg font-black text-navy uppercase italic tracking-tight">Próxima Convocação</h3>
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">LIVE</span>
           </div>
        </div>
        
        <div className="relative overflow-hidden rounded-apple-xl bg-white border border-slate-100 shadow-soft group min-h-[320px]">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-croatia opacity-[0.3]"></div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl transition-transform group-hover:scale-110 duration-700"></div>
             
             {/* Marca d'água de fundo */}
             <img 
               src={mainLogoUrl} 
               alt="" 
               className="absolute -right-12 top-1/2 -translate-y-1/2 w-64 h-64 object-contain opacity-[0.05] pointer-events-none rotate-12" 
             />
          </div>

          <div className="relative z-10 p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-wider">Inscrições Abertas</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider">Sábado</span>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex flex-col">
                <span className="text-5xl font-condensed tracking-tighter text-navy">
                  {match ? new Date(match.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '24 Out'}
                </span>
                <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Data do Jogo</span>
              </div>
              <div className="w-px h-12 bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-5xl font-condensed tracking-tighter text-primary">
                  {match?.time || '18:00'}
                </span>
                <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Início</span>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-slate-50/90 backdrop-blur rounded-2xl p-5 mb-8 flex items-center justify-between border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-slate-50">
                  <span className="material-symbols-outlined fill-1 text-2xl">location_on</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-navy uppercase italic">{match?.location || 'Arena Central'}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">
                    {match?.type || 'Society'} • Gramado Elite
                  </p>
                </div>
              </div>
              <button 
                onClick={openMap}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 hover:text-primary transition-colors active:scale-90"
              >
                <span className="material-symbols-outlined text-[20px]">map</span>
              </button>
            </div>

            <div className="space-y-4">
              <div 
                className="flex justify-between items-end cursor-pointer group/inscritos" 
                onClick={() => onPageChange(Page.PlayerList)}
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/inscritos:text-primary transition-colors">Atletas Inscritos</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-navy">{filledSlots}</span>
                  <span className="text-xs text-slate-300 font-bold">/ {totalSlots}</span>
                </div>
              </div>
              <div 
                className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50 shadow-inner cursor-pointer"
                onClick={() => onPageChange(Page.PlayerList)}
              >
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(237,29,35,0.4)]" 
                  style={{ width: `${(filledSlots / totalSlots) * 100}%` }}
                ></div>
              </div>
              {remainingSlots > 0 && (
                <div className="flex items-center gap-2 bg-primary/5 p-3 rounded-xl border border-primary/10">
                  <span className="material-symbols-outlined text-primary text-base">info</span>
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider italic">
                    Faltam {remainingSlots} jogadores para fechar a lista!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="px-6 space-y-4 mb-10">
        <button 
          onClick={() => updatePresence('presente')}
          disabled={isUpdating}
          className={`w-full h-20 rounded-apple flex items-center justify-center gap-4 font-black uppercase tracking-[0.15em] text-xs transition-all shadow-xl active:scale-95 disabled:opacity-50 ${isConfirmed ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-primary text-white shadow-primary/30'}`}
        >
          <span className="material-symbols-outlined fill-1 text-3xl">
            {isConfirmed ? 'check_circle' : 'sports_soccer'}
          </span>
          {isConfirmed ? 'PRESENÇA CONFIRMADA' : 'EU VOU PRO JOGO'}
        </button>
        <button 
          onClick={() => updatePresence('pendente')}
          disabled={isUpdating}
          className="w-full h-16 rounded-apple bg-white border border-slate-200 text-slate-400 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] shadow-sm active:scale-95 transition-all hover:bg-slate-50 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">close</span>
          NÃO POSSO IR
        </button>
      </section>

      {/* User Status Card */}
      <section className="px-6 grid grid-cols-1 gap-4 mb-32">
        <div className="bg-white rounded-apple-xl p-7 border border-slate-100 flex items-center gap-5 shadow-soft hover:shadow-lg transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-navy/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 p-1 border-2 border-slate-50 overflow-hidden">
              <img src={currentPlayer?.photoUrl || user?.photoURL} className="w-full h-full object-cover rounded-xl" alt="Perfil" />
            </div>
            {isConfirmed && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[12px] font-black">check</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest block mb-0.5 italic">SEU STATUS</span>
            <h4 className="text-xl font-black text-navy leading-tight uppercase italic tracking-tighter">
              {isConfirmed ? 'CONVOCADO' : 'PENDENTE'}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isConfirmed ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isConfirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isConfirmed ? 'Titular' : 'Reserva'}
              </p>
            </div>
          </div>
          <div className="text-right border-l border-slate-100 pl-6">
             <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest block mb-1">POSIÇÃO</span>
             <p className="text-xl font-condensed text-primary tracking-widest uppercase">
               {currentPlayer?.position?.split(' ')[0] || 'TBD'}
             </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
