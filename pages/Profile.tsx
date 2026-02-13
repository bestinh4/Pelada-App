
import React, { useState, useRef, useEffect } from 'https://esm.sh/react@18.2.0';
import { Player } from '../types.ts';
import { db, doc, setDoc } from '../services/firebase.ts';

interface ProfileProps {
  player: Player;
}

const Profile: React.FC<ProfileProps> = ({ player }) => {
  const [currentPhoto, setCurrentPhoto] = useState(player.photoUrl);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({
    matches: "38",
    goals: player.goals?.toString() || "0",
    assists: "12",
    winRate: "82%"
  });

  const [originalStats, setOriginalStats] = useState({ ...stats });
  const [hasChanges, setHasChanges] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const logoUrl = "https://i.ibb.co/457WhWm/Gemini-Generated-Image-xrrv8axrrv8axrrv.png";

  useEffect(() => {
    const changed = JSON.stringify(stats) !== JSON.stringify(originalStats) || currentPhoto !== player.photoUrl;
    setHasChanges(changed);
  }, [stats, originalStats, currentPhoto, player.photoUrl]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1350 } }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      alert("Permissão de câmera necessária para gerar seu ID.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCurrentPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const playerDoc = doc(db, "players", player.id);
      await setDoc(playerDoc, {
        ...player,
        goals: parseInt(stats.goals),
        photoUrl: currentPhoto,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      setOriginalStats({ ...stats });
      setHasChanges(false);
      alert("Elite ID Sincronizado!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Falha na sincronização.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-700 min-h-full">
      <header className="flex items-center justify-between px-6 py-8 sticky top-0 z-10 bg-white/5 backdrop-blur-md border-b border-white/5">
        <div className="w-11"></div>
        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Athlete Registry</span>
          <h2 className="text-navy-deep text-sm font-black italic uppercase">Pro Elite Card</h2>
        </div>
        <div className="w-11 h-11 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 shadow-sm">
          <span className="material-symbols-outlined text-slate-400 text-[18px]">verified</span>
        </div>
      </header>

      {/* Elite FIFA Card */}
      <div className="px-6 py-6">
        <div className="relative w-full aspect-[3.2/4.6] rounded-[2.5rem] overflow-hidden shadow-[0_48px_80px_-15px_rgba(5,10,24,0.4)] group border-4 border-white/50">
          <div className="absolute inset-0 bg-navy-deep croatia-pattern"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-navy-deep via-transparent to-primary/15"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-deep/95"></div>
          
          <div className="absolute top-10 left-10 z-20 flex flex-col items-center gap-1">
            <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-2xl transition-transform hover:scale-110 overflow-hidden border border-white/20">
              <img src={logoUrl} alt="Elite Badge" className="w-full h-full object-contain" />
            </div>
            <div className="mt-3 flex flex-col items-center">
              <span className="text-white text-[18px] font-condensed tracking-widest leading-none">99</span>
              <span className="text-primary text-[8px] font-black uppercase tracking-widest">OVR</span>
            </div>
          </div>

          <div className="absolute inset-0 flex items-end justify-center z-10 pointer-events-none">
            <img src={currentPhoto} alt={player.name} className="h-[92%] w-auto object-contain object-bottom drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)] scale-110 transition-transform duration-1000 group-hover:scale-[1.12]" />
          </div>

          <div className="absolute bottom-0 w-full p-12 flex flex-col items-center z-20 text-center">
            <h1 className="text-white text-6xl font-condensed tracking-tighter uppercase leading-[0.75] mb-2 drop-shadow-lg">
               {player.name?.split(' ').pop() || 'ELITE'}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-primary font-black text-[10px] tracking-[0.4em] uppercase">{player.position}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              <span className="text-white/40 font-bold text-[10px] tracking-[0.4em] uppercase">Season 24</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="px-6 pt-6">
        <button 
          onClick={startCamera}
          className="w-full h-16 bg-white text-navy-deep border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/50 flex items-center justify-center gap-4 hover:bg-slate-50 active:scale-95 transition-all font-black uppercase tracking-[0.2em] text-[10px]"
        >
          <div className="w-10 h-10 rounded-xl bg-navy-deep text-white flex items-center justify-center shadow-lg shadow-navy/20">
            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
          </div>
          Renovar Foto de Elite
        </button>
      </div>

      {/* Detail Stats */}
      <div className="px-6 py-10 pb-40">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-navy-deep font-black text-xs uppercase tracking-[0.2em] opacity-50">Scout Profile</h3>
          <div className="h-px flex-1 mx-4 bg-slate-100"></div>
          <span className="text-[9px] font-black text-primary uppercase tracking-widest">Verificado</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Partidas" value={stats.matches} icon="stadium" onEdit={(val) => setStats(p => ({ ...p, matches: val }))} />
          <StatCard label="Gols" value={stats.goals} icon="sports_soccer" onEdit={(val) => setStats(p => ({ ...p, goals: val }))} />
          <StatCard label="Assists" value={stats.assists} icon="handshake" onEdit={(val) => setStats(p => ({ ...p, assists: val }))} />
          <StatCard label="Aprov." value={stats.winRate} icon="rocket_launch" dark onEdit={(val) => setStats(p => ({ ...p, winRate: val }))} />
        </div>
      </div>

      {/* Save Trigger */}
      {hasChanges && (
        <div className="fixed bottom-28 left-0 right-0 px-8 z-40 animate-in slide-in-from-bottom-12">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-18 bg-navy-deep text-white rounded-apple shadow-[0_32px_64px_-12px_rgba(5,10,24,0.4)] flex items-center justify-center gap-4 font-black uppercase tracking-[0.3em] text-[11px] active:scale-95 transition-all disabled:opacity-50 shimmer"
          >
            {isSaving ? (
              <span className="material-symbols-outlined animate-spin text-primary">sync</span>
            ) : (
              <span className="material-symbols-outlined text-primary">security</span>
            )}
            {isSaving ? 'Gravando Arena...' : 'Confirmar Atualizações'}
          </button>
        </div>
      )}

      {/* Camera Fullscreen Overlay */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-navy-deep flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-croatia opacity-5"></div>
          <button onClick={stopCamera} className="absolute top-12 right-12 w-14 h-14 bg-white/10 backdrop-blur-3xl text-white rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all z-50">
            <span className="material-symbols-outlined">close</span>
          </button>
          
          <div className="relative w-full max-w-[400px] aspect-[3/4] overflow-hidden rounded-[3.5rem] border-4 border-primary/30 shadow-[0_0_80px_rgba(237,29,35,0.2)] mx-6">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute inset-0 border-[30px] border-navy-deep/60 pointer-events-none">
               <div className="w-full h-full border-2 border-primary/20 rounded-[20%] animate-pulse"></div>
            </div>
            {/* Camera Visual Aids */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/10"></div>
            <div className="absolute top-0 left-1/2 w-px h-full bg-white/10"></div>
          </div>
          
          <div className="mt-16 flex flex-col items-center gap-6">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.5em]">Enquadramento Pro ID</p>
            <button onClick={capturePhoto} className="w-24 h-24 rounded-full bg-white p-2 active:scale-90 transition-all shadow-[0_0_60px_rgba(255,255,255,0.15)] relative group">
               <div className="absolute inset-0 rounded-full border border-white animate-ping opacity-20 group-hover:hidden"></div>
               <div className="w-full h-full rounded-full border-4 border-navy-deep/5 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-xl">
                     <span className="material-symbols-outlined text-white text-3xl">camera_rounded</span>
                  </div>
               </div>
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, dark, onEdit }: { label: string, value: string, icon: string, dark?: boolean, onEdit: (val: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [temp, setTemp] = useState(value);
  
  const finishEdit = () => {
    onEdit(temp);
    setIsEditing(false);
  };

  return (
    <div className={`relative group rounded-apple p-6 border transition-all duration-300 hover:scale-[1.03] ${dark ? 'bg-navy-deep border-navy-deep text-white shadow-xl shadow-navy/20' : 'bg-white border-slate-50 text-navy-deep shadow-sm'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-primary text-white' : 'bg-slate-50 text-slate-300'}`}>
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
        <button 
          onClick={() => isEditing ? finishEdit() : setIsEditing(true)} 
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${dark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100'}`}
        >
          <span className="material-symbols-outlined text-[14px]">{isEditing ? 'check' : 'edit'}</span>
        </button>
      </div>
      
      {isEditing ? (
        <input 
          autoFocus 
          className={`w-full bg-transparent text-4xl font-condensed border-b-2 outline-none ${dark ? 'border-white' : 'border-primary'}`} 
          value={temp} 
          onChange={e => setTemp(e.target.value)} 
          onBlur={finishEdit} 
          onKeyDown={e => e.key === 'Enter' && finishEdit()} 
        />
      ) : (
        <p className="text-4xl font-condensed leading-none tracking-tight">{value}</p>
      )}
      
      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-3 ${dark ? 'opacity-40' : 'text-slate-400'}`}>{label}</p>
    </div>
  );
};

export default Profile;
