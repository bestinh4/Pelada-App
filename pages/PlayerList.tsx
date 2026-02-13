
import React, { useState } from 'https://esm.sh/react@18.2.0';
import { Player, Page } from '../types.ts';
import { db, doc, updateDoc, addDoc, collection } from '../services/firebase.ts';

const PlayerList: React.FC<{ players: Player[], currentUser: any, onPageChange: (page: Page) => void }> = ({ players, currentUser, onPageChange }) => {
  const [activeTab, setActiveTab] = useState<'confirmados' | 'espera' | 'nao_vao'>('confirmados');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    number: 10,
    team: '',
    goals: 0,
    position: 'Atacante',
    status: 'presente' as 'presente' | 'pendente',
    skills: { attack: 70, defense: 50, stamina: 60 }
  });

  const confirmed = players.filter(p => p.status === 'presente');
  const waiting = players.filter(p => p.status === 'pendente');

  const togglePresence = async () => {
    if (!currentUser) return;
    setIsUpdating(true);
    try {
      const p = players.find(x => x.id === currentUser.uid);
      const nextStatus = p?.status === 'presente' ? 'pendente' : 'presente';
      await updateDoc(doc(db, "players", currentUser.uid), { status: nextStatus });
    } catch (e) { console.error(e); } finally { setIsUpdating(false); }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await addDoc(collection(db, "players"), {
        ...formData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      });
      setShowAddModal(false);
      setFormData({
        name: '',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        number: 10,
        team: '',
        goals: 0,
        position: 'Atacante',
        status: 'presente',
        skills: { attack: 70, defense: 50, stamina: 60 }
      });
    } catch (e) {
      console.error("Erro ao adicionar jogador:", e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShare = () => {
    const text = `Lista de Chamada O&A ELITE PRO\nConfirmados: ${confirmed.length}\nEspera: ${waiting.length}`;
    if (navigator.share) {
      navigator.share({ title: 'O&A ELITE PRO', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text + '\n' + window.location.href);
      alert('Informações da lista copiadas para o clipboard!');
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-navy-deep text-white animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => onPageChange(Page.Dashboard)} className="material-symbols-outlined text-white/60 active:scale-90 transition-transform">arrow_back</button>
          <h2 className="text-lg font-bold">Lista de Chamada</h2>
          <button onClick={handleShare} className="material-symbols-outlined text-white/60 active:scale-90 transition-transform">share</button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Pelada dos Amigos</h1>
            <div className="flex items-center gap-4 mt-2 text-white/40 text-xs font-bold">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                Sábado, 18:00h
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                Arena Central
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
            count={0} 
            icon="cancel" 
            color="text-red-500"
            onClick={() => setActiveTab('nao_vao')} 
          />
        </div>
      </header>

      <section className="px-6 pb-40">
        <div className="flex items-center justify-between py-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Jogadores</span>
          <button className="flex items-center gap-1 text-primary text-[10px] font-black uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">swap_vert</span> Ordenar A-Z
          </button>
        </div>

        <div className="space-y-4">
          {(activeTab === 'confirmados' ? confirmed : (activeTab === 'espera' ? waiting : [])).map((p) => (
            <div key={p.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={p.photoUrl} className="w-14 h-14 rounded-full object-cover border-2 border-white/10" alt={p.name} />
                  {p.number && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-navy-deep flex items-center justify-center text-[10px] font-black">{p.number}</div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base">{p.name}</h4>
                    {p.goals > 10 && <span className="material-symbols-outlined text-amber-500 text-sm fill-1">verified</span>}
                  </div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{p.position} • {p.team || 'Sem Clube'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-primary">{p.goals} GOLS</p>
                <button className="material-symbols-outlined text-white/20">more_vert</button>
              </div>
            </div>
          ))}
          {(activeTab === 'nao_vao' || (activeTab === 'confirmados' && confirmed.length === 0) || (activeTab === 'espera' && waiting.length === 0)) && (
            <div className="py-20 text-center opacity-20">
              <span className="material-symbols-outlined text-6xl mb-4">person_off</span>
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Nenhum jogador encontrado</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer Buttons */}
      <div className="fixed bottom-24 left-0 right-0 px-6 py-4 bg-gradient-to-t from-navy-deep via-navy-deep to-transparent z-40 flex gap-4">
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex-1 h-16 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest text-white/60 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">person_add</span> Adicionar Atleta
        </button>
        <button 
          onClick={togglePresence}
          disabled={isUpdating}
          className="flex-[1.5] h-16 bg-primary rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined">{players.find(x => x.id === currentUser?.uid)?.status === 'presente' ? 'check' : 'login'}</span>
          {players.find(x => x.id === currentUser?.uid)?.status === 'presente' ? 'Presença Confirmada' : 'Confirmar Presença'}
        </button>
      </div>

      {/* Add Player Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-deep/90 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative w-full max-w-md bg-[#0E1324] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase italic text-primary">Novo Atleta</h3>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Cadastro de Elite</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="material-symbols-outlined text-white/40">close</button>
            </div>
            
            <form onSubmit={handleAddPlayer} className="p-8 space-y-6 overflow-y-auto hide-scrollbar">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">Nome Completo</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Luka Modrić"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary outline-none" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">Posição</label>
                    <select 
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary outline-none appearance-none"
                    >
                      <option className="bg-[#0E1324]">Atacante</option>
                      <option className="bg-[#0E1324]">Meio-Campo</option>
                      <option className="bg-[#0E1324]">Defensor</option>
                      <option className="bg-[#0E1324]">Goleiro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">Número</label>
                    <input 
                      type="number" 
                      value={formData.number}
                      onChange={(e) => setFormData({...formData, number: parseInt(e.target.value) || 0})}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">Time/Clube</label>
                    <input 
                      type="text" 
                      value={formData.team}
                      onChange={(e) => setFormData({...formData, team: e.target.value})}
                      placeholder="Real Madrid"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">Gols</label>
                    <input 
                      type="number" 
                      value={formData.goals}
                      onChange={(e) => setFormData({...formData, goals: parseInt(e.target.value) || 0})}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">URL da Foto</label>
                  <input 
                    type="url" 
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                    placeholder="https://..."
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary outline-none text-white/40" 
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary block">Skills & Habilidades</label>
                  
                  <SkillRange 
                    label="Ataque" 
                    value={formData.skills.attack} 
                    onChange={(v) => setFormData({...formData, skills: {...formData.skills, attack: v}})} 
                  />
                  <SkillRange 
                    label="Defesa" 
                    value={formData.skills.defense} 
                    onChange={(v) => setFormData({...formData, skills: {...formData.skills, defense: v}})} 
                  />
                  <SkillRange 
                    label="Stamina" 
                    value={formData.skills.stamina} 
                    onChange={(v) => setFormData({...formData, skills: {...formData.skills, stamina: v}})} 
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-14 bg-white/5 border border-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 h-14 bg-primary rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {isUpdating ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SkillRange = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/30">
      <span>{label}</span>
      <span className="text-white">{value}</span>
    </div>
    <input 
      type="range" 
      min="0" 
      max="100" 
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1 bg-white/10 rounded-full appearance-none accent-primary cursor-pointer"
    />
  </div>
);

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
