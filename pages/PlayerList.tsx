
import React, { useState } from 'react';
import { Player, Page } from '../types.ts';
import { db, doc, updateDoc, addDoc, collection } from '../services/firebase.ts';

const PlayerList: React.FC<{ players: Player[], currentUser: any, onPageChange: (page: Page) => void }> = ({ players, currentUser, onPageChange }) => {
  const [activeTab, setActiveTab] = useState<'confirmados' | 'espera'>('confirmados');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const confirmed = players.filter(p => p.status === 'presente');
  const waiting = players.filter(p => p.status === 'pendente');

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-4 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10">
            <img src={mainLogoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-[8px] font-black uppercase text-primary tracking-widest leading-none block">ARENA</span>
            <h2 className="text-sm font-black text-navy uppercase italic tracking-tighter leading-none">CONVOCADOS</h2>
          </div>
        </div>

        <div className="flex bg-slate-100/50 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('confirmados')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'confirmados' ? 'bg-white text-navy shadow-sm' : 'text-slate-400'}`}
          >
            CONFIRMADOS ({confirmed.length})
          </button>
          <button 
            onClick={() => setActiveTab('espera')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'espera' ? 'bg-white text-navy shadow-sm' : 'text-slate-400'}`}
          >
            ESPERA ({waiting.length})
          </button>
        </div>
      </header>

      <section className="px-6 mt-6 space-y-3">
        {(activeTab === 'confirmados' ? confirmed : waiting).map((p, idx) => (
          <div key={p.id} className="bg-white rounded-apple p-4 border border-slate-100 shadow-soft flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-50">
                <img src={p.photoUrl} className="w-full h-full object-cover" alt={p.name} />
              </div>
              <div>
                <h4 className="font-black text-navy uppercase italic tracking-tight">{p.name}</h4>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{p.position}</p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'confirmados' ? 'text-emerald-500 bg-emerald-50' : 'text-amber-500 bg-amber-50'}`}>
              <span className="material-symbols-outlined text-[18px]">{activeTab === 'confirmados' ? 'check' : 'schedule'}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Floating Action Button - Posicionado acima da Nav Bar do Layout */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-28 right-8 w-16 h-16 bg-white border border-slate-100 text-primary rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl">person_add</span>
      </button>

      {/* Add Modal simplificado para evitar confusão */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/20 backdrop-blur-md">
           <div className="w-full max-w-sm bg-white rounded-apple-xl p-8 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-xl font-black text-navy uppercase italic mb-6">Novo Jogador</h3>
              <p className="text-xs text-slate-400 mb-8 font-bold uppercase tracking-widest">Funcionalidade de cadastro em desenvolvimento...</p>
              <button onClick={() => setShowAddModal(false)} className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">FECHAR</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default PlayerList;
