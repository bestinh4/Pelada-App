
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

  // Sincroniza estado local se as props mudarem (ex: após salvamento ou carregamento inicial)
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
    <div className="flex flex-col animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" />
            <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">MEU SCOUT</h2>
          </div>
          <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary active:scale-90">
             <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </header>

      <section className="px-6 mt-10 flex flex-col items-center">
        {/* Avatar Section */}
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
           
           <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            capture="user" 
            className="hidden" 
           />

           <div className="absolute -top-4 -left-4 w-12 h-12 bg-navy text-white rounded-2xl border-4 border-white flex items-center justify-center z-20 shadow-xl rotate-[-15deg]">
             <span className="text-lg font-black italic">PRO</span>
           </div>
        </div>
        
        {/* Editable Name and Position */}
        <div className="w-full text-center space-y-2 mb-8">
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

        {/* Save Changes Button (Visible only when dirty) */}
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
            SALVAR ALTERAÇÕES
          </button>
        )}

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-4 mb-10">
           <StatCard label="GOLS" value={player.goals.toString()} icon="sports_soccer" color="text-primary" />
           <StatCard label="ASSIST" value="12" icon="handshake" color="text-navy" />
        </div>

        {/* Skills Section */}
        <div className="w-full bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft space-y-6 mb-12">
           <div className="flex justify-between items-center mb-2 px-1">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">ATRIBUTOS TÉCNICOS</h3>
             <span className="material-symbols-outlined text-slate-200 text-sm">analytics</span>
           </div>
           <SkillProgress label="Ataque" value={player.skills?.attack || 85} color="bg-primary" />
           <SkillProgress label="Defesa" value={player.skills?.defense || 70} color="bg-navy" />
           <SkillProgress label="Stamina" value={player.skills?.stamina || 92} color="bg-emerald-500" />
        </div>

        <button className="w-full h-18 bg-slate-100 text-navy rounded-3xl font-black uppercase text-[11px] tracking-widest active:scale-95 transition-all mb-4 border border-slate-200">
           EDITAR PERFIL TÉCNICO
        </button>
      </section>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-soft text-center group hover:border-primary/20 transition-colors">
     <span className={`material-symbols-outlined ${color} mb-3 group-hover:scale-125 transition-transform`}>{icon}</span>
     <p className="text-4xl font-condensed text-navy mb-1 tracking-widest">{value}</p>
     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
  </div>
);

const SkillProgress = ({ label, value, color }: any) => (
  <div className="space-y-2">
     <div className="flex justify-between text-[10px] font-black uppercase italic tracking-widest text-navy">
        <span>{label}</span>
        <span className="text-slate-300">{value}%</span>
     </div>
     <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.05)]`} style={{ width: `${value}%` }}></div>
     </div>
  </div>
);

export default Profile;
