
import React from 'react';
import { Player, Page } from '../types.ts';
import { MOCK_HISTORY } from '../constants.tsx';
import { logout } from '../services/firebase.ts';

const Profile: React.FC<{ player: Player, onPageChange: (page: Page) => void }> = ({ player, onPageChange }) => {
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const handleLogout = async () => {
    if (confirm("Deseja realmente sair da Arena O&A?")) {
      try {
        await logout();
      } catch (error) {
        console.error("Erro ao deslogar:", error);
      }
    }
  };

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
              <h2 className="text-sm font-black text-navy uppercase italic tracking-tighter leading-none">SEU PERFIL</h2>
            </div>
          </div>
          <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-white shadow-soft border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      <section className="px-6 pt-10">
        {/* Avatar Section Premium */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-125"></div>
            <div className="w-36 h-36 rounded-full p-1.5 bg-white border border-slate-100 shadow-xl overflow-hidden relative z-10">
              <img src={player.photoUrl} className="w-full h-full rounded-full object-cover" alt={player.name} />
            </div>
            <div className="absolute bottom-2 right-2 w-9 h-9 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg z-20">
              <span className="material-symbols-outlined text-sm text-white font-black">verified</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-condensed tracking-tighter text-navy uppercase italic leading-none mb-2">{player.name}</h1>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest italic">
              {player.position}
            </span>
            <span className="px-4 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
              Elite PRO
            </span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-12">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 px-1">RENDIMENTO NA ARENA</h3>
          <div className="grid grid-cols-3 gap-4">
            <StatBox label="Gols" value={player.goals.toString()} highlight />
            <StatBox label="Assist" value="12" />
            <StatBox label="Jogos" value="45" />
          </div>
        </div>

        {/* History Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6 px-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">HISTÓRICO RECENTE</h3>
            <button className="text-[10px] font-black uppercase text-primary tracking-widest active:opacity-60 italic">FULL STATS</button>
          </div>

          <div className="space-y-4">
            {MOCK_HISTORY.slice(0, 3).map((match, idx) => (
              <div key={match.id} className="bg-white rounded-apple p-5 border border-slate-100 flex items-center justify-between group shadow-soft transition-transform hover:scale-[1.02] animate-in slide-in-from-right-2 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${match.score.us > match.score.them ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-primary/5 border-primary/10 text-primary'}`}>
                    <span className="material-symbols-outlined fill-1 text-2xl">
                      {match.score.us > match.score.them ? 'workspace_premium' : 'cancel'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-black text-navy uppercase italic text-sm tracking-tight leading-none mb-1">vs. {match.opponent}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{match.date} • {match.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-condensed tracking-widest ${match.score.us > match.score.them ? 'text-emerald-600' : 'text-primary'}`}>
                    {match.score.us} - {match.score.them}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings Premium */}
        <div className="pb-44">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 px-1">ÁREA DO ATLETA</h3>
          <div className="bg-white rounded-apple-xl border border-slate-100 shadow-soft overflow-hidden">
            <SettingsItem icon="notifications" label="Notificações Push" />
            <SettingsItem icon="security" label="Privacidade de Dados" />
            <SettingsItem icon="contact_support" label="Suporte Técnico" />
          </div>
        </div>
      </section>

      {/* Footer Action */}
      <div className="fixed bottom-24 left-0 right-0 px-6 py-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-50">
        <button className="w-full h-16 bg-white border border-slate-100 text-navy rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] shadow-soft active:scale-95 transition-all">
          <span className="material-symbols-outlined text-primary">edit</span>
          EDITAR FICHA TÉCNICA
        </button>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, highlight }: any) => (
  <div className="bg-white rounded-apple p-6 border border-slate-100 flex flex-col items-center shadow-soft group hover:border-primary/20 transition-all">
    <p className={`text-4xl font-condensed tracking-widest mb-1 ${highlight ? 'text-primary' : 'text-navy'}`}>{value}</p>
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-primary/50 transition-colors">{label}</p>
  </div>
);

const SettingsItem = ({ icon, label }: any) => (
  <button className="w-full p-6 flex items-center justify-between border-b border-slate-50 hover:bg-slate-50 transition-colors group">
    <div className="flex items-center gap-4 text-navy">
      <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">{icon}</span>
      <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <span className="material-symbols-outlined text-slate-200 group-hover:translate-x-1 transition-transform">chevron_right</span>
  </button>
);

export default Profile;
