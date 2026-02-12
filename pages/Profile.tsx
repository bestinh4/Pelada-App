
import React, { useState, useRef, useEffect } from 'react';
import { Player } from '../types.ts';
import { db, doc, setDoc } from '../services/firebase.ts';

interface ProfileProps {
  player: Player;
}

const Profile: React.FC<ProfileProps> = ({ player }) => {
  const [currentPhoto, setCurrentPhoto] = useState(player.photoUrl);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
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

  const logoUrl = "https://upload.wikimedia.org/wikipedia/pt/c/cf/Croatia_football_federation.png";

  useEffect(() => {
    const changed = JSON.stringify(stats) !== JSON.stringify(originalStats) || currentPhoto !== player.photoUrl;
    setHasChanges(changed);
  }, [stats, originalStats, currentPhoto, player.photoUrl]);

  const startCamera = async () => {
    setCameraError(null);
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
      setCameraError("Não foi possível acessar a câmera. Verifique as permissões.");
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
      alert("Perfil atualizado na Arena Elite!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in zoom-in duration-500 relative min-h-full">
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-md text-navy shadow-sm active:scale-90 transition-all">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">O&A ELITE PRO</span>
          <h2 className="text-navy text-sm font-black">Elite Athlete</h2>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-md text-navy shadow-sm active:scale-90 transition-all">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </header>

      <div className="px-6 py-2">
        <div className="relative w-full aspect-[3.2/4.5] rounded-apple-xl overflow-hidden shadow-2xl group">
          <div className="absolute inset-0 bg-navy-deep croatia-pattern"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-navy-deep via-transparent to-primary/10"></div>
          
          <div className="absolute top-8 left-8 flex flex-col items-center gap-3 z-20">
            <div className="w-12 h-12 bg-white rounded-xl shadow-lg p-2 flex items-center justify-center transition-transform hover:rotate-12">
              <img src={logoUrl} alt="Club Badge" className="w-full h-full object-contain" />
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent opacity-50"></div>
            <span className="material-symbols-outlined text-white/40 text-2xl">verified</span>
          </div>

          <div className="absolute inset-0 flex items-end justify-center z-10">
            <img src={currentPhoto} alt={player.name} className="h-[85%] w-auto object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] scale-110 transition-transform duration-700 group-hover:scale-[1.15]" />
          </div>

          <button 
            onClick={startCamera}
            className="absolute bottom-24 right-6 z-30 w-14 h-14 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[28px]">photo_camera</span>
          </button>

          <div className="absolute bottom-0 w-full p-8 flex flex-col items-center z-20 bg-gradient-to-t from-navy-deep via-navy-deep/80 to-transparent pt-20">
            <h1 className="text-white text-6xl font-condensed tracking-tighter uppercase leading-none mb-2">{player.name?.split(' ').pop()}</h1>
            <div className="flex items-center gap-2">
              <span className="text-primary font-black text-[10px] tracking-widest uppercase">{player.position}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
              <span className="text-white/60 font-bold text-[10px] tracking-widest uppercase">{player.team || 'Elite Pro'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 pb-32">
        <div className="flex items-end justify-between mb-6">
          <div className="flex flex-col">
            <h3 className="text-navy font-black text-2xl tracking-tight">Performance</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Season 2023/24</p>
          </div>
          <div className="px-4 py-1.5 bg-primary/10 rounded-full">
            <span className="text-primary text-[10px] font-black uppercase tracking-widest">Elite Tier</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            label="Matches" 
            value={stats.matches} 
            icon="sports_soccer" 
            rank="01" 
            onEdit={(val) => setStats(prev => ({ ...prev, matches: val }))}
          />
          <StatCard 
            label="Goals" 
            value={stats.goals} 
            icon="target" 
            rank="02" 
            onEdit={(val) => setStats(prev => ({ ...prev, goals: val }))}
          />
          <StatCard 
            label="Assists" 
            value={stats.assists} 
            icon="assistant_navigation" 
            rank="03" 
            onEdit={(val) => setStats(prev => ({ ...prev, assists: val }))}
          />
          <StatCard 
            label="Win Rate" 
            value={stats.winRate} 
            icon="trending_up" 
            rank="04" 
            dark 
            onEdit={(val) => setStats(prev => ({ ...prev, winRate: val }))}
          />
        </div>
      </div>

      {hasChanges && (
        <div className="fixed bottom-28 left-0 right-0 px-6 z-40 animate-in slide-in-from-bottom-8">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full h-16 bg-navy text-white rounded-2xl shadow-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-xs transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-navy-deep active:scale-95'}`}
          >
            <span className={`material-symbols-outlined ${isSaving ? 'animate-spin' : ''}`}>{isSaving ? 'sync' : 'save'}</span>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      )}

      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="absolute top-6 right-6 z-[110]">
            <button onClick={stopCamera} className="w-12 h-12 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center active:scale-90 transition-all">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="relative w-full max-w-[430px] aspect-[3/4] overflow-hidden bg-navy-deep border-y-4 border-primary">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none">
              <div className="w-full h-full border border-white/20 rounded-[20%]"></div>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center gap-6">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Centralize seu rosto</p>
            <button onClick={capturePhoto} className="w-20 h-20 rounded-full bg-white p-1.5 active:scale-90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              <div className="w-full h-full rounded-full border-4 border-black/5 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-primary"></div>
              </div>
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, rank, dark, onEdit }: { label: string, value: string, icon: string, rank: string, dark?: boolean, onEdit: (val: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleToggleEdit = () => {
    if (isEditing) onEdit(tempValue);
    setIsEditing(!isEditing);
  };

  return (
    <div className={`rounded-apple-xl p-5 border shadow-sm group transition-all hover:scale-[1.02] ${dark ? 'bg-navy-deep border-navy-deep text-white' : 'bg-white border-slate-50 text-navy'}`}>
      <div className="flex justify-between items-start mb-4">
        <span className={`material-symbols-outlined ${dark ? 'text-primary' : 'text-slate-300'}`}>{icon}</span>
        <div className="flex items-center gap-2">
          <button onClick={handleToggleEdit} className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${dark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-400'}`}>
            <span className="material-symbols-outlined text-[16px]">{isEditing ? 'check' : 'edit'}</span>
          </button>
          <span className="text-[10px] font-black opacity-20">{rank}</span>
        </div>
      </div>
      {isEditing ? (
        <input autoFocus className={`w-full bg-transparent text-4xl font-condensed tracking-tight border-b border-primary/50 outline-none ${dark ? 'text-white' : 'text-navy'}`} value={tempValue} onChange={(e) => setTempValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleToggleEdit()} />
      ) : (
        <p className="text-4xl font-condensed tracking-tight">{value}</p>
      )}
      <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${dark ? 'opacity-40' : 'text-slate-400'}`}>{label}</p>
    </div>
  );
};

export default Profile;
