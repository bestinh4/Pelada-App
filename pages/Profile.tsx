
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
  const [editedPlayerType, setEditedPlayerType] = useState(player.playerType || 'avulso');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const isMaster = currentUserEmail === MASTER_ADMIN_EMAIL;

  const getSafePhotoUrl = () => {
    if (previewUrl) return previewUrl;
    if (player.photoUrl && player.photoUrl !== "") return player.photoUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=0051a2&color=fff&size=256`;
  };

  useEffect(() => {
    setEditedName(player.name);
    setEditedPosition(player.position);
    setEditedPlayerType(player.playerType || 'avulso');
    setPreviewUrl(null);
  }, [player.id, player.name, player.position, player.photoUrl, player.playerType]);

  const isDirty = editedName !== player.name || editedPosition !== player.position || editedPlayerType !== player.playerType;

  const handleLogout = async () => {
    if (confirm("Deseja realmente sair da Arena O&A?")) {
      await logout();
    }
  };

  const handleClaimAdmin = async () => {
    if (isMaster) return;
    if (confirm("Deseja assumir o controle como ADMINISTRADOR?")) {
      setIsPromoting(true);
      try {
        const playerDocRef = doc(db, "players", player.id);
        await updateDoc(playerDocRef, { role: 'admin' });
        alert("Agora você é um ADMINISTRADOR!");
      } catch (e) { alert("Erro ao reivindicar acesso."); } finally { setIsPromoting(false); }
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { alert("A imagem deve ter no máximo 500KB."); return; }
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
        await updateDoc(doc(db, "players", player.id), { photoUrl: base64String });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) { alert("Falha ao atualizar foto."); setIsUploading(false); }
  };

  const handleSaveChanges = async () => {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "players", player.id), { 
        name: editedName, position: editedPosition, playerType: editedPlayerType
      });
      alert("Perfil atualizado!");
    } catch (error) { alert("Erro ao salvar."); } finally { setIsSaving(false); }
  };

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={mainLogoUrl} className="w-10 h-10 object-contain" alt="" />
          <h2 className="text-xl font-black text-navy uppercase italic tracking-tighter">{isMaster ? 'DIRETORIA' : 'MEU PERFIL'}</h2>
        </div>
        <button onClick={handleLogout} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm active:scale-90 transition-all">
           <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      <main className="flex flex-col items-center">
        {/* Avatar Section */}
        <div className="relative mb-8">
           <div className={`w-36 h-36 rounded-[2.5rem] border-[4px] ${isMaster ? 'border-primary shadow-glow-red' : 'border-white'} shadow-elite overflow-hidden relative z-10 bg-white cursor-pointer group`} onClick={handleUploadClick}>
             <img src={getSafePhotoUrl()} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" alt="" />
             {isUploading && (
               <div className="absolute inset-0 bg-navy/40 flex items-center justify-center">
                 <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
               </div>
             )}
           </div>
           <button onClick={handleUploadClick} disabled={isUploading} className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary text-white rounded-2xl border-[4px] border-white flex items-center justify-center z-20 shadow-xl active:scale-90 transition-all">
             <span className="material-symbols-outlined text-lg">add_a_photo</span>
           </button>
           <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>

        <div className={`mb-8 px-5 py-1.5 rounded-full flex items-center gap-2 ${isMaster ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">
            {isMaster ? 'MASTER ADMIN' : (player.role === 'admin' ? 'DIRETORIA' : 'ATLETA ELITE')}
          </span>
        </div>
        
        <div className="w-full space-y-8 bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-soft-white mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">NOME NO RACHA</label>
            <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-navy outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">POSIÇÃO</label>
            <select value={editedPosition} onChange={(e) => setEditedPosition(e.target.value)} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-navy">
              <option value="Goleiro">Goleiro</option>
              <option value="Zagueiro">Zagueiro</option>
              <option value="Lateral">Lateral</option>
              <option value="Volante">Volante</option>
              <option value="Meia">Meia</option>
              <option value="Atacante">Atacante</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">VÍNCULO</label>
            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => setEditedPlayerType('mensalista')} className={`h-16 rounded-2xl border flex flex-col items-center justify-center transition-all ${editedPlayerType === 'mensalista' ? 'bg-navy border-navy text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                 <span className="text-[10px] font-black uppercase tracking-widest">MENSALISTA</span>
               </button>
               <button onClick={() => setEditedPlayerType('avulso')} className={`h-16 rounded-2xl border flex flex-col items-center justify-center transition-all ${editedPlayerType === 'avulso' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                 <span className="text-[10px] font-black uppercase tracking-widest">AVULSO</span>
               </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mb-10">
           <StatBox label="GOLS" value={player.goals || 0} />
           <StatBox label="ASSISTS" value={player.assists || 0} />
        </div>

        {isDirty && (
          <button onClick={handleSaveChanges} disabled={isSaving} className="w-full h-20 bg-primary text-white rounded-[2rem] font-black uppercase text-[12px] tracking-[0.4em] shadow-glow-red shadow-2xl active:scale-95 transition-all mb-8">
            {isSaving ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
          </button>
        )}

        {!isMaster && player.role !== 'admin' && (
          <button onClick={handleClaimAdmin} disabled={isPromoting} className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-100 pb-1 mb-20">REIVINDICAR ADMIN</button>
        )}
      </main>
    </div>
  );
};

const StatBox = ({ label, value }: any) => (
  <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-soft-white text-center">
    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1">{label}</span>
    <span className="text-3xl font-condensed italic font-black text-navy">{value}</span>
  </div>
);

export default Profile;
