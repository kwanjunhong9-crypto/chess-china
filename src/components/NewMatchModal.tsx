import React, { useState } from 'react';
import { Player } from '../types/chess';
import { X, Swords, Flame, AlertCircle, Play, UserCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onStartMatch: (redName: string, blackName: string, mode: 'ranked' | 'match') => void;
  defaultMode?: 'ranked' | 'match';
}

export const NewMatchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  players,
  onStartMatch,
  defaultMode = 'ranked',
}) => {
  const [mode, setMode] = useState<'ranked' | 'match'>(defaultMode);
  const [redName, setRedName] = useState('');
  const [blackName, setBlackName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const redTrimmed = redName.trim();
    const blackTrimmed = blackName.trim();

    if (!redTrimmed) {
      setError('请输入红方选手的姓名！');
      return;
    }
    if (!blackTrimmed) {
      setError('请输入黑方选手的姓名！');
      return;
    }

    // Exact or case-insensitive check in members
    const redExists = players.some(p => p.name.toLowerCase() === redTrimmed.toLowerCase());
    const blackExists = players.some(p => p.name.toLowerCase() === blackTrimmed.toLowerCase());

    if (!redExists) {
      setError(`没有这个人：红方选手「${redTrimmed}」不在成员积分榜中，请先在成员管理中添加！`);
      return;
    }

    if (!blackExists) {
      setError(`没有这个人：黑方选手「${blackTrimmed}」不在成员积分榜中，请先在成员管理中添加！`);
      return;
    }

    if (redTrimmed.toLowerCase() === blackTrimmed.toLowerCase()) {
      setError('红方与黑方不能是同一个人！请选择两位不同的棋手。');
      return;
    }

    onStartMatch(redTrimmed, blackTrimmed, mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 bg-stone-950 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">发起象棋对弈</h3>
              <p className="text-xs text-stone-400">仅裁判管理员可开启排位与匹配赛局</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5 shadow">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              选择对弈赛制
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('ranked')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  mode === 'ranked'
                    ? 'bg-amber-600/25 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <Flame className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-xs">排位天梯赛</span>
                <span className="text-[10px] text-stone-400">影响官方天梯段位积分</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('match')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  mode === 'match'
                    ? 'bg-amber-600/25 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <Swords className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-xs">休闲匹配赛</span>
                <span className="text-[10px] text-stone-400">友谊切磋与日常匹配分</span>
              </button>
            </div>
          </div>

          {/* Red Player Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-red-400 flex items-center gap-1">
                <span>🔴 红方执先 (先行者)</span>
                <span className="text-red-500">*</span>
              </label>
              {players.length > 0 && (
                <span className="text-[10px] text-stone-500">可在下方快捷选择</span>
              )}
            </div>

            <input
              type="text"
              value={redName}
              onChange={(e) => setRedName(e.target.value)}
              placeholder="输入红方成员姓名..."
              list="player-suggestions-red"
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-red-500 transition"
              required
            />
            <datalist id="player-suggestions-red">
              {players.map(p => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>

            {/* Quick Chips */}
            {players.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-16 overflow-y-auto">
                {players.slice(0, 6).map(p => (
                  <button
                    key={`red-chip-${p.id}`}
                    type="button"
                    onClick={() => setRedName(p.name)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Black Player Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1">
                <span>⚫ 黑方执后 (后手迎战)</span>
                <span className="text-red-500">*</span>
              </label>
            </div>

            <input
              type="text"
              value={blackName}
              onChange={(e) => setBlackName(e.target.value)}
              placeholder="输入黑方成员姓名..."
              list="player-suggestions-black"
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-stone-400 transition"
              required
            />
            <datalist id="player-suggestions-black">
              {players.map(p => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>

            {/* Quick Chips */}
            {players.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-16 overflow-y-auto">
                {players.slice(0, 6).map(p => (
                  <button
                    key={`black-chip-${p.id}`}
                    type="button"
                    onClick={() => setBlackName(p.name)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-sm transition shadow-lg flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>开启棋局并进入裁判控制</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
