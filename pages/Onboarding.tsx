
import React, { useState } from 'react';
import { db, doc, setDoc } from '../services/firebase.ts';
import { Page } from '../types.ts';

interface OnboardingProps {
  user: any;
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const [name, setName] = useState(user?.displayName || "");
  const [position, setPosition] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const logoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !position || isSaving) return;

    setIsSaving(true);
    try {
      const playerDocRef = doc(db, "players", user.uid);
      await setDoc(playerDocRef, {
        id: user.uid,
        name: name,
        photoUrl: user.photoURL || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        goals: 0,
        assists: 0,
        concededGoals: 0,
        position: position,
        status: 'pendente'
      });
      onComplete();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-croatia opacity-[0.5] pointer-events-none"></div>
      
      <div className="w-full max-w-[420px] bg-white rounded-apple-xl shadow-[0_30px_70px_rgba(0,56,118,0.15)] border border-slate-100 p-10 flex flex-col z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-10">
          <img src={logoUrl} alt="Logo" className="w-24 h-24 object-contain mb-4" />
          <h1 className="text-xl font-black text-navy uppercase italic tracking-tighter">BEM-VINDO À ELITE</h1>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mt-1 text-center">Complete seu cadastro para acessar a arena</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">NOME DE GUERRA</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-navy focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Ex: Luka Modrić"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">POSIÇÃO PREFERIDA</label>
            <select 
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-navy focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
            >
              <option value="" disabled>Selecione sua posição...</option>
              <option value="Goleiro">Goleiro</option>
              <option value="Zagueiro">Zagueiro</option>
              <option value="Lateral">Lateral</option>
              <option value="Volante">Volante</option>
              <option value="Meia">Meia</option>
              <option value="Atacante">Atacante</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isSaving || !name || !position}
            className="w-full h-18 bg-primary text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                CONCLUIR CONTRATAÇÃO
                <span className="material-symbols-outlined">chevron_right</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
