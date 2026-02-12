
import React, { useState } from 'react';
import { MOCK_PLAYERS } from '../constants.tsx';
import { Player } from '../types.ts';

const FormField = ({ label, icon, placeholder, prefix }: { label: string, icon: string, placeholder: string, prefix?: string }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">{label}</label>
    <div className="relative flex items-center bg-white border border-slate-100 rounded-2xl px-4 h-14 shadow-sm group transition-all focus-within:border-primary/30 focus-within:ring-4 ring-primary/5">
      <span className="material-symbols-outlined text-[20px] text-slate-300 mr-3 group-focus-within:text-primary transition-colors">{icon}</span>
      {prefix && <span className="text-slate-400 text-sm font-bold mr-1">{prefix}</span>}
      <input type="text" className="flex-1 bg-transparent border-none focus:ring-0 text-navy-deep font-black text-sm p-0 placeholder-slate-200" placeholder={placeholder} />
    </div>
  </div>
);

const ToggleField = ({ label, sublabel, icon }: { label: string, sublabel: string, icon: string }) => (
  <label className="flex items-center justify-between p-5 cursor-pointer group hover:bg-slate-50/50 transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-black text-navy-deep">{label}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{sublabel}</p>
      </div>
    </div>
    <div className="relative inline-block w-12 h-6 transition-all duration-200 rounded-full bg-slate-200 has-[:checked]:bg-primary">
      <input type="checkbox" className="absolute w-full h-full opacity-0 cursor-pointer peer" />
      <span className="absolute left-[3px] top-[3px] w-[18px] h-[18px] bg-white shadow-md rounded-full transition-transform duration-200 peer-checked:translate-x-6"></span>
    </div>
  </label>
);

const CreateMatch: React.FC = () => {
  const [matchName, setMatchName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  const togglePlayer = (id: string) => {
    const newSelection = new Set(selectedPlayerIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedPlayerIds(newSelection);
  };

  const filteredPlayers = MOCK_PLAYERS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPlayers = MOCK_PLAYERS.filter(p => selectedPlayerIds.has(p.id));

  const handleCreate = () => {
    if (!matchName) {
      alert("Por favor, dê um nome à arena.");
      return;
    }
    setShowSuccess(true);
  };

  const handleFinish = () => {
    setMatchName('');
    setSelectedPlayerIds(new Set());
    setShowSuccess(false);
  };

  return (
    <div className="flex flex-col animate-in zoom-in-95 duration-500 relative min-h-full bg-background">
      <header className="flex items-center justify-between px-8 pt-12 pb-6 sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-slate-50/50">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-navy active:scale-90 transition-all">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="text-xl font-black text-navy-deep tracking-tight">Agendar Elite</h1>
        <div className="w-10"></div>
      </header>

      <main className="px-6 pb-24 pt-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_8px_rgba(237,29,35,0.4)]"></div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-primary">Configuração Global</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Defina os detalhes do confronto</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">Nome da Partida</label>
            <div className="relative flex items-center bg-white border border-slate-100 rounded-2xl px-4 h-16 shadow-sm group focus-within:ring-4 ring-primary/5 transition-all">
              <span className="material-symbols-outlined text-[24px] text-primary/40 mr-3 group-focus-within:text-primary transition-colors">edit_note</span>
              <input 
                type="text" 
                value={matchName}
                onChange={(e) => setMatchName(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 text-navy font-black text-lg p-0 placeholder-slate-200" 
                placeholder="Ex: Clássico de Natal" 
              />
            </div>
          </div>

          <div className="p-1 bg-slate-100 rounded-xl flex">
            {['Futsal', 'Society', 'Campo'].map((type) => (
              <button key={type} className={`flex-1 py-2 rounded-lg text-center text-[10px] font-bold uppercase tracking-widest transition-all ${type === 'Society' ? 'bg-white text-navy shadow-sm' : 'text-slate-400 hover:text-navy/60'}`}>
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Data" icon="calendar_today" placeholder="DD/MM" />
            <FormField label="Horário" icon="schedule" placeholder="20:00" />
          </div>

          {selectedPlayers.length > 0 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-left duration-300">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Escalação Selecionada</label>
                <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {selectedPlayers.length} ATLETAS
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-1">
                {selectedPlayers.map(player => (
                  <button
                    key={`roster-${player.id}`}
                    onClick={() => togglePlayer(player.id)}
                    className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-90 transition-all"
                  >
                    <div className="relative">
                      <div 
                        className="w-14 h-14 rounded-full bg-cover bg-center border-2 border-primary shadow-lg shadow-primary/10 group-hover:opacity-80 transition-opacity"
                        style={{ backgroundImage: `url(${player.photoUrl})` }}
                      ></div>
                      <div className="absolute -top-1 -right-1 bg-navy-deep text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        <span className="material-symbols-outlined text-[12px] font-bold">close</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-navy-deep uppercase tracking-tighter truncate w-14 text-center">
                      {player.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-end px-2">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Buscar Atletas</label>
                <p className="text-[11px] font-bold text-navy-deep">
                  {selectedPlayerIds.size === 0 
                    ? 'Nenhum atleta escalado' 
                    : `${selectedPlayerIds.size} ${selectedPlayerIds.size === 1 ? 'atleta escalado' : 'atletas escalados'}`}
                </p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedPlayerIds(new Set())}
                  className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-200 hover:text-primary transition-colors"
                >
                  Limpar
                </button>
                <button 
                  onClick={() => setSelectedPlayerIds(new Set(MOCK_PLAYERS.map(p => p.id)))}
                  className="text-[10px] font-black text-primary uppercase border-b border-primary/20 hover:border-primary transition-all"
                >
                  Todos
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-apple-xl shadow-sm overflow-hidden ring-offset-2 focus-within:ring-4 ring-primary/5 transition-all">
              <div className="p-4 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
                <span className="material-symbols-outlined text-slate-300 text-lg">search</span>
                <input 
                  type="text"
                  placeholder="Pesquisar por nome ou posição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-xs font-bold w-full p-0 placeholder-slate-300 uppercase tracking-widest"
                />
              </div>
              <div className="max-h-[350px] overflow-y-auto hide-scrollbar divide-y divide-slate-50">
                {filteredPlayers.length > 0 ? (
                  filteredPlayers.map(player => (
                    <button 
                      key={player.id}
                      onClick={() => togglePlayer(player.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group active:bg-slate-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div 
                            className={`w-11 h-11 rounded-full bg-cover bg-center border-2 transition-all ${selectedPlayerIds.has(player.id) ? 'border-primary' : 'border-slate-100'}`}
                            style={{ backgroundImage: `url(${player.photoUrl})` }}
                          ></div>
                          {selectedPlayerIds.has(player.id) && (
                            <div className="absolute inset-0 bg-primary/20 rounded-full flex items-center justify-center animate-in fade-in zoom-in duration-200">
                              <span className="material-symbols-outlined text-white text-lg font-black">check</span>
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-navy-deep leading-none group-hover:text-primary transition-colors">{player.name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{player.position}</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlayerIds.has(player.id) ? 'bg-primary border-primary shadow-[0_0_10px_rgba(237,29,35,0.3)]' : 'border-slate-200'}`}>
                        {selectedPlayerIds.has(player.id) && <span className="material-symbols-outlined text-white text-[16px] font-black">check</span>}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined text-slate-200 text-4xl mb-2">person_search</span>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Nenhum atleta encontrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-apple-xl shadow-sm divide-y divide-slate-50">
            <ToggleField label="Solicitar Coletes" sublabel="Incluir no custo da reserva" icon="checkroom" />
            <ToggleField label="Juiz Federado" sublabel="Opcional para competitivas" icon="sports" />
          </div>

          <button 
            onClick={handleCreate}
            className="mt-8 w-full h-20 bg-primary text-white font-black rounded-[2rem] shadow-[0_12px_24px_rgba(237,29,35,0.4)] flex items-center justify-center gap-4 active:scale-95 transition-all group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div className="relative flex items-center gap-4">
              <span className="tracking-[0.2em] uppercase text-lg">Agendar Partida</span>
              <span className="material-symbols-outlined text-3xl group-hover:translate-x-2 transition-transform">sports_score</span>
            </div>
          </button>
        </div>
      </main>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy-deep/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl p-10 flex flex-col items-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-[64px] text-green-500 animate-bounce">check_circle</span>
            </div>
            <h3 className="text-3xl font-black text-navy-deep text-center mb-4 tracking-tighter leading-none">
              Partida <span className="text-primary italic">Agendada!</span>
            </h3>
            <div className="bg-slate-50 rounded-[2rem] p-6 w-full mb-8 space-y-4 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Resumo da Convocação</p>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-sm font-black text-navy-deep">{matchName || 'Nova Partida'}</span>
                <span className="text-[9px] font-black bg-primary text-white px-2.5 py-1 rounded-full uppercase tracking-tighter">Society</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Atletas Confirmados</span>
                <span className="text-sm font-black text-navy-deep">{selectedPlayerIds.size}</span>
              </div>
            </div>
            <button 
              onClick={handleFinish}
              className="w-full h-16 bg-navy-deep text-white font-black rounded-2xl tracking-[0.2em] uppercase text-xs active:scale-95 transition-all shadow-xl shadow-navy-deep/20 hover:bg-black"
            >
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMatch;
