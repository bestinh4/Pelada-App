
import React, { useState } from 'https://esm.sh/react@18.2.0';
import { Player } from '../types.ts';
import { db, doc, updateDoc } from '../services/firebase.ts';

const PlayerList: React.FC<{ players: Player[], currentUser: any }> = ({ players, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'confirmados' | 'espera' | 'nao_vao'>('confirmados');
  const [isUpdating, setIsUpdating] = useState(false);

  const confirmed = players.filter(p => p.status === 'presente');
  const waiting = players.filter(p => p.status === 'pendente');
  const declined = []; // Mock de jogadores que não vão

  const togglePresence = async () => {
    if (!currentUser) return;
    setIsUpdating(true);
    try {
      const p = players.find(x => x.id === currentUser.uid);
      const nextStatus = p?.status === 'presente' ? 'pendente' : 'presente';
      await updateDoc(doc(db, "players", currentUser.uid), { status: nextStatus });
    } catch (e) { console.error(e); } finally { setIsUpdating(false); }
  };

  return (
    <div className="flex flex-col min-h-full bg-navy-deep text-white animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <button className="material-symbols-outlined text-white/60">arrow_back</button>
          <h2 className="text-lg font-bold">Lista de Chamada</h2>
          <button className="material-symbols-outlined text-white/60">share</button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Pelada dos Amigos</h1>
            <div className="flex items-center gap-4 mt-2 text-white/40 text-xs font-bold">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                Quarta, 20:00h
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                Arena Society
              </div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined fill-1">sports_soccer</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-between items-center border-b border-white/5">
          <TabItem 
            active={activeTab === 'confirmados'} 
            label="Confirmados" 
            count={confirmed.length} 
            icon="check_circle" 
            onClick={() => setActiveTab('confirmados')} 
          />
          <TabItem 
            active={activeTab === 'espera'} 
            label="Espera" 
            count={waiting.length} 
            icon="schedule" 
            color="text-amber-500"
            onClick={() => setActiveTab('espera')} 
          />
          <TabItem 
            active={activeTab === 'nao_vao'} 
            label="Não Vão" 
            count={5} 
            icon="cancel" 
            color="text-red-500"
            onClick={() => setActiveTab('nao_vao')} 
          />
        </div>
      </header>

      <section className="px-6 pb-40">
        <div className="flex items-center justify-between py-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Jogadores Confirmados</span>
          <button className="flex items-center gap-1 text-primary text-[10px] font-black uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">swap_vert</span> Ordenar A-Z
          </button>
        </div>

        <div className="space-y-4">
          {(activeTab === 'confirmados' ? confirmed : waiting).map((p) => (
            <div key={p.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={p.photoUrl} className="w-14 h-14 rounded-full object-cover border-2 border-white/10" alt={p.name} />
                  {activeTab === 'confirmados' && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-navy-deep flex items-center justify-center text-[10px] font-black">10</div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base">{p.name}</h4>
                    {p.goals > 10 && <span className="material-symbols-outlined text-amber-500 text-sm fill-1">verified</span>}
                  </div>
                  <p className="text-white/40 text-xs">{p.position}</p>
                </div>
              </div>
              <button className="material-symbols-outlined text-white/20">more_vert</button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Buttons */}
      <div className="fixed bottom-24 left-0 right-0 px-6 py-4 bg-gradient-to-t from-navy-deep via-navy-deep to-transparent z-50 flex gap-4">
        <button className="flex-1 h-16 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest text-white/60">
          <span className="material-symbols-outlined">person_add</span> Convidar
        </button>
        <button 
          onClick={togglePresence}
          className="flex-[1.5] h-16 bg-primary rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"
        >
          <span className="material-symbols-outlined">{players.find(x => x.id === currentUser?.uid)?.status === 'presente' ? 'check' : 'login'}</span>
          {players.find(x => x.id === currentUser?.uid)?.status === 'presente' ? 'Presença Confirmada' : 'Confirmar Presença'}
        </button>
      </div>
    </div>
  );
};

const TabItem = ({ active, label, count, icon, color = "text-emerald-500", onClick }: any) => (
  <div 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center py-4 relative cursor-pointer transition-all ${active ? 'opacity-100' : 'opacity-30'}`}
  >
    <span className={`material-symbols-outlined mb-1 ${active ? color : 'text-white'} ${active ? 'fill-1' : ''}`}>{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-widest mb-1">{label}</span>
    <div className={`px-2 py-0.5 rounded-md text-[10px] font-black ${active ? 'bg-white/10 text-white' : 'bg-transparent text-transparent'}`}>{count}</div>
    {active && <div className="absolute bottom-0 w-full h-1 bg-primary rounded-full"></div>}
  </div>
);

export default PlayerList;
