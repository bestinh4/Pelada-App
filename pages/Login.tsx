
import React from 'https://esm.sh/react@18.2.0';
import { loginWithGoogle } from '../services/firebase.ts';

const Login: React.FC = () => {
  const logoUrl = "https://upload.wikimedia.org/wikipedia/pt/c/cf/Croatia_football_federation.png";

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Falha no login:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-croatia pointer-events-none opacity-50"></div>
      <div className="w-full max-w-[430px] bg-white/90 backdrop-blur-xl rounded-apple-xl shadow-2xl p-10 flex flex-col items-center z-10">
        <img src={logoUrl} alt="Logo" className="w-44 h-44 mb-10 object-contain" />
        <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 mb-2">O&A <span className="text-primary">ELITE PRO</span></h1>
        <button onClick={handleGoogleLogin} className="flex w-full items-center justify-center gap-4 rounded-full bg-white border border-slate-200 h-16 px-8 text-slate-700 font-semibold shadow-sm active:scale-95 transition-all">
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          <span>Entrar com Google</span>
        </button>
      </div>
    </div>
  );
};

export default Login;
