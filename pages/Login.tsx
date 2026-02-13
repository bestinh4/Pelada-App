
import React, { useState } from 'https://esm.sh/react@18.2.0';
import { loginWithGoogle } from '../services/firebase.ts';

const Login: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<{ message: string; isDomainError: boolean } | null>(null);
  
  // Logo transparente atualizada
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
          message: `Domínio não autorizado. Você precisa adicionar "${window.location.hostname}" na lista de Domínios Autorizados do seu Firebase Console para permitir o login via Google.`,
          isDomainError: true
        });
      } else {
        setError({
          message: "Falha na conexão com a Arena. Verifique sua rede e tente novamente.",
          isDomainError: false
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Croatia Pattern Background */}
      <div className="absolute inset-0 bg-croatia opacity-[0.5] pointer-events-none"></div>
      
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-[420px] bg-white rounded-apple-xl shadow-[0_30px_70px_rgba(0,56,118,0.15)] border border-slate-100 p-10 flex flex-col items-center z-10 animate-in zoom-in-95 fade-in duration-700">
        
        {/* Logo Container */}
        <div className="w-44 h-44 mb-6 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse"></div>
          <img src={logoUrl} alt="O&A Elite Pro" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black tracking-tighter text-navy uppercase italic leading-none mb-2">O&A ELITE PRO</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-primary/30"></span>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Gestão Esportiva</span>
            <span className="h-px w-6 bg-primary/30"></span>
          </div>
        </div>

        {error && (
          <div className={`w-full mb-8 p-5 rounded-2xl animate-in slide-in-from-top-2 border ${error.isDomainError ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-100'}`}>
            <div className="flex gap-3">
              <span className={`material-symbols-outlined text-lg ${error.isDomainError ? 'text-amber-600' : 'text-red-600'}`}>
                {error.isDomainError ? 'warning' : 'error'}
              </span>
              <div className="flex-1">
                <p className={`text-[11px] font-bold leading-relaxed mb-2 ${error.isDomainError ? 'text-amber-800' : 'text-red-800'}`}>
                  {error.message}
                </p>
                {error.isDomainError && (
                  <div className="text-[10px] text-amber-700 space-y-1 bg-amber-100/50 p-3 rounded-lg border border-amber-200/50">
                    <p className="font-bold uppercase tracking-wider mb-1">Como resolver:</p>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>Vá ao Console do Firebase</li>
                      <li>Clique em <strong>Authentication</strong></li>
                      <li>Aba <strong>Settings</strong> &gt; <strong>Authorized Domains</strong></li>
                      <li>Adicione: <code className="bg-amber-200 px-1 rounded">{window.location.hostname}</code></li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={handleGoogleLogin} 
          disabled={isLoggingIn}
          className="w-full h-16 bg-primary hover:bg-red-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 group mb-6"
        >
          {isLoggingIn ? (
            <span className="material-symbols-outlined animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined transition-transform group-hover:scale-110">stadium</span>
          )}
          {isLoggingIn ? 'CONECTANDO...' : 'ACESSAR ARENA COM GOOGLE'}
        </button>
        
        <div className="flex flex-col items-center gap-4 pt-4">
           <div className="flex gap-1.5">
             {[...Array(6)].map((_, i) => (
               <div key={i} className={`w-2.5 h-2.5 rotate-45 border-2 ${i % 2 === 0 ? 'bg-primary border-primary' : 'bg-white border-primary/20'}`}></div>
             ))}
           </div>
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] italic">
            Developed for Croatia Selection • V2.5.1
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
