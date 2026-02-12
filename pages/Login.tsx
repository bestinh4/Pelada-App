
import React from 'react';
import { loginWithGoogle } from '../services/firebase.ts';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = () => {
  const logoUrl = "https://upload.wikimedia.org/wikipedia/pt/c/cf/Croatia_football_federation.png";

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Falha no login:", error);
      alert("Erro ao entrar com Google. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-croatia pointer-events-none opacity-50"></div>
      
      <div className="w-full max-w-[430px] bg-white/90 backdrop-blur-xl rounded-apple-xl shadow-2xl border border-white/50 p-10 flex flex-col items-center z-10">
        <div className="relative w-44 h-44 mb-10 group">
          <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
          <div className="absolute inset-0 bg-navy/5 rounded-[2.5rem] -rotate-3 group-hover:-rotate-6 transition-transform duration-500"></div>
          <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl flex items-center justify-center p-6 transition-transform group-hover:scale-105 duration-500">
            <img 
              src={logoUrl} 
              alt="Elite Pro Logo" 
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
        </div>

        <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 mb-2">
          O&A <span className="text-primary">ELITE PRO</span>
        </h1>
        
        <div className="flex items-center justify-center gap-2 mb-12">
          <span className="h-[1px] w-4 bg-slate-300"></span>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
            Soccer Management Portal
          </p>
          <span className="h-[1px] w-4 bg-slate-300"></span>
        </div>

        <div className="w-full space-y-6">
          <button 
            onClick={handleGoogleLogin}
            className="flex w-full cursor-pointer items-center justify-center gap-4 rounded-full bg-white border border-slate-200 h-16 px-8 text-slate-700 font-semibold shadow-sm hover:border-primary/30 hover:shadow-lg transition-all active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            <span>Entrar com Google</span>
          </button>

          <div className="relative flex items-center px-4">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">OU</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">mail</span>
            <span>Continuar com e-mail</span>
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            © 2024 O&A FOOTBALL MANAGEMENT<br/>
            <span className="inline-flex gap-4 mt-2">
              <a href="#" className="hover:text-primary">Privacidade</a>
              <a href="#" className="hover:text-primary">Suporte</a>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
