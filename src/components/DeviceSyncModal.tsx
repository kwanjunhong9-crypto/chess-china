import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, QrCode, Smartphone, Tablet, Monitor, RefreshCw, Radio, Sparkles, RotateCcw } from 'lucide-react';
import { Player } from '../types/chess';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onlineDevices: number;
  lastUpdated?: string;
  playersCount: number;
  onForceRefresh: () => void;
  onRestoreBaseline: () => void;
}

export const DeviceSyncModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onlineDevices,
  lastUpdated,
  playersCount,
  onForceRefresh,
  onRestoreBaseline,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      setCurrentUrl(url);

      QRCode.toDataURL(url, {
        width: 220,
        margin: 1.5,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      // Fallback
      const input = document.createElement('input');
      input.value = currentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString()
    : '刚刚';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-100">
                  全球公网访问与平板跨设备同步
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                  实时同步中
                </span>
              </div>
              <p className="text-xs text-stone-400">
                支持手机、iPad平板、电脑多端同步查看与对弈
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Live Sync Status Bar */}
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="text-xs font-bold text-stone-200 flex items-center gap-2">
                  <span>实时推送通道活跃 (SSE长连接)</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  已同步成员：<strong className="text-amber-400 font-bold">{playersCount}</strong> 位 · 最近同步：{formattedTime}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-stone-300 text-xs bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800">
              <Monitor className="w-3.5 h-3.5 text-stone-400" />
              <Tablet className="w-3.5 h-3.5 text-amber-400" />
              <Smartphone className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-bold text-amber-300 ml-1">{onlineDevices} 台在线</span>
            </div>
          </div>

          {/* QR Code and Mobile / Tablet Access */}
          <div className="p-4 rounded-xl bg-stone-950 border border-amber-500/30 flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white p-2.5 rounded-xl shadow-lg shrink-0">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="跨设备同步二维码" className="w-36 h-36" />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-stone-400 text-xs">
                  生成二维码中...
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-400 font-bold text-xs">
                <QrCode className="w-4 h-4" />
                <span>平板专属连接：用相机扫一扫</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                拿起你的 <strong>iPad / 平板</strong> 或手机，直接打开系统相机或扫一扫扫描左侧二维码，即可瞬间进入同步页面！
              </p>
              <div className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg font-medium inline-block">
                ✓ 电脑管理员修改积分，平板屏幕秒级自动更新！
              </div>
            </div>
          </div>

          {/* Copyable Web Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 block">
              平板浏览器直接访问公网链接 (复制后发送到平板)：
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono select-all focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition shadow-md ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '已复制！发给平板' : '复制链接'}</span>
              </button>
            </div>
          </div>

          {/* Solution for: "我的平板都不一样 / 排名重新开始" */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/30 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>如果平板上分数显示为 0 或成员不一致？</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              这是因为平板浏览器可能缓存了空数据，或者在非实时域名下打开。点击下方按钮，将把官方天梯榜（<strong>KWANJUNHONG 1460分、JEANOOI 1260分、RUICHEN 1250分</strong>）强制广播同步至你的平板！
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={onRestoreBaseline}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>一键恢复官方天梯积分榜 (1460/1260/1250)</span>
              </button>

              <button
                onClick={onForceRefresh}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition border border-stone-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>立即重新拉取同步数据</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
