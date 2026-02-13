
import React, { useState } from 'react';
import { Player, Page } from '../types.ts';
import { db, doc, updateDoc, addDoc, collection } from '../services/firebase.ts';

const PlayerList: React.FC<{ players: Player[], currentUser: any, onPageChange: (page: Page) => void }> = ({ players, currentUser, onPageChange }) => {
  const [activeTab, setActiveTab] = useState<'confirmados' | 'espera'>('confirmados');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

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
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-900 animate-in fade-in duration-500">
      {/* Header Padronizado com Home */}
      <header className="px-6 pt-12 pb-4 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => onPageChange(Page.Dashboard)} className="material-symbols-outlined text-slate-300 hover:text-primary transition-colors active:scale-90">arrow_back</button>
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={mainLogoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-primary tracking-[0.3em] leading-none mb-0.5">ARENA</span>
              <h2 className="text-sm font-black text-navy uppercase italic tracking-tighter leading-none">O&A ELITE</h2>
            </div>
          </div>
          <button onClick={handleShare} className="w-10 h-10 rounded-xl bg-white shadow-soft border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
        </div>

        {/* Tabs Estilo Apple */}
        <div className="flex bg-slate-100/50 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('confirmados')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'confirmados' ? 'bg-white text-navy shadow-sm' : 'text-slate-400'}`}
          >
            Confirmados ({confirmed.length})
          </button>
          <button 
            onClick={() => setActiveTab('espera')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'espera' ? 'bg-white text-navy shadow-sm' : 'text-slate-400'}`}
          >
            Espera ({waiting.length})
          </button>
        </div>
      </header>

      {/* Hero Summary Card com bg-croatia */}
      <section className="px-6 mt-6">
        <div className="relative overflow-hidden rounded-apple-xl bg-white border border-slate-100 shadow-soft p-6 mb-6 group">
          <div className="absolute inset-0 z-0 bg-croatia opacity-[0.03]"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <span className="text-[9px] font-black uppercase text-primary tracking-widest block mb-1">CONVOCADOS</span>
              <h3 className="text-3xl font-condensed text-navy uppercase tracking-tighter leading-none">{confirmed.length} ATLETAS</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 italic">Pelada dos Amigos • Arena Central</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100 shadow-sm">
              <span className="material-symbols-outlined text-3xl fill-1">groups</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 space-y-3 pb-40">
        {(activeTab === 'confirmados' ? confirmed : waiting).map((p, idx) => (
          <div 
            key={p.id} 
            className="bg-white rounded-apple p-4 border border-slate-100 shadow-soft flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl p-0.5 border border-slate-100 overflow-hidden bg-slate-50">
                  <img src={p.photoUrl} className="w-full h-full object-cover rounded-xl" alt={p.name} />
                </div>
                <div className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-navy text-white rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black italic shadow-sm">
                  {idx + 1}
                </div>
              </div>
              <div>
                <h4 className="font-black text-navy uppercase italic tracking-tight">{p.name}</h4>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-black text-primary uppercase tracking-widest">{p.position}</span>
                   <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                   <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{p.team || 'Peladeiro'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end border-l border-slate-50 pl-4 shrink-0">
               <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">STATUS</span>
               <div className={`flex items-center gap-1 ${activeTab === 'confirmados' ? 'text-emerald-500' : 'text-amber-500'}`}>
                 <span className="material-symbols-outlined text-[14px] font-black">{activeTab === 'confirmados' ? 'check_circle' : 'pending'}</span>
                 <span className="text-[9px] font-black uppercase tracking-widest">{activeTab === 'confirmados' ? 'OK' : 'WAIT'}</span>
               </div>
            </div>
          </div>
        ))}

        {((activeTab === 'confirmados' && confirmed.length === 0) || (activeTab === 'espera' && waiting.length === 0)) && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <span className="material-symbols-outlined text-4xl text-slate-200">person_off</span>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 italic">Lista Vazia</p>
          </div>
        )}
      </section>

      {/* Floating Buttons */}
      <div className="fixed bottom-24 left-0 right-0 px-6 py-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-40 flex gap-4">
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-soft active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">person_add</span>
        </button>
        <button 
          onClick={togglePresence}
          disabled={isUpdating}
          className={`flex-1 h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl transition-all disabled:opacity-50 active:scale-95 ${players.find(x => x.id === currentUser?.uid)?.status === 'presente' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-primary text-white shadow-primary/30'}`}
        >
          <span className="material-symbols-outlined fill-1">{players.find(x => x.id === currentUser?.uid)?.status === 'presente' ? 'check_circle' : 'sports_soccer'}</span>
          {players.find(x => x.id === currentUser?.uid)?.status === 'presente' ? 'CONFIRMADO' : 'EU VOU'}
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy/20 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
          <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-apple-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black uppercase italic text-navy tracking-tight">Novo Atleta</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inscrição na Elite O&A</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-300 hover:text-primary transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddPlayer} className="p-8 space-y-6 overflow-y-auto hide-scrollbar">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 px-1">Nome do Craque</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Luka Modrić"
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold text-navy placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 px-1">Posição</label>
                    <select 
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold text-navy outline-none appearance-none cursor-pointer"
                    >
                      <option>Atacante</option>
                      <option>Meio-Campo</option>
                      <option>Defensor</option>
                      <option>Goleiro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 px-1">Número</label>
                    <input 
                      type="number" 
                      value={formData.number}
                      onChange={(e) => setFormData({...formData, number: parseInt(e.target.value) || 0})}
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold text-navy outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 px-1">Clube Atual</label>
                    <input 
                      type="text" 
                      value={formData.team}
                      onChange={(e) => setFormData({...formData, team: e.target.value})}
                      placeholder="Real Madrid"
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold text-navy outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 px-1">Total de Gols</label>
                    <input 
                      type="number" 
                      value={formData.goals}
                      onChange={(e) => setFormData({...formData, goals: parseInt(e.target.value) || 0})}
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold text-navy outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary block px-1">Atributos de Elite (0-100)</label>
                  
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
                    label="Fôlego" 
                    value={formData.skills.stamina} 
                    onChange={(v) => setFormData({...formData, skills: {...formData.skills, stamina: v}})} 
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {isUpdating ? 'Cadastrando Atleta...' : 'Finalizar Cadastro'}
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
  <div className="space-y-2 px-1">
    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-300">
      <span>{label}</span>
      <span className="text-navy">{value}</span>
    </div>
    <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
       <div 
         className="absolute top-0 left-0 h-full bg-primary transition-all duration-500"
         style={{ width: `${value}%` }}
       ></div>
       <input 
         type="range" 
         min="0" 
         max="100" 
         value={value}
         onChange={(e) => onChange(parseInt(e.target.value))}
         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
       />
    </div>
  </div>
);

export default PlayerList;
