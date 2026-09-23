
import React, { useState } from 'react';
import { Page } from '../types.ts';

interface TutorialProps {
  onPageChange: (page: Page) => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onPageChange }) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');

  const mainLogoUrl = "https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png";

  return (
    <div className="flex flex-col animate-fade-in px-6 pb-32">
      <header className="py-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onPageChange(Page.Dashboard)}
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-soft-white border border-slate-100 text-navy active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-navy uppercase italic tracking-tighter leading-none">TUTORIAL</h2>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">INSTALAÇÃO DO APP</p>
          </div>
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-soft-white border border-slate-100 p-2">
          <img src={mainLogoUrl} className="w-8 h-8 object-contain" />
        </div>
      </header>

      <main className="space-y-8">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 flex gap-2 shadow-soft-white">
          <button 
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${activeTab === 'android' ? 'bg-navy text-white shadow-elite' : 'text-slate-400'}`}
          >
            ANDROID / CHROME
          </button>
          <button 
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${activeTab === 'ios' ? 'bg-navy text-white shadow-elite' : 'text-slate-400'}`}
          >
            IPHONE / SAFARI
          </button>
        </div>

        {activeTab === 'android' ? (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-elite space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic text-xl shrink-0 shadow-glow-red">1</div>
                <div className="space-y-2">
                  <p className="text-lg font-black text-navy uppercase italic leading-none">ABRA NO CHROME</p>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed">Certifique-se de estar usando o navegador Google Chrome para a melhor experiência.</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic text-xl shrink-0 shadow-glow-red">2</div>
                <div className="space-y-2">
                  <p className="text-lg font-black text-navy uppercase italic leading-none">TOQUE NOS 3 PONTINHOS</p>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed">No canto superior direito do navegador, toque no ícone de menu (⋮).</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic text-xl shrink-0 shadow-glow-red">3</div>
                <div className="space-y-2">
                  <p className="text-lg font-black text-navy uppercase italic leading-none">INSTALAR APLICATIVO</p>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed">Procure a opção <span className="text-navy font-black">"Instalar aplicativo"</span> ou <span className="text-navy font-black">"Adicionar à tela inicial"</span>.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">Isso criará um ícone na sua tela inicial como se fosse um app da Play Store!</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-elite space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic text-xl shrink-0 shadow-glow-red">1</div>
                <div className="space-y-2">
                  <p className="text-lg font-black text-navy uppercase italic leading-none">USE O SAFARI</p>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed">No iPhone, a instalação só funciona corretamente através do navegador Safari.</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic text-xl shrink-0 shadow-glow-red">2</div>
                <div className="space-y-2">
                  <p className="text-lg font-black text-navy uppercase italic leading-none">TOQUE EM COMPARTILHAR</p>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed">Toque no ícone de compartilhar (quadrado com uma seta para cima) na barra inferior.</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic text-xl shrink-0 shadow-glow-red">3</div>
                <div className="space-y-2">
                  <p className="text-lg font-black text-navy uppercase italic leading-none">TELA DE INÍCIO</p>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed">Role a lista para baixo e toque em <span className="text-navy font-black">"Adicionar à Tela de Início"</span>.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">O ícone da Arena O&A aparecerá na sua tela inicial junto com seus outros apps!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="space-y-4">
          <h3 className="text-[11px] font-black text-navy uppercase tracking-[0.4em] px-2 italic">POR QUE INSTALAR?</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-soft-white space-y-3">
              <span className="material-symbols-outlined text-primary">notifications_active</span>
              <p className="text-[10px] font-black text-navy uppercase leading-tight">NOTIFICAÇÕES EM TEMPO REAL</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-soft-white space-y-3">
              <span className="material-symbols-outlined text-primary">bolt</span>
              <p className="text-[10px] font-black text-navy uppercase leading-tight">ACESSO MUITO MAIS RÁPIDO</p>
            </div>
          </div>
        </section>

        <button 
          onClick={() => onPageChange(Page.Dashboard)}
          className="w-full h-18 bg-navy text-white rounded-[2rem] font-black uppercase text-[12px] tracking-widest shadow-elite active:scale-95 transition-all"
        >
          ENTENDI, VOLTAR PARA ARENA
        </button>
      </main>
    </div>
  );
};

export default Tutorial;
