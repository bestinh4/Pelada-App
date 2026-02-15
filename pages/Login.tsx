
import React, { useState } from 'react';
import { loginWithGoogle } from '../services/firebase.ts';
import { GlassButton } from '../components/ui/GlassButton.tsx';

const Login: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const logoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try { await loginWithGoogle(); }
    catch (err: any) { alert("Conexão falhou. Verifique sua rede."); }
    finally { setIsLoggingIn(false); }
  };

  return (
    <div className="min-h-screen bg-champions-gradient flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* DECORAÇÃO DE FUNDO */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary/5 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-navy/5 blur-[100px] rounded-full"></div>

      <div className="w-full max-w-sm space-y-16 flex flex-col items-center animate-fade-in relative z-10">
        <div className="relative group">
           <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-full scale-150 group-hover:bg-primary/20 transition-all duration-1000"></div>
           <img src={logoUrl} alt="Ousadia e Alegria" className="w-56 h-56 object-contain relative z-10 drop-shadow-2xl animate-float" />
        </div>
        
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-condensed italic font-black tracking-tight text-navy uppercase leading-none">OUSADIA & ALEGRIA</h1>
          <div className="flex items-center justify-center gap-4">
             <div className="w-8 h-0.5 bg-primary/20"></div>
             <p className="text-[11px] font-extrabold uppercase text-primary tracking-[0.5em]">APP DA PELADA</p>
             <div className="w-8 h-0.5 bg-primary/20"></div>
          </div>
        </div>

        <div className="w-full space-y-6">
          <GlassButton onClick={handleGoogleLogin} disabled={isLoggingIn} variant="primary" size="xl" className="w-full h-20 !rounded-[2.5rem] shadow-elite text-sm tracking-[0.3em]">
            {isLoggingIn ? 'ENTRANDO...' : 'ACESSAR RACHA'}
          </GlassButton>
          <div className="flex flex-col items-center gap-4">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">Gestão de Presença e Sorteio</p>
             <div className="w-1 h-1 bg-navy/20 rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-12 flex flex-col items-center gap-3 opacity-20">
         <span className="text-[9px] font-black tracking-[0.4em] uppercase text-navy">Ousadia & Alegria © 2024</span>
      </div>
    </div>
  );
};

export default Login;
