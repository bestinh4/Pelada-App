
import React, { useState } from 'react';
import { loginWithGoogle } from '../services/firebase.ts';
import { GlassButton } from '../components/ui/GlassButton.tsx';

const Login: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const logoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try { await loginWithGoogle(); }
    catch (err: any) { alert("Conexão falhou."); }
    finally { setIsLoggingIn(false); }
  };

  return (
    <div className="min-h-screen bg-neo-dots flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="w-full max-w-sm space-y-20 flex flex-col items-center animate-fade-in relative z-10">
        <div className="relative group">
           <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full scale-150 transition-all duration-1000"></div>
           <img src={logoUrl} alt="Ousadia e Alegria" className="w-64 h-64 object-contain relative z-10 drop-shadow-2xl animate-float" />
        </div>
        
        <div className="text-center space-y-5">
          <h1 className="text-6xl font-condensed italic font-black tracking-tighter text-navy uppercase leading-none">OUSADIA & ALEGRIA</h1>
          <div className="flex items-center justify-center gap-6">
             <div className="w-12 h-0.5 bg-primary/20"></div>
             <p className="text-[12px] font-black uppercase text-primary tracking-[0.6em]">ESTÁDIO DIGITAL</p>
             <div className="w-12 h-0.5 bg-primary/20"></div>
          </div>
        </div>

        <div className="w-full space-y-8">
          <button 
            onClick={handleGoogleLogin} 
            disabled={isLoggingIn}
            className="w-full h-20 bg-primary text-white rounded-full font-black uppercase text-[12px] tracking-[0.4em] shadow-glow-red shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            {isLoggingIn ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'ENTRAR NO RACHA'}
          </button>
          
          <div className="text-center">
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronizado com Arena Cloud v3.5</p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-12 opacity-30">
         <span className="text-[10px] font-black tracking-[0.5em] uppercase text-navy">CROATIA ELITE SERIES</span>
      </div>
    </div>
  );
};

export default Login;
