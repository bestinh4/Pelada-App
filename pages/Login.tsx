
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
      
      if (err.code === 'auth/unauthorized-domain') {
        setError("Domínio não autorizado. Adicione o domínio atual nas configurações de Autenticação do seu Console Firebase.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("O login foi cancelado. Tente novamente.");
      } else {
        setError("Erro ao conectar com a Arena. Verifique sua conexão.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-croatia pointer-events-none opacity-50"></div>
      
      {/* Decoração de fundo premium */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -mr-64 -mt-64 blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy/5 rounded-full -ml-64 -mb-64 blur-[120px]"></div>

      <div className="w-full max-w-[400px] bg-white/80 backdrop-blur-2xl rounded-apple-xl shadow-[0_32px_64px_rgba(5,10,24,0.12)] p-10 flex flex-col items-center z-10 border border-white/50">
        <div className="w-44 h-44 mb-8 flex items-center justify-center bg-white rounded-[2rem] p-4 shadow-xl shadow-navy/5 border border-slate-50 relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <img src={logoUrl} alt="Logo O&A Elite Pro" className="w-full h-full object-contain relative z-10" />
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter text-navy-deep leading-none mb-1 uppercase">O&A</h1>
          <h1 className="text-xl font-black italic tracking-widest text-primary uppercase">Elite Pro</h1>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-slate-100"></span>
            <span className="text-[9px] font-black uppercase text-slate-300 tracking-[0.3em]">Arena Management</span>
            <span className="h-px w-6 bg-slate-100"></span>
          </div>
        </div>

        {error && (
          <div className="w-full mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-red-500 text-sm">error</span>
              <div className="text-[10px] font-bold text-red-600 leading-tight">
                {error}
                {error.includes('Domínio') && (
                  <span className="block mt-2 underline opacity-70 italic">
                    Configuração: Console Firebase {' > '} Auth {' > '} Settings {' > '} Authorized Domains
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={handleGoogleLogin} 
          disabled={isLoggingIn}
          className="group relative flex w-full items-center justify-center gap-4 rounded-2xl bg-white border border-slate-100 h-16 px-8 text-navy-deep font-black uppercase text-[11px] tracking-widest shadow-sm active:scale-95 transition-all hover:bg-slate-50 hover:shadow-md hover:border-slate-200 disabled:opacity-50"
        >
          {isLoggingIn ? (
            <span className="material-symbols-outlined animate-spin text-primary">sync</span>
          ) : (
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
          )}
          <span>{isLoggingIn ? 'Autenticando...' : 'Acessar Arena Elite'}</span>
        </button>
        
        <p className="mt-10 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          Temporada 2024 • V1.0.6
        </p>
      </div>
    </div>
  );
};

export default Login;
