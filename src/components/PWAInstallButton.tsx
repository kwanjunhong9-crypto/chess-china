import React, { useState } from 'react';
import { Download, Share2, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface Props {
  onOpenNativeModal?: () => void;
}

export const PWAInstallButton: React.FC<Props> = ({ onOpenNativeModal }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, offer native app / info modal
  if (isInstalled) {
    return (
      <button
        onClick={onOpenNativeModal}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-amber-300 text-xs font-medium border border-amber-500/30 transition shadow-sm"
        title="已安装为应用，点击查看移动端打包部署支持"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>原生应用中心</span>
      </button>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-medium shadow-md shadow-amber-900/40 transition active:scale-95"
      >
        <Download className="w-3.5 h-3.5" />
        <span>下载成App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-medium border border-amber-500/30 transition"
        >
          <Share2 className="w-3.5 h-3.5 text-amber-400" />
          <span>添加到主屏幕</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-stone-900 border border-amber-600/30 p-6 shadow-2xl text-stone-100">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-base font-bold text-amber-200">在 iPhone / iPad 上安装</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-stone-300">
                <div className="flex items-start gap-3 bg-stone-800/60 p-3 rounded-xl border border-stone-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-600/30 text-amber-300 font-bold text-xs flex items-center justify-center">1</span>
                  <span>点击 Safari 底部栏的 <strong>分享图标</strong> (方形带向上箭头)。</span>
                </div>
                <div className="flex items-start gap-3 bg-stone-800/60 p-3 rounded-xl border border-stone-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-600/30 text-amber-300 font-bold text-xs flex items-center justify-center">2</span>
                  <span>向下滑动并选择 <strong>“添加到主屏幕” (Add to Home Screen)</strong>。</span>
                </div>
                <div className="flex items-start gap-3 bg-stone-800/60 p-3 rounded-xl border border-stone-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-600/30 text-amber-300 font-bold text-xs flex items-center justify-center">3</span>
                  <span>点击右上角 <strong>“添加”</strong>，即可像原生应用一样全屏畅玩！</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm transition"
              >
                我知道了
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers that don't support beforeinstallprompt
  return (
    <button
      onClick={onOpenNativeModal}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-amber-300 text-xs font-medium border border-stone-700 transition"
      title="下载或打包成手机App"
    >
      <Download className="w-3.5 h-3.5 text-amber-400" />
      <span>下载/打包App</span>
    </button>
  );
};
