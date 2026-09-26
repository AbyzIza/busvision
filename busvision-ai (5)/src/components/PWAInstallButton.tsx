import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, CheckCircle, X, Share } from 'lucide-react';
import BusVisionLogo from './BusVisionLogo';

interface PWAInstallButtonProps {
  variant?: 'banner' | 'button' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'button',
  className = '' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If running directly as installed standalone PWA
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-emerald-900 leading-tight">Приложение установлено</p>
              <p className="text-[10px] text-emerald-700">Работает как нативное приложение</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-200/60 px-2 py-0.5 rounded-full">
            PWA
          </span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  // Render modal with Android / iOS instructions if native dialog isn't supported directly
  const renderInstructionsModal = () => (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl border border-slate-100 relative">
        <button 
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-95"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#084C6F]/10 flex items-center justify-center p-2.5 border border-[#084C6F]/20">
            <BusVisionLogo className="w-full h-full" color="#084C6F" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#2D3142]">Установка BusVision</h3>
            <p className="text-xs text-slate-400">На рабочий стол смартфона</p>
          </div>
        </div>

        {isIOS ? (
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 mb-5 border border-slate-100">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
              <span>Нажмите кнопку <strong className="text-slate-800">«Поделиться»</strong> <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" /> в нижней панели Safari.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
              <span>Пролистайте вниз и выберите <strong className="text-slate-800">«На экран Домой»</strong>.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
              <span>Нажмите <strong className="text-slate-800">«Добавить»</strong> в правом верхнем углу.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 mb-5 border border-slate-100">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#084C6F] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
              <span>В меню браузера Chrome нажмите на три точки <strong className="text-slate-800">(⋮)</strong> справа вверху.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#084C6F] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
              <span>Выберите пункт <strong className="text-slate-800">«Установить приложение»</strong> или <strong className="text-slate-800">«Добавить на главный экран»</strong>.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#084C6F] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
              <span>Приложение будет установлено и появится в списке ваших приложений Android с собственной иконкой.</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="w-full py-3 rounded-xl bg-[#084C6F] text-white font-semibold text-xs transition-transform active:scale-95 shadow-md shadow-[#084C6F]/20 cursor-pointer"
        >
          Понятно
        </button>
      </div>
    </div>
  );

  if (variant === 'banner') {
    if (isDismissed) return null;
    return (
      <>
        <div className={`bg-gradient-to-r from-[#084C6F] to-[#0A6390] text-white p-3.5 rounded-2xl shadow-lg shadow-[#084C6F]/20 flex items-center justify-between gap-3 relative ${className}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
              <Smartphone className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Установить как приложение</p>
              <p className="text-[10px] text-white/80 truncate">Быстрый доступ на Android без браузера</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-white text-[#084C6F] text-xs font-bold shadow-xs hover:bg-white/90 active:scale-95 transition cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Установить</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="w-7 h-7 rounded-lg text-white/60 hover:text-white flex items-center justify-center"
              aria-label="Закрыть баннер"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {showModal && renderInstructionsModal()}
      </>
    );
  }

  if (variant === 'card') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between p-4 rounded-2xl bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-blue-200 transition text-left cursor-pointer active:scale-[0.99] ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#084C6F] flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2D3142]">Установить на смартфон</p>
              <p className="text-[11px] text-gray-400">Полноэкранный режим Android / iOS</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#084C6F] text-white text-xs font-semibold shadow-xs">
            <Download className="w-3.5 h-3.5" />
            <span>Установить</span>
          </span>
        </button>
        {showModal && renderInstructionsModal()}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#084C6F] text-white text-xs font-semibold shadow-sm hover:bg-[#073D59] active:scale-95 transition cursor-pointer ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Установить</span>
      </button>
      {showModal && renderInstructionsModal()}
    </>
  );
};
