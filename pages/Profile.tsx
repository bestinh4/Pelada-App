
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

  const logoUrl = "https://upload.wikimedia.org/wikipedia/pt/c/cf/Croatia_football_federation.png";

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
      alert("Não foi possível acessar a câmera.");
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
      alert("Perfil atualizado!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 min-h-full">
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-navy">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">O&A ELITE PRO</span>
          <h2 className="text-navy text-sm font-black">Elite Athlete</h2>
        </div>
        <div className="w-10"></div>
      </header>

      <div className="px-6 py-2">
        <div className="relative w-full aspect-[3.2/4.5] rounded-apple-xl overflow-hidden shadow-2xl group">
          <div className="absolute inset-0 bg-navy-deep croatia-pattern"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-navy-deep via-transparent to-primary/10"></div>
          
          <div className="absolute top-8 left-8 z-20">
            <div className="w-12 h-12 bg-white rounded-xl p-2 shadow-lg">
              <img src={logoUrl} alt="Badge" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="absolute inset-0 flex items-end justify-center z-10">
            <img src={currentPhoto} alt={player.name} className="h-[85%] w-auto object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] scale-110" />
          </div>

          <div className="absolute bottom-0 w-full p-8 flex flex-col items-center z-20 bg-gradient-to-t from-navy-deep via-navy-deep/80 to-transparent pt-20">
            <h1 className="text-white text-6xl font-condensed tracking-tighter uppercase leading-none mb-2">{player.name?.split(' ').pop()}</h1>
            <div className="flex items-center gap-2">
              <span className="text-primary font-black text-[10px] tracking-widest uppercase">{player.position}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6 pb-2">
        <button 
          onClick={startCamera}
          className="w-full h-16 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all font-black uppercase tracking-[0.15em] text-xs"
        >
          <span className="material-symbols-outlined text-[24px]">photo_camera</span>
          Tirar foto do jogo
        </button>
      </div>

      <div className="px-6 py-6 pb-32">
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Matches" value={stats.matches} icon="sports_soccer" onEdit={(val) => setStats(p => ({ ...p, matches: val }))} />
          <StatCard label="Goals" value={stats.goals} icon="target" onEdit={(val) => setStats(p => ({ ...p, goals: val }))} />
        </div>
      </div>

      {hasChanges && (
        <div className="fixed bottom-28 left-0 right-0 px-6 z-40 animate-in slide-in-from-bottom-8">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-16 bg-navy text-white rounded-2xl shadow-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-xs"
          >
            <span className={`material-symbols-outlined ${isSaving ? 'animate-spin' : ''}`}>{isSaving ? 'sync' : 'save'}</span>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      )}

      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <button onClick={stopCamera} className="absolute top-6 right-6 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
          <video ref={videoRef} autoPlay playsInline className="w-full max-w-[430px] aspect-[3/4] object-cover scale-x-[-1]" />
          <button onClick={capturePhoto} className="mt-12 w-20 h-20 rounded-full bg-white p-1.5 active:scale-90 shadow-xl">
             <div className="w-full h-full rounded-full bg-primary"></div>
          </button>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, onEdit }: { label: string, value: string, icon: string, onEdit: (val: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [temp, setTemp] = useState(value);
  return (
    <div className="bg-white rounded-apple-xl p-5 border border-slate-50 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <span className="material-symbols-outlined text-slate-300">{icon}</span>
        <button onClick={() => { if(isEditing) onEdit(temp); setIsEditing(!isEditing); }} className="w-7 h-7 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
          <span className="material-symbols-outlined text-[16px]">{isEditing ? 'check' : 'edit'}</span>
        </button>
      </div>
      {isEditing ? (
        <input className="w-full bg-transparent text-4xl font-condensed border-b border-primary outline-none" value={temp} onChange={e => setTemp(e.target.value)} />
      ) : (
        <p className="text-4xl font-condensed">{value}</p>
      )}
      <p className="text-[9px] font-black uppercase text-slate-400 mt-1">{label}</p>
    </div>
  );
};

export default Profile;
