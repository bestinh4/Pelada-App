
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
            <div className="w-10 h-10">
              <img src={mainLogoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-[8px] font-black uppercase text-primary tracking-widest leading-none block">ARENA</span>
              <h2 className="text-sm font-black text-navy uppercase italic tracking-tighter leading-none">MEU PERFIL</h2>
            </div>
          </div>
          <button onClick={handleLogout} className="text-[10px] font-black text-primary uppercase tracking-widest italic flex items-center gap-1">
             SAIR <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>
      </header>

      <section className="px-6 mt-10 flex flex-col items-center">
        <div className="relative mb-6">
           <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150"></div>
           <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden relative z-10">
             <img src={player.photoUrl} className="w-full h-full object-cover" />
           </div>
        </div>
        
        <h1 className="text-3xl font-condensed text-navy uppercase italic tracking-tight mb-1">{player.name}</h1>
        <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-8">{player.position} • ELITE PRO</p>

        <div className="w-full grid grid-cols-2 gap-4 mb-10">
           <div className="bg-white p-6 rounded-apple-xl border border-slate-100 shadow-soft text-center">
              <p className="text-2xl font-black text-navy">{player.goals}</p>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">GOLS NA CARREIRA</p>
           </div>
           <div className="bg-white p-6 rounded-apple-xl border border-slate-100 shadow-soft text-center">
              <p className="text-2xl font-black text-navy">12</p>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">ASSISTÊNCIAS</p>
           </div>
        </div>

        <div className="w-full space-y-3">
           <SettingsButton icon="shield_person" label="Configurações da Conta" />
           <SettingsButton icon="history" label="Histórico de Partidas" />
           <SettingsButton icon="help_outline" label="Suporte ao Atleta" />
        </div>
      </section>
    </div>
  );
};

const SettingsButton = ({ icon, label }: any) => (
  <button className="w-full p-5 bg-white rounded-2xl border border-slate-100 shadow-soft flex items-center justify-between active:scale-95 transition-all">
    <div className="flex items-center gap-4">
      <span className="material-symbols-outlined text-slate-300">{icon}</span>
      <span className="text-[10px] font-black uppercase text-navy tracking-widest">{label}</span>
    </div>
    <span className="material-symbols-outlined text-slate-200">chevron_right</span>
  </button>
);

export default Profile;
