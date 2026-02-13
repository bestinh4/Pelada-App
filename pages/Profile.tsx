
import React from 'react';
import { Player, Page } from '../types.ts';
import { logout } from '../services/firebase.ts';

const Profile: React.FC<{ player: Player, onPageChange: (page: Page) => void }> = ({ player, onPageChange }) => {
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const handleLogout = async () => {
    if (confirm("Deseja realmente sair da Arena O&A?")) {
      await logout();
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" />
            <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">MEU SCOUT</h2>
          </div>
          <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary active:scale-90">
             <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </header>

      <section className="px-6 mt-10 flex flex-col items-center">
        {/* Avatar Section */}
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] scale-150"></div>
           <div className="w-40 h-40 rounded-[3rem] border-8 border-white shadow-2xl overflow-hidden relative z-10 rotate-3 transition-transform hover:rotate-0">
             <img src={player.photoUrl} className="w-full h-full object-cover" />
           </div>
           <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-navy text-white rounded-2xl border-4 border-white flex items-center justify-center z-20 shadow-xl">
             <span className="text-lg font-black italic">PRO</span>
           </div>
        </div>
        
        <h1 className="text-4xl font-condensed text-navy uppercase italic tracking-tighter mb-1">{player.name}</h1>
        <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-12 italic">{player.position} • ARENA O&A ELITE</p>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-4 mb-10">
           <StatCard label="GOLS" value={player.goals.toString()} icon="sports_soccer" color="text-primary" />
           <StatCard label="ASSIST" value="12" icon="handshake" color="text-navy" />
        </div>

        {/* Skills Section */}
        <div className="w-full bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft space-y-6 mb-12">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 px-1">ATRIBUTOS TÉCNICOS</h3>
           <SkillProgress label="Ataque" value={player.skills?.attack || 85} color="bg-primary" />
           <SkillProgress label="Defesa" value={player.skills?.defense || 70} color="bg-navy" />
           <SkillProgress label="Stamina" value={player.skills?.stamina || 92} color="bg-emerald-500" />
        </div>

        <button className="w-full h-18 bg-slate-100 text-navy rounded-3xl font-black uppercase text-[11px] tracking-widest active:scale-95 transition-all mb-4 border border-slate-200">
           EDITAR PERFIL TÉCNICO
        </button>
      </section>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-soft text-center group">
     <span className={`material-symbols-outlined ${color} mb-3 group-hover:scale-125 transition-transform`}>{icon}</span>
     <p className="text-4xl font-condensed text-navy mb-1">{value}</p>
     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
  </div>
);

const SkillProgress = ({ label, value, color }: any) => (
  <div className="space-y-2">
     <div className="flex justify-between text-[10px] font-black uppercase italic tracking-widest text-navy">
        <span>{label}</span>
        <span className="text-slate-300">{value}%</span>
     </div>
     <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }}></div>
     </div>
  </div>
);

export default Profile;
