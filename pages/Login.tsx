
import React, { useState } from 'https://esm.sh/react@18.2.0';
import { loginWithGoogle } from '../services/firebase.ts';

const Login: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logoUrl = "https://i.ibb.co/457WhWm/Gemini-Generated-Image-xrrv8axrrv8axrrv.png";

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Falha no login:", err);
      setError("Erro ao conectar com a Arena. Verifique sua conexão.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Croatia Pattern Background */}
      <div className="absolute inset-0 bg-croatia opacity-[0.03] pointer-events-none"></div>
      
      {/* Decorative Elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-navy/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-[420px] bg-white rounded-apple-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-10 flex flex-col items-center z-10">
        <div className="w-40 h-40 mb-8 bg-white rounded-3xl p-4 shadow-xl shadow-slate-200/50 border border-slate-50">
          <img src={logoUrl} alt="Logo O&A" className="w-full h-full object-contain" />
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter text-navy leading-none mb-1 uppercase">O&A</h1>
          <h1 className="text-xl font-black italic tracking-widest text-primary uppercase">ELITE PRO</h1>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-slate-200"></span>
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">Croatia Edition</span>
            <span className="h-px w-6 bg-slate-200"></span>
          </div>
        </div>

        {error && (
          <div className="w-full mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in slide-in-from-top-1">
            <p className="text-[11px] font-bold text-red-600 text-center">{error}</p>
          </div>
        )}

        <button 
          onClick={handleGoogleLogin} 
          disabled={isLoggingIn}
          className="w-full h-16 bg-primary hover:bg-red-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isLoggingIn ? (
            <span className="material-symbols-outlined animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined">login</span>
          )}
          {isLoggingIn ? 'ENTRANDO...' : 'ACESSAR ARENA'}
        </button>
        
        <p className="mt-10 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
          SISTEMA DE GESTÃO ESPORTIVA • V1.2.0
        </p>
      </div>
    </div>
  );
};

export default Login;
