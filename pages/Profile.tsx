
import { logout, db, doc, updateDoc } from '../services/firebase.ts';
import React, { useRef, useState, useEffect } from 'react';
import { Player, Page } from '../types.ts';
import { MASTER_ADMIN_EMAIL } from '../constants.tsx';
import { requestNotificationPermission, getNotificationStatus, sendPushNotification } from '../services/notificationService.ts';

const Profile: React.FC<{ player: Player, currentUserEmail?: string, onPageChange: (page: Page) => void }> = ({ player, currentUserEmail, onPageChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedName, setEditedName] = useState(player.name);
  const [editedPosition, setEditedPosition] = useState(player.position);
  const [editedPlayerType, setEditedPlayerType] = useState(player.playerType || 'avulso');
  const [notifStatus, setNotifStatus] = useState(getNotificationStatus());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";
  const isMaster = currentUserEmail === MASTER_ADMIN_EMAIL;
  const isAdm = player.role === 'admin' || isMaster;

  const isDirty = editedName !== player.name || editedPosition !== player.position || (isAdm && editedPlayerType !== player.playerType);

  return (
    <div className="flex flex-col animate-fade-in px-6">
      <header className="py-12 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-navy uppercase italic tracking-tighter leading-none">MEU PERFIL</h2>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">CADASTRO DE ATLETA</p>
        </div>
        <button onClick={() => logout()} className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-soft-white active:scale-90 transition-all">
           <span className="material-symbols-outlined text-2xl">logout</span>
        </button>
      </header>

      <main className="flex flex-col items-center pb-48">
        <div className="relative mb-14">
           <div className={`w-40 h-40 rounded-[3rem] border-4 ${isAdm ? 'border-primary shadow-glow-red' : 'border-white'} shadow-elite overflow-hidden relative z-10 bg-white group cursor-pointer`} onClick={() => fileInputRef.current?.click()}>
             <img src={player.photoUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" alt="" />
             {isUploading && <div className="absolute inset-0 bg-navy/40 flex items-center justify-center animate-pulse"><div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div></div>}
           </div>
           <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-3 -right-3 w-14 h-14 bg-navy text-white rounded-[1.5rem] border-4 border-white flex items-center justify-center z-20 shadow-xl active:scale-90 transition-all">
             <span className="material-symbols-outlined">add_a_photo</span>
           </button>
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={async (e) => {
             const file = e.target.files?.[0]; if (!file) return;
             setIsUploading(true);
             const reader = new FileReader();
             reader.onloadend = async () => {
               await updateDoc(doc(db, "players", player.id), { photoUrl: reader.result as string });
               setIsUploading(false);
             };
             reader.readAsDataURL(file);
           }} />
        </div>

        <div className="w-full space-y-10 bg-white border border-slate-100 p-10 rounded-[3.5rem] shadow-elite relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 opacity-[0.08] pointer-events-none rotate-12">
              <img src={mainLogoUrl} className="w-full h-full grayscale" />
          </div>

          <div className="space-y-4 relative z-10">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">NOME DE GUERRA</label>
            <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="w-full h-18 bg-slate-50 border border-slate-100 rounded-2xl px-8 font-black text-navy text-lg focus:border-navy outline-none" />
          </div>

          <div className="space-y-4 relative z-10">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">POSIÇÃO EM CAMPO</label>
            <select value={editedPosition} onChange={(e) => setEditedPosition(e.target.value)} className="w-full h-18 bg-slate-50 border border-slate-100 rounded-2xl px-8 font-black text-navy text-lg focus:border-navy outline-none">
              <option value="Goleiro">Goleiro</option>
              <option value="Zagueiro">Zagueiro</option>
              <option value="Lateral">Lateral</option>
              <option value="Volante">Volante</option>
              <option value="Meia">Meia</option>
              <option value="Atacante">Atacante</option>
            </select>
          </div>

          {/* APENAS ADMS PODEM VER E EDITAR A MODALIDADE NO PERFIL */}
          {isAdm ? (
            <div className="space-y-4 relative z-10">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">MODALIDADE CONTRATUAL</label>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setEditedPlayerType('mensalista')} className={`h-18 rounded-2xl border-2 flex items-center justify-center font-black uppercase text-[11px] tracking-widest transition-all ${editedPlayerType === 'mensalista' ? 'bg-navy border-navy text-white shadow-elite' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>MENSALISTA</button>
                 <button onClick={() => setEditedPlayerType('avulso')} className={`h-18 rounded-2xl border-2 flex items-center justify-center font-black uppercase text-[11px] tracking-widest transition-all ${editedPlayerType === 'avulso' ? 'bg-primary border-primary text-white shadow-glow-red' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>AVULSO</button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 relative z-10">
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-2">STATUS CONTRATUAL</span>
               <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${player.playerType === 'mensalista' ? 'bg-navy' : 'bg-primary'} animate-pulse`}></div>
                  <p className="text-[13px] font-black text-navy uppercase italic">{player.playerType || 'AVULSO'}</p>
               </div>
               <p className="text-[9px] text-slate-400 mt-2 italic">*Alterações permitidas apenas pela diretoria.</p>
            </div>
          )}

          {isDirty && (
            <button 
              onClick={async () => {
                setIsSaving(true);
                const updates: any = { name: editedName, position: editedPosition };
                if (isAdm) updates.playerType = editedPlayerType;
                await updateDoc(doc(db, "players", player.id), updates);
                setIsSaving(false); alert("Salvo!");
              }}
              className="w-full h-20 bg-navy text-white rounded-[2rem] font-black uppercase text-[12px] tracking-widest shadow-elite active:scale-95 transition-all mt-6"
            >
              {isSaving ? "PROCESSANDO..." : "SALVAR ALTERAÇÕES"}
            </button>
          )}
        </div>

        <div className="w-full mt-10 space-y-6">
           <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-soft-white">
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h4 className="text-[11px] font-black text-navy uppercase italic tracking-tighter leading-none mb-1">NOTIFICAÇÕES DO SISTEMA</h4>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">STATUS: {notifStatus.toUpperCase()}</p>
                 </div>
                 <div className={`w-3 h-3 rounded-full ${notifStatus === 'granted' ? 'bg-success' : 'bg-primary'} animate-pulse`}></div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 {notifStatus !== 'granted' && (
                    <button 
                      onClick={async () => {
                        const granted = await requestNotificationPermission(player.id);
                        setNotifStatus(getNotificationStatus());
                        if (granted) alert("Notificações ativadas!");
                      }}
                      className="w-full h-16 bg-navy text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-elite flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">notifications_active</span>
                      ATIVAR ALERTAS NO DISPOSITIVO
                    </button>
                 )}
                 
                 <button 
                    onClick={() => {
                      sendPushNotification("TESTE DE ELITE! ⚽", "Se você está vendo isso, as notificações estão configuradas corretamente.");
                    }}
                    className="w-full h-16 bg-slate-50 border border-slate-100 text-navy rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
                 >
                    <span className="material-symbols-outlined text-lg">send</span>
                    TESTAR NOTIFICAÇÃO AGORA
                 </button>
              </div>
              <p className="text-[9px] text-slate-400 mt-4 italic text-center leading-relaxed">
                *As notificações aparecem na barra do sistema mesmo com o app em segundo plano. Se o app estiver fechado, certifique-se de ter instalado o PWA (Adicionar à tela inicial).
              </p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full mt-10">
           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft-white text-center">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">GOLS</span>
              <span className="text-5xl font-condensed italic font-black text-navy">{player.goals || 0}</span>
           </div>
           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft-white text-center">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">ASSISTS</span>
              <span className="text-5xl font-condensed italic font-black text-navy">{player.assists || 0}</span>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
