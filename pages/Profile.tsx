
import { logout, db, doc, updateDoc } from '../services/firebase.ts';
import React, { useRef, useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';

const Profile: React.FC<{ player: Player, onPageChange: (page: Page) => void }> = ({ player, onPageChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [editedName, setEditedName] = useState(player.name);
  const [editedPosition, setEditedPosition] = useState(player.position);
  const [editedPlayerType, setEditedPlayerType] = useState(player.playerType || 'mensalista');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  useEffect(() => {
    setEditedName(player.name);
    setEditedPosition(player.position);
    setEditedPlayerType(player.playerType || 'mensalista');
  }, [player.name, player.position, player.playerType]);

  const isDirty = 
    editedName !== player.name || 
    editedPosition !== player.position || 
    editedPlayerType !== player.playerType;

  const handleLogout = async () => {
    if (confirm("Deseja realmente sair da Arena O&A?")) {
      await logout();
    }
  };

  const handleClaimAdmin = async () => {
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

    if (!file.type.startsWith('image/')) {
      alert("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

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
        position: editedPosition,
        playerType: editedPlayerType
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
      <header className="px-6 pt-12 pb-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={mainLogoUrl} className="w-10 h-10 object-contain" alt="Logo" />
            <h2 className="text-lg font-black text-navy uppercase italic tracking-tighter leading-none">MEU PERFIL ELITE</h2>
          </div>
          <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary active:scale-90 transition-all">
             <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </header>

      <section className="px-6 mt-10 flex flex-col items-center">
        {/* Avatar Section */}
        <div className="relative mb-6 group">
           <div className="absolute inset-0 bg-primary/20 rounded-full blur-[50px] scale-150 opacity-50"></div>
           <div 
            onClick={handleUploadClick}
            className="w-44 h-44 rounded-[3.5rem] border-[10px] border-white shadow-2xl overflow-hidden relative z-10 transition-transform duration-500 group-hover:scale-105 cursor-pointer"
           >
             <img src={player.photoUrl} className="w-full h-full object-cover" alt={player.name} />
             {isUploading && (
               <div className="absolute inset-0 bg-navy/80 backdrop-blur-md flex flex-col items-center justify-center gap-2">
                 <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-[8px] font-black text-white uppercase tracking-widest">SUBINDO...</span>
               </div>
             )}
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
             </div>
           </div>
           
           <button 
            onClick={handleUploadClick}
            disabled={isUploading}
            className="absolute -bottom-2 -right-2 w-16 h-16 bg-primary text-white rounded-[1.5rem] border-4 border-white flex items-center justify-center z-20 shadow-xl active:scale-95 transition-all hover:bg-red-600"
           >
             <span className="material-symbols-outlined text-2xl fill-1">add_a_photo</span>
           </button>
           
           <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
           />
        </div>

        {/* Cargo Badge */}
        <div className={`mb-6 px-4 py-1.5 rounded-full flex items-center gap-2 ${player.role === 'admin' ? 'bg-navy text-white shadow-lg shadow-navy/20' : 'bg-slate-100 text-slate-400'}`}>
          <span className="material-symbols-outlined text-sm fill-1">{player.role === 'admin' ? 'military_tech' : 'person'}</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">{player.role === 'admin' ? 'DIRETORIA / ADM' : 'ATLETA ELITE'}</span>
        </div>
        
        <div className="w-full text-center space-y-4 mb-10 px-4">
          <div className="relative inline-block w-full">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full text-4xl font-condensed text-navy uppercase italic tracking-tighter text-center bg-transparent border-b-2 border-transparent focus:border-primary/20 outline-none transition-all pb-1"
              placeholder="NOME DO ATLETA"
            />
          </div>
          
          <select 
            value={editedPosition}
            onChange={(e) => setEditedPosition(e.target.value)}
            className="text-[10px] font-black uppercase text-primary tracking-[0.4em] italic bg-slate-100 px-4 py-2 rounded-full border-none outline-none appearance-none cursor-pointer text-center"
          >
            <option value="Goleiro">Goleiro</option>
            <option value="Zagueiro">Zagueiro</option>
            <option value="Lateral">Lateral</option>
            <option value="Volante">Volante</option>
            <option value="Meia">Meia</option>
            <option value="Atacante">Atacante</option>
          </select>
        </div>

        <div className="w-full bg-slate-100 p-1.5 rounded-[2rem] flex mb-10">
           <button 
            onClick={() => setEditedPlayerType('mensalista')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${editedPlayerType === 'mensalista' ? 'bg-white text-navy shadow-lg' : 'text-slate-400'}`}
           >
             <span className="material-symbols-outlined text-sm">calendar_month</span>
             Mensalista
           </button>
           <button 
            onClick={() => setEditedPlayerType('avulso')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${editedPlayerType === 'avulso' ? 'bg-white text-navy shadow-lg' : 'text-slate-400'}`}
           >
             <span className="material-symbols-outlined text-sm">confirmation_number</span>
             Avulso
           </button>
        </div>

        {/* Promoção a ADM - Visível se for o dono do perfil e não for admin ainda */}
        {player.role !== 'admin' && (
          <button 
            onClick={handleClaimAdmin}
            disabled={isPromoting}
            className="w-full mb-10 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center gap-3 text-slate-400 hover:border-navy hover:text-navy transition-all group"
          >
            {isPromoting ? (
              <div className="w-4 h-4 border-2 border-slate-300 border-t-navy rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined group-hover:fill-1">verified_user</span>
                <span className="text-[9px] font-black uppercase tracking-widest">Reivindicar Acesso ADM</span>
              </>
            )}
          </button>
        )}

        <div className="grid grid-cols-2 gap-4 w-full mb-10">
           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft text-center group transition-all hover:border-primary/20">
              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-primary fill-1">sports_soccer</span>
              </div>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-1">GOLS</span>
              <span className="text-4xl font-black text-navy italic font-condensed">{player.goals || 0}</span>
           </div>
           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft text-center group transition-all hover:border-navy/20">
              <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-navy fill-1">volunteer_activism</span>
              </div>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-1">ASSISTÊNCIAS</span>
              <span className="text-4xl font-black text-navy italic font-condensed">{player.assists || 0}</span>
           </div>
        </div>

        <div className="w-full bg-navy-deep rounded-[3rem] p-8 text-white relative overflow-hidden mb-12 shadow-2xl">
           <div className="absolute inset-0 bg-croatia opacity-[0.05] pointer-events-none"></div>
           <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">DADOS DO CONTRATO</h3>
                <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black px-2 py-1 rounded">ATIVO</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div>
                   <p className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">ID DO ATLETA</p>
                   <p className="text-xs font-bold font-mono text-white/80">ELITE-{player.id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>
           </div>
        </div>

        {isDirty && (
          <div className="fixed bottom-32 left-6 right-6 z-50 animate-in slide-in-from-bottom-8">
            <button 
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="w-full h-20 bg-primary text-white rounded-[2rem] font-black uppercase text-[12px] tracking-[0.3em] shadow-[0_20px_50px_rgba(237,29,35,0.4)] flex items-center justify-center gap-4 active:scale-95 transition-all"
            >
              {isSaving ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-2xl">save</span>
                  SALVAR ALTERAÇÕES NO PERFIL
                </>
              )}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
