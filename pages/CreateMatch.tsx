
import React, { useState } from 'react';
import { Page, Player } from '../types.ts';
import { balanceTeams } from '../services/geminiService.ts';
import { db, addDoc, collection } from '../services/firebase.ts';

const CreateMatch: React.FC<{ players: Player[], currentUser: any, onPageChange: (page: Page) => void }> = ({ players, currentUser, onPageChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingMatch, setIsSavingMatch] = useState(false);
  const [teams, setTeams] = useState<{ teamRed: string[], teamBlue: string[] } | null>(null);
  
  const currentPlayer = players.find(p => p.id === currentUser?.uid);
  const isAdmin = currentPlayer?.role === 'admin';

  const [matchData, setMatchData] = useState({
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    price: 35,
    fieldSlots: 30,
    gkSlots: 5
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-8 text-center animate-in fade-in zoom-in-95">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
          <span className="material-symbols-outlined text-5xl">lock</span>
        </div>
        <h2 className="text-2xl font-black text-navy uppercase italic tracking-tighter mb-2">ACESSO RESTRITO</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed mb-8">Esta área é exclusiva para a diretoria da Arena Elite.</p>
        <button 
          onClick={() => onPageChange(Page.Dashboard)}
          className="px-8 py-4 bg-navy text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-navy/20 active:scale-95 transition-all"
        >
          VOLTAR AO DASHBOARD
        </button>
      </div>
    );
  }

  const confirmedPlayers = players.filter(p => p.status === 'presente');

  const handleGenerateTeams = async () => {
    if (confirmedPlayers.length < 4) {
      alert("É necessário pelo menos 4 jogadores confirmados para balancear.");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await balanceTeams(confirmedPlayers);
      setTeams(result);
    } catch (e) {
      console.error(e);
      alert("Erro ao balancear times com IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateNewMatch = async () => {
    if (!matchData.location.trim() || !matchData.date || !matchData.time) {
      alert("Por favor, preencha o local, data e hora da pelada.");
      return;
    }

    setIsSavingMatch(true);
    try {
      const newMatch = {
        location: String(matchData.location).trim(),
        date: String(matchData.date),
        time: String(matchData.time),
        price: Number(matchData.price) || 0,
        fieldSlots: Number(matchData.fieldSlots) || 30,
        gkSlots: Number(matchData.gkSlots) || 5,
        type: 'Society',
        confirmedPlayers: confirmedPlayers.length,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "matches"), newMatch);
      alert("Pelada publicada com sucesso na Arena!");
      onPageChange(Page.Dashboard);
    } catch (err: any) {
      console.error("Erro crítico ao salvar no Firebase:", err);
      alert("Erro ao salvar: " + (err.message || "Verifique sua conexão."));
    } finally {
      setIsSavingMatch(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => onPageChange(Page.Dashboard)} className="material-symbols-outlined text-slate-300">arrow_back</button>
            <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">NOVO AGENDAMENTO</h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined fill-1">event_available</span>
          </div>
        </div>
      </header>

      <section className="px-6 mt-8 space-y-6">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">CONFIGURAR CONFRONTO</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 px-1">LOCAL DA ARENA</label>
              <input 
                type="text" 
                placeholder="Ex: Arena Central" 
                value={matchData.location}
                onChange={e => setMatchData({...matchData, location: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold text-navy outline-none focus:ring-2 focus:ring-primary/10" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 px-1">DATA</label>
                <input 
                  type="date" 
                  value={matchData.date}
                  onChange={e => setMatchData({...matchData, date: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold text-navy" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 px-1">HORA</label>
                <input 
                  type="time" 
                  value={matchData.time}
                  onChange={e => setMatchData({...matchData, time: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold text-navy" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 px-1">VAGAS LINHA</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={matchData.fieldSlots}
                    onChange={e => setMatchData({...matchData, fieldSlots: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold text-navy pl-10" 
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-lg">sports_soccer</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 px-1">VAGAS GOLEIRO</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={matchData.gkSlots}
                    onChange={e => setMatchData({...matchData, gkSlots: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold text-navy pl-10" 
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-lg">sports_kabaddi</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 px-1">VALOR POR CABEÇA (R$)</label>
              <input 
                type="number" 
                value={matchData.price}
                onChange={e => setMatchData({...matchData, price: Number(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold text-navy" 
              />
            </div>

            <button 
              onClick={handleCreateNewMatch}
              disabled={isSavingMatch}
              className="w-full h-16 bg-navy text-white rounded-2xl font-black uppercase text-[11px] tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-navy/20"
            >
              {isSavingMatch ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined">publish</span>
                  SALVAR E PUBLICAR
                </>
              )}
            </button>
          </div>
        </div>

        <div className="pt-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4 px-2">TIME MANAGEMENT</h3>
          <button 
            onClick={handleGenerateTeams}
            disabled={isGenerating}
            className="w-full h-18 bg-primary text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>IA EQUILIBRANDO SKILLS...</span>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-2xl">shuffle</span>
                SORTEAR TIMES EQUILIBRADOS
              </>
            )}
          </button>
        </div>

        {teams && (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700 pb-10">
             <TeamResultCard title="Time Branco" color="navy" players={teams.teamBlue} allPlayers={players} />
             <TeamResultCard title="Time Vermelho" color="primary" players={teams.teamRed} allPlayers={players} />
          </div>
        )}
      </section>
    </div>
  );
};

const TeamResultCard = ({ title, color, players, allPlayers }: any) => (
  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
    <div className={`px-8 py-5 flex justify-between items-center ${color === 'primary' ? 'bg-primary text-white' : 'bg-navy text-white'}`}>
       <h4 className="font-black uppercase italic text-sm tracking-widest">{title}</h4>
       <span className="text-[10px] font-black uppercase opacity-60">{players.length} Atletas</span>
    </div>
    <div className="p-8 space-y-5">
       {players.map((pName: string) => {
         const p = allPlayers.find((x: any) => x.name === pName);
         return (
           <div key={pName} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                    <img src={p?.photoUrl || `https://i.pravatar.cc/100?u=${pName}`} className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <h5 className="text-xs font-black text-navy uppercase italic">{pName}</h5>
                    <p className="text-[9px] font-bold text-slate-300 uppercase">{p?.position || 'Jogador'}</p>
                 </div>
              </div>
           </div>
         );
       })}
    </div>
  </div>
);

export default CreateMatch;
