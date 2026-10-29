import React, { useState } from 'react';
import { X, Smartphone, Apple, Terminal, Copy, Check, Download, Layers, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NativeAppModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'pwa'>('ios');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const capacitorConfig = `{
  "appId": "com.huaxia.xiangqi",
  "appName": "华夏象棋",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 1500,
      "backgroundColor": "#181512"
    }
  }
}`;

  const iosCommands = `# 1. 安装 Capacitor 原生打包核心
npm install @capacitor/core @capacitor/cli @capacitor/ios

# 2. 初始化与构建 Web 资源
npm run build
npx cap init "华夏象棋" "com.huaxia.xiangqi" --web-dir=dist
npx cap add ios

# 3. 同步最新资源到 iOS 工程并在 Xcode 中运行
npx cap sync ios
npx cap open ios`;

  const androidCommands = `# 1. 安装 Capacitor Android 运行环境
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. 初始化与构建 Web 资源
npm run build
npx cap init "华夏象棋" "com.huaxia.xiangqi" --web-dir=dist
npx cap add android

# 3. 同步最新代码并在 Android Studio 生成正式 APK / AAB
npx cap sync android
npx cap open android`;

  const handleDownloadConfig = () => {
    const blob = new Blob([capacitorConfig], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'capacitor.config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl overflow-hidden flex flex-col text-stone-100">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 bg-stone-950 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-400/40 flex items-center justify-center text-amber-200">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <span>全平台应用与原生端一键打包部署中心</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  iOS / Android / PWA
                </span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                完美自适应 iPhone、iPad、Surface Duo、折叠屏、桌面全平台
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('ios')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'ios'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>原生 iOS (iPhone & iPad)</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'android'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>原生 Android (APK / Google Play)</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'pwa'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>PWA 即时免安装 App</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>iOS 原生 Xcode 项目一键生成终端指令</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(iosCommands, 'ios')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] transition"
                  >
                    {copiedCode === 'ios' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === 'ios' ? '已复制指令' : '复制命令'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-stone-900 font-mono text-[11px] text-stone-300 overflow-x-auto">
                  {iosCommands}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1.5 text-stone-300">
                <span className="font-bold text-stone-200">iOS 适配特性：</span>
                <p>• 全面支持 iPhone 刘海屏、灵动岛安全区（Safe-Area Insets）自适应。</p>
                <p>• 针对 iPad 平板与 Surface Duo 双屏提供左侧棋盘、右侧着法与AI分析的双栏分屏大视界。</p>
                <p>• 内置 180x180 高清 Apple-Touch-Icon，主屏幕图标细腻无锯齿。</p>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Android Studio 原生 APK 一键生成指令</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(androidCommands, 'android')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] transition"
                  >
                    {copiedCode === 'android' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === 'android' ? '已复制指令' : '复制命令'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-stone-900 font-mono text-[11px] text-stone-300 overflow-x-auto">
                  {androidCommands}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1.5 text-stone-300">
                <span className="font-bold text-stone-200">Android 原生部署亮点：</span>
                <p>• 提供完整的 512x512 掩码图标（Maskable Icon），完美契合各种 Android 桌面启动器异形裁剪。</p>
                <p>• 原生硬件加速，棋子拖拽与落子动画丝滑 120Hz 高刷新率。</p>
                <p>• 运行即可一键生成 Release 签名的 APK 或 Google Play AAB 商店安装包。</p>
              </div>
            </div>
          )}

          {activeTab === 'pwa' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <span className="font-bold text-amber-400 text-sm">浏览器直接下载成 App (PWA)</span>
                <p className="text-stone-300">
                  无需通过 App Store 或应用商店审核，任何手机、平板和电脑浏览器均可直接将网站安装为独立应用窗口，拥有原生应用的离线缓存、独立图标与沉浸式体验。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                    <strong className="text-amber-300 block mb-1">Android / Chrome / Edge</strong>
                    <span className="text-stone-400">点击导航栏“下载成App”按钮，或地址栏右侧安装图标，即可立即创建桌面应用。</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                    <strong className="text-amber-300 block mb-1">iPhone / iPad Safari</strong>
                    <span className="text-stone-400">点击 Safari 底部“分享”图标，向下滑动选择“添加到主屏幕”即可全屏使用。</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Capacitor Config Download Card */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/30 flex justify-between items-center">
            <div>
              <span className="font-bold text-amber-300 block">原生打包配置文件 capacitor.config.json</span>
              <span className="text-stone-400 text-[11px]">已配置应用包名 com.huaxia.xiangqi 与开屏主题</span>
            </div>
            <button
              onClick={handleDownloadConfig}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载配置文件</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
