
import React from 'https://esm.sh/react@18.2.0';
import { Player, Page } from '../types.ts';
import { MOCK_HISTORY } from '../constants.tsx';
import { logout } from '../services/firebase.ts';

const Profile: React.FC<{ player: Player, onPageChange: (page: Page) => void }> = ({ player, onPageChange }) => {
  const handleLogout = async () => {
    if (confirm("Deseja realmente sair da Arena O&A?")) {
      try {
        await logout();
      } catch (error) {
        console.error("Erro ao deslogar:", error);
      }
    }
  };

  const handleEditProfile = () => {
    alert("Edição de perfil será implementada na próxima atualização v3.0");
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-900 animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => onPageChange(Page.Dashboard)} className="material-symbols-outlined text-slate-400 active:scale-90 transition-transform">arrow_back</button>
          <h2 className="text-lg font-bold text-navy">Perfil do Jogador</h2>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center border border-red-100 active:scale-95 transition-all"
            title="Sair"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full p-1.5 border-4 border-primary/20 shadow-[0_0_40px_rgba(237,29,35,0.1)] overflow-hidden">
              <img src={player.photoUrl} className="w-full h-full rounded-full object-cover" alt={player.name} />
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-sm text-white font-black">check</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-black tracking-tight mb-2 uppercase italic text-navy">{player.name}</h1>
          <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest mb-2">
            {player.position}
          </span>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Membro da Elite O&A</p>
        </div>

        {/* Stats Section */}
        <div className="mb-10">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6 px-2">Estatísticas Gerais</h3>
          <div className="grid grid-cols-3 gap-4">
            <StatBox label="Gols" value={player.goals.toString()} color="text-primary" />
            <StatBox label="Assist." value="12" />
            <StatBox label="Jogos" value="45" />
          </div>
        </div>

        {/* History Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Histórico Recente</h3>
            <button onClick={() => alert("Histórico completo disponível em breve!")} className="text-[10px] font-black uppercase tracking-widest text-primary active:opacity-60">Ver Tudo</button>
          </div>

          <div className="space-y-4">
            {MOCK_HISTORY.slice(0, 3).map((match) => (
              <div key={match.id} className="bg-white rounded-3xl p-5 border border-slate-100 flex items-center justify-between group shadow-sm transition-transform hover:scale-[1.01]">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${match.score.us > match.score.them ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-red-50 border-red-100 text-primary'}`}>
                    <span className="material-symbols-outlined fill-1 text-2xl">
                      {match.score.us > match.score.them ? 'sports_soccer' : 'cancel'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-navy">vs. {match.opponent}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{match.date} • {match.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1 justify-end">
                    <div className={`w-1.5 h-1.5 rounded-full ${match.score.us > match.score.them ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${match.score.us > match.score.them ? 'text-emerald-500' : 'text-red-500'}`}>
                      {match.score.us > match.score.them ? 'Vitória' : 'Derrota'}
                    </span>
                  </div>
                  <p className="text-xl font-condensed text-navy">{match.score.us} - {match.score.them}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Section / Settings */}
        <div className="pb-40">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6 px-2">Configurações da Conta</h3>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <button onClick={() => alert("Notificações Push ativadas!")} className="w-full p-6 flex items-center justify-between border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 text-navy">
                <span className="material-symbols-outlined text-slate-300">notifications</span>
                <span className="text-xs font-bold uppercase tracking-wider">Notificações</span>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
            <button onClick={() => alert("Configurações de privacidade salvas.")} className="w-full p-6 flex items-center justify-between border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 text-navy">
                <span className="material-symbols-outlined text-slate-300">security</span>
                <span className="text-xs font-bold uppercase tracking-wider">Privacidade</span>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full p-6 flex items-center gap-4 text-primary hover:bg-red-50 transition-colors group"
            >
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">logout</span>
              <span className="text-xs font-black uppercase tracking-widest">Sair da Conta</span>
            </button>
          </div>
        </div>
      </header>

      {/* Footer Actions */}
      <div className="fixed bottom-24 left-0 right-0 px-6 py-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-50">
        <button onClick={handleEditProfile} className="w-full h-16 bg-primary text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 active:scale-95 transition-all">
          <span className="material-symbols-outlined">edit</span>
          Editar Perfil
        </button>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color = "text-navy" }: any) => (
  <div className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col items-center shadow-sm">
    <p className={`text-4xl font-condensed mb-1 ${color}`}>{value}</p>
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">{label}</p>
  </div>
);

export default Profile;
