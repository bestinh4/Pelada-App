
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
    <div className="min-h-screen bg-champions flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-12 flex flex-col items-center animate-fade-in">
        <div className="relative group">
           <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 group-hover:bg-primary/30 transition-all duration-1000"></div>
           <img src={logoUrl} alt="O&A Elite Pro" className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl brightness-110" />
        </div>
        
        <div className="text-center space-y-3 relative z-10">
          <h1 className="text-4xl font-condensed italic font-black tracking-tight text-navy uppercase leading-none">O&A ELITE PRO</h1>
          <div className="flex items-center justify-center gap-3">
             <span className="w-6 h-0.5 bg-primary"></span>
             <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-[0.4em]">CHAMPIONS OPERATION</p>
             <span className="w-6 h-0.5 bg-primary"></span>
          </div>
        </div>

        <div className="w-full space-y-4 relative z-10">
          <GlassButton onClick={handleGoogleLogin} disabled={isLoggingIn} variant="primary" size="xl" className="w-full h-18 !rounded-[2.5rem] shadow-premium">
            {isLoggingIn ? 'AUTENTICANDO...' : 'ACESSAR ARENA'}
          </GlassButton>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest text-center">AMBIENTE SEGURO DE OPERAÇÕES</p>
        </div>
      </div>
      
      <div className="absolute bottom-12 flex flex-col items-center gap-2 opacity-20">
         <span className="text-[8px] font-black tracking-widest uppercase">Elite Management System</span>
         <div className="w-1 h-1 bg-navy rounded-full"></div>
      </div>
    </div>
  );
};

export default Login;
