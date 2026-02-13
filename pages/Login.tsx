import React, { useState } from 'react';
import { loginWithGoogle } from '../services/firebase.ts';

const Login: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<{ message: string; isDomainError: boolean } | null>(null);
  
  const logoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Erro Firebase:", err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setError({
          message: `Domínio não autorizado. Você precisa adicionar "${window.location.hostname}" na lista de Domínios Autorizados do seu Firebase Console.`,
          isDomainError: true
        });
      } else {
        setError({
          message: "Falha na conexão com a Arena. Verifique sua rede.",
          isDomainError: false
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-croatia opacity-[0.5] pointer-events-none"></div>
      <div className="w-full max-w-[420px] bg-white rounded-apple-xl shadow-[0_30px_70px_rgba(0,56,118,0.15)] border border-slate-100 p-10 flex flex-col items-center z-10">
        <div className="w-44 h-44 mb-6 flex items-center justify-center relative">
          <img src={logoUrl} alt="O&A Elite Pro" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
        </div>
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black tracking-tighter text-navy uppercase italic mb-2">O&A ELITE PRO</h1>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Gestão Esportiva</p>
        </div>
        {error && <p className="text-red-500 text-xs mb-4">{error.message}</p>}
        <button onClick={handleGoogleLogin} disabled={isLoggingIn} className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-3">
          {isLoggingIn ? 'CONECTANDO...' : 'ACESSAR ARENA COM GOOGLE'}
        </button>
      </div>
    </div>
  );
};

export default Login;