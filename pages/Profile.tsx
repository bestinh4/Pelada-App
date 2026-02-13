
import React from 'https://esm.sh/react@18.2.0';
import { Player } from '../types.ts';
import { MOCK_HISTORY } from '../constants.tsx';

const Profile: React.FC<{ player: Player }> = ({ player }) => {
  return (
    <div className="flex flex-col min-h-full bg-navy-deep text-white animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <button className="material-symbols-outlined text-white/60">arrow_back</button>
          <h2 className="text-lg font-bold">Perfil do Jogador</h2>
          <button className="material-symbols-outlined text-white/60">more_horiz</button>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full p-1.5 border-4 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <img src={player.photoUrl} className="w-full h-full rounded-full object-cover" alt={player.name} />
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-navy-deep flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-sm text-white font-black">check</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-black tracking-tight mb-2 uppercase italic">{player.name}</h1>
          <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">
            {player.position}
          </span>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Membro desde Outubro 2019</p>
        </div>

        {/* Stats Section */}
        <div className="mb-10">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-6">Estatísticas Gerais</h3>
          <div className="grid grid-cols-3 gap-4">
            <StatBox label="Gols" value={player.goals.toString()} color="text-emerald-500" />
            <StatBox label="Assist." value="12" />
            <StatBox label="Jogos" value="45" />
          </div>
        </div>

        {/* History Section */}
        <div className="pb-40">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Histórico Recente</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Ver Tudo</button>
          </div>

          <div className="space-y-4">
            {MOCK_HISTORY.slice(0, 3).map((match, idx) => (
              <div key={match.id} className="bg-[#0E1324] rounded-3xl p-5 border border-white/5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${match.score.us > match.score.them ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-500' : 'bg-red-500/10 border-red-500/10 text-red-500'}`}>
                    <span className="material-symbols-outlined fill-1 text-2xl">
                      {match.score.us > match.score.them ? 'sports_soccer' : 'cancel'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">vs. {match.opponent}</h4>
                    <p className="text-[10px] text-white/20 font-medium">12 Out, 2023 • Local: Arena Sul</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1 justify-end">
                    <div className={`w-1.5 h-1.5 rounded-full ${match.score.us > match.score.them ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${match.score.us > match.score.them ? 'text-emerald-500' : 'text-red-500'}`}>
                      {match.score.us > match.score.them ? 'Vitória' : 'Derrota'}
                    </span>
                  </div>
                  <p className="text-xl font-condensed">{match.score.us} - {match.score.them}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Footer Actions */}
      <div className="fixed bottom-24 left-0 right-0 px-6 py-4 bg-gradient-to-t from-navy-deep via-navy-deep to-transparent z-50">
        <button className="w-full h-16 bg-emerald-500 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-navy-deep">
          <span className="material-symbols-outlined">edit</span>
          Editar Perfil
        </button>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color = "text-white" }: any) => (
  <div className="bg-[#0E1324] rounded-[2rem] p-6 border border-white/5 flex flex-col items-center">
    <p className={`text-4xl font-condensed mb-1 ${color}`}>{value}</p>
    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</p>
  </div>
);

export default Profile;
