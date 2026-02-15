
import React, { useState } from 'react';
import { db, doc, setDoc } from '../services/firebase.ts';
import { Page } from '../types.ts';
import { sendPushNotification } from '../services/notificationService.ts';

interface OnboardingProps {
  user: any;
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const [name, setName] = useState(user?.displayName || "");
  const [position, setPosition] = useState("");
  const [playerType, setPlayerType] = useState<'mensalista' | 'avulso'>('mensalista');
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
        email: user.email,
        photoUrl: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=003876&color=fff`,
        goals: 0,
        assists: 0,
        concededGoals: 0,
        position: position,
        playerType: playerType,
        paymentStatus: 'pendente',
        status: 'pendente',
        role: 'player'
      });
      
      sendPushNotification(
        "🚀 BEM-VINDO À ELITE!", 
        `${name}, seu contrato foi assinado! A Arena O&A espera por você.`
      );
      
      onComplete();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-bg">
      <div className="w-full max-w-[420px] bg-white rounded-apple-xl shadow-pro border border-slate-100 p-10 flex flex-col z-10 animate-scale-in">
        <div className="flex flex-col items-center mb-8">
          <img src={logoUrl} alt="Logo" className="w-24 h-24 object-contain mb-4" />
          <h1 className="text-xl font-black text-navy uppercase italic tracking-tighter">CONVOCAÇÃO ELITE</h1>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mt-1 text-center">Complete seu cadastro na Arena</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">NOME DE GUERRA</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-navy focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Ex: Luka Modrić"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">POSIÇÃO PREFERIDA</label>
            <select 
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-navy focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <option value="" disabled>Selecione sua posição...</option>
              <option value="Goleiro">Goleiro (Isento de Taxa 🧤)</option>
              <option value="Zagueiro">Zagueiro</option>
              <option value="Lateral">Lateral</option>
              <option value="Volante">Volante</option>
              <option value="Meia">Meia</option>
              <option value="Atacante">Atacante</option>
            </select>
            {position === 'Goleiro' && (
              <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mt-2 bg-amber-50 p-3 rounded-xl border border-amber-100 animate-pulse">
                🧤 BENEFÍCIO: Goleiros não pagam taxa na Arena O&A Elite.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">TIPO DE ATLETA</label>
            <div className="grid grid-cols-2 gap-3">
               <button 
                type="button" 
                onClick={() => setPlayerType('mensalista')}
                className={`h-14 rounded-xl border flex flex-col items-center justify-center transition-all ${playerType === 'mensalista' ? 'bg-navy border-navy text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
               >
                 <span className="material-symbols-outlined text-lg mb-0.5">calendar_month</span>
                 <span className="text-[8px] font-black uppercase">Mensalista</span>
               </button>
               <button 
                type="button" 
                onClick={() => setPlayerType('avulso')}
                className={`h-14 rounded-xl border flex flex-col items-center justify-center transition-all ${playerType === 'avulso' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
               >
                 <span className="material-symbols-outlined text-lg mb-0.5">confirmation_number</span>
                 <span className="text-[8px] font-black uppercase">Avulso</span>
               </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSaving || !name || !position}
            className="w-full h-16 bg-navy text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl shadow-navy/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                ASSINAR CONTRATO ELITE
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
