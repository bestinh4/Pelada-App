
import { logout, db, doc, updateDoc } from '../services/firebase.ts';
import React, { useRef, useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';
import { MASTER_ADMIN_EMAIL } from '../constants.tsx';

const Profile: React.FC<{ player: Player, currentUserEmail?: string, onPageChange: (page: Page) => void }> = ({ player, currentUserEmail, onPageChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [editedName, setEditedName] = useState(player.name);
  const [editedPosition, setEditedPosition] = useState(player.position);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const isMaster = currentUserEmail === MASTER_ADMIN_EMAIL;

  const getSafePhotoUrl = () => {
    if (previewUrl) return previewUrl;
    if (player.photoUrl && player.photoUrl !== "") return player.photoUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=003876&color=fff&size=256`;
  };

  useEffect(() => {
    setEditedName(player.name);
    setEditedPosition(player.position);
    setPreviewUrl(null);
  }, [player.id, player.name, player.position, player.photoUrl]);

  const isDirty = editedName !== player.name || editedPosition !== player.position;

  const handleLogout = async () => {
    if (confirm("Deseja realmente sair da Arena O&A?")) {
      await logout();
    }
  };

  const handleClaimAdmin = async () => {
    if (isMaster) return;
    if (confirm("Deseja assumir o controle como ADMINISTRADOR da Arena?")) {
      setIsPromoting(true);
      try {
        const playerDocRef = doc(db, "players", player.id);
        await updateDoc(playerDocRef, { role: 'admin' });
        alert("Agora você é um ADMINISTRADOR ELITE!");
      } catch (e) {
        alert("Erro ao reivindicar acesso.");
      } finally {
        setIsPromoting(false);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert("A imagem deve ter no máximo 500KB.");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
        const playerDocRef = doc(db, "players", player.id);
        await updateDoc(playerDocRef, { photoUrl: base64String });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert("Falha ao atualizar foto.");
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
      alert("Perfil atualizado!");
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col animate-fade-in">
      <header className="px-6 pt-10 pb-6 glass-header sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 animate-slide-up">
            <img src={mainLogoUrl} className="w-8 h-8 object-contain hover:rotate-12 transition-transform" alt="Logo" />
            <h2 className="text-base font-black text-navy uppercase italic tracking-tighter leading-none">
              {isMaster ? 'DIRETORIA' : 'MEU PERFIL'}
            </h2>
          </div>
          <button onClick={handleLogout} className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary hover:bg-red-50 active:scale-90 transition-all animate-slide-up">
             <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </header>

      <section className="px-6 mt-6 flex flex-col items-center">
        {/* Avatar Section - Animated */}
        <div className="relative mb-5 animate-scale-up">
           <div className={`w-28 h-28 rounded-[2rem] border-[4px] ${isMaster ? 'border-primary' : 'border-white'} shadow-heavy overflow-hidden relative z-10 bg-slate-100 cursor-pointer group`} onClick={handleUploadClick}>
             <img 
              src={getSafePhotoUrl()} 
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-all duration-700 ${isUploading ? 'opacity-50 blur-[2px] scale-110' : 'opacity-100 group-hover:scale-105'}`} 
              alt={player.name}
             />
             <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/20 transition-all flex items-center justify-center">
               <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300">edit</span>
             </div>
             {isUploading && (
               <div className="absolute inset-0 bg-navy/40 flex items-center justify-center">
                 <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
               </div>
             )}
           </div>
           
           <button 
            onClick={handleUploadClick}
            disabled={isUploading}
            className={`absolute -bottom-1 -right-1 w-10 h-10 ${isMaster ? 'bg-navy' : 'bg-primary'} text-white rounded-xl border-[3px] border-white flex items-center justify-center z-20 shadow-xl hover:scale-110 active:scale-90 transition-all animate-float`}
           >
             <span className="material-symbols-outlined text-base">add_a_photo</span>
           </button>
           
           <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>

        <div className={`mb-5 px-3 py-1 rounded-full flex items-center gap-2 animate-slide-up stagger-1 ${isMaster ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">
            {isMaster ? 'MASTER ADMIN' : (player.role === 'admin' ? 'DIRETORIA' : 'ATLETA ELITE')}
          </span>
        </div>
        
        <div className="w-full text-center space-y-2 mb-6 animate-slide-up stagger-2">
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full text-xl font-black uppercase italic tracking-tighter text-center bg-transparent outline-none text-navy focus:text-primary transition-colors"
            placeholder="NOME"
          />
          <div className="flex justify-center">
            <select 
              value={editedPosition}
              onChange={(e) => setEditedPosition(e.target.value)}
              className="text-[9px] font-black uppercase tracking-[0.3em] bg-slate-50 px-3 py-1.5 rounded-lg text-navy outline-none border border-slate-100 hover:border-primary transition-colors"
            >
              <option value="Goleiro">Goleiro</option>
              <option value="Zagueiro">Zagueiro</option>
              <option value="Lateral">Lateral</option>
              <option value="Volante">Volante</option>
              <option value="Meia">Meia</option>
              <option value="Atacante">Atacante</option>
            </select>
          </div>
        </div>

        {!isMaster && player.role !== 'admin' && (
          <button 
            onClick={handleClaimAdmin}
            disabled={isPromoting}
            className="w-full mb-6 py-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-[8px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all animate-slide-up stagger-3"
          >
            {isPromoting ? "PROCESSANDO..." : "REIVINDICAR ACESSO ADM"}
          </button>
        )}

        <div className="grid grid-cols-2 gap-3 w-full mb-6">
           <div className="bg-white rounded-[1.5rem] p-4 border border-slate-100 shadow-sm text-center hover:shadow-heavy hover:translate-y-[-2px] transition-all duration-300 animate-slide-up stagger-3">
              <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest block mb-1">GOLS</span>
              <span className="text-2xl font-condensed italic font-black text-navy">{player.goals || 0}</span>
           </div>
           <div className="bg-white rounded-[1.5rem] p-4 border border-slate-100 shadow-sm text-center hover:shadow-heavy hover:translate-y-[-2px] transition-all duration-300 animate-slide-up stagger-4">
              <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest block mb-1">ASSISTS</span>
              <span className="text-2xl font-condensed italic font-black text-navy">{player.assists || 0}</span>
           </div>
        </div>

        {isDirty && (
          <button 
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="w-full h-12 bg-primary text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl shadow-primary/20 mb-4 hover:brightness-110 active:scale-95 transition-all animate-scale-up"
          >
            {isSaving ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
          </button>
        )}
      </section>
    </div>
  );
};

export default Profile;
