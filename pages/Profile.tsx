
import React, { useRef, useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';
import { logout, db, doc, updateDoc } from '../services/firebase.ts';

const Profile: React.FC<{ player: Player, onPageChange: (page: Page) => void }> = ({ player, onPageChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedName, setEditedName] = useState(player.name);
  const [editedPosition, setEditedPosition] = useState(player.position);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  useEffect(() => {
    setEditedName(player.name);
    setEditedPosition(player.position);
  }, [player.name, player.position]);

  const isDirty = editedName !== player.name || editedPosition !== player.position;

  const handleLogout = async () => {
    if (confirm("Deseja realmente sair da Arena O&A?")) {
      await logout();
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const playerDocRef = doc(db, "players", player.id);
        await updateDoc(playerDocRef, { photoUrl: base64String });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erro ao atualizar foto:", error);
      alert("Falha ao atualizar foto de perfil.");
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    try {
      const playerDocRef = doc(db, "players", player.id);
      await updateDoc(playerDocRef, { 
        name: editedName, 
        position: editedPosition 
      });
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      alert("Erro ao salvar alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-40">
      <header className="px-6 pt-12 pb-6 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" />
            <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">MEU PERFIL</h2>
          </div>
          <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary active:scale-90">
             <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </header>

      <section className="px-6 mt-10 flex flex-col items-center">
        <div className="relative mb-8 group">
           <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] scale-150"></div>
           <div className="w-40 h-40 rounded-[3rem] border-8 border-white shadow-2xl overflow-hidden relative z-10 transition-transform group-hover:scale-105">
             {isUploading ? (
               <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                 <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                 <span className="text-[8px] font-black text-white uppercase tracking-widest">SUBINDO...</span>
               </div>
             ) : null}
             <img src={player.photoUrl} className="w-full h-full object-cover" alt={player.name} />
           </div>

           <button 
            onClick={handleCameraClick}
            disabled={isUploading}
            className="absolute -bottom-2 -right-2 w-14 h-14 bg-primary text-white rounded-2xl border-4 border-white flex items-center justify-center z-20 shadow-xl active:scale-90 transition-all hover:bg-navy"
           >
             <span className="material-symbols-outlined text-2xl fill-1">photo_camera</span>
           </button>
           
           <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" capture="user" className="hidden" />

           <div className="absolute -top-4 -left-4 w-12 h-12 bg-navy text-white rounded-2xl border-4 border-white flex items-center justify-center z-20 shadow-xl rotate-[-15deg]">
             <span className="text-lg font-black italic">PRO</span>
           </div>
        </div>
        
        <div className="w-full text-center space-y-2 mb-12">
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full text-4xl font-condensed text-navy uppercase italic tracking-tighter text-center bg-transparent border-none focus:ring-2 focus:ring-primary/20 rounded-lg p-1 outline-none"
            placeholder="Nome do Atleta"
          />
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-primary text-xs">edit</span>
            <input
              type="text"
              value={editedPosition}
              onChange={(e) => setEditedPosition(e.target.value)}
              className="text-[10px] font-black uppercase text-primary tracking-[0.4em] italic bg-transparent border-none focus:ring-2 focus:ring-primary/20 rounded-md p-1 outline-none text-center"
              placeholder="Posição (Ex: Meia-Atacante)"
            />
          </div>
        </div>

        {isDirty && (
          <button 
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="w-full h-16 mb-8 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 animate-in slide-in-from-top-4"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined">save</span>
            )}
            SALVAR ALTERAÇÕES NO PERFIL
          </button>
        )}

        <div className="w-full bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft space-y-6">
           <div className="flex items-center gap-4 py-2 border-b border-slate-50">
             <span className="material-symbols-outlined text-navy">person</span>
             <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">NOME COMPLETO</p>
                <p className="text-xs font-bold text-navy uppercase">{player.name}</p>
             </div>
           </div>
           <div className="flex items-center gap-4 py-2 border-b border-slate-50">
             <span className="material-symbols-outlined text-navy">sports_soccer</span>
             <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">POSIÇÃO REGISTRADA</p>
                <p className="text-xs font-bold text-navy uppercase">{player.position}</p>
             </div>
           </div>
           <div className="flex items-center gap-4 py-2">
             <span className="material-symbols-outlined text-navy">verified</span>
             <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">STATUS NA ARENA</p>
                <p className="text-xs font-bold text-emerald-500 uppercase">MEMBRO ELITE</p>
             </div>
           </div>
        </div>

        <p className="mt-10 text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 text-center leading-relaxed">
          O&A ELITE PRO • VERSÃO 2.0.0 <br/>
          GESTÃO ESPORTIVA DE ALTA PERFORMANCE
        </p>
      </section>
    </div>
  );
};

export default Profile;
