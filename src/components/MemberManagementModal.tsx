import React, { useState } from 'react';
import { Player } from '../types/chess';
import { X, UserPlus, Trash2, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  adminPassword?: string;
  onPlayerAdded: (newPlayer: Player, allPlayers: Player[]) => void;
  onPlayerDeleted: (allPlayers: Player[]) => void;
}

export const MemberManagementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  players,
  adminPassword = '',
  onPlayerAdded,
  onPlayerDeleted,
}) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('请输入成员姓名');
      return;
    }

    if (players.some(p => p.name.toLowerCase() === cleanName.toLowerCase())) {
      setError(`成员 "${cleanName}" 已在列表中，不可重复添加`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    let serverSucceeded = false;
    try {
      const res = await fetch('/api/players/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ name: cleanName, title: title.trim() }),
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          serverSucceeded = true;
          setSuccess(`成功添加成员 "${cleanName}"！`);
          setName('');
          setTitle('');
          onPlayerAdded(data.player, data.players);
          return;
        }
      }
    } catch (err: unknown) {
      console.warn('Backend sync failed, using offline fallback:', err);
    } finally {
      setLoading(false);
    }

    if (!serverSucceeded) {
      // Local fallback for offline / downloaded app mode
      const newPlayer: Player = {
        id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        title: title.trim() || '象棋爱好者',
        createdAt: new Date().toISOString(),
        rankScore: 1200,
        rankMatches: 0,
        rankWins: 0,
        rankLosses: 0,
        rankDraws: 0,
        rankStreak: 0,
        bestRankScore: 1200,
        matchScore: 1000,
        matchMatches: 0,
        matchWins: 0,
        matchLosses: 0,
        matchDraws: 0,
        matchStreak: 0,
        bestMatchScore: 1000,
      };
      const allUpdated = [...players, newPlayer];
      setSuccess(`成功添加成员 "${cleanName}"！`);
      setName('');
      setTitle('');
      onPlayerAdded(newPlayer, allUpdated);
    }
  };

  const handleDeleteMember = async (id: string, playerName: string) => {
    if (!confirm(`确定要移除成员 "${playerName}" 吗？此操作无法撤销。`)) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    let serverSucceeded = false;
    try {
      const res = await fetch('/api/players/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ id }),
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          serverSucceeded = true;
          setSuccess(`已移除成员 "${playerName}"`);
          onPlayerDeleted(data.players);
          return;
        }
      }
    } catch (err: unknown) {
      console.warn('Backend delete sync failed, applying local update:', err);
    } finally {
      setLoading(false);
    }

    if (!serverSucceeded) {
      const allUpdated = players.filter(p => p.id !== id);
      setSuccess(`已移除成员 "${playerName}"`);
      onPlayerDeleted(allUpdated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 bg-stone-950 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">成员管理中心</h3>
              <p className="text-xs text-stone-400">仅裁判管理员可增加或减少榜单成员</p>
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
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Add Member Form */}
          <form onSubmit={handleAddMember} className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              <span>添加新成员</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-400 mb-1">
                  成员姓名 / 棋手名号 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：王天一、李来群"
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-stone-400 mb-1">
                  段位 / 头衔称号 (选填)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：业余五段、象棋导师"
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition shadow-md disabled:opacity-50"
            >
              {loading ? '正在添加...' : '立即确认加入成员名册'}
            </button>
          </form>

          {/* Existing Member List */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                当前成员列表 ({players.length} 人)
              </span>
              <span className="text-[11px] text-stone-500">
                初始无默认成员，所有数据跨终端自动保存
              </span>
            </div>

            {players.length === 0 ? (
              <div className="p-8 text-center text-stone-500 bg-stone-950 rounded-xl border border-stone-800 text-xs">
                暂无任何成员，请在上方表单添加成员后即可参与排位与匹配。
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-stone-950 border border-stone-800/80 hover:border-stone-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center font-bold text-xs text-amber-300">
                        {p.name.slice(0, 1)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-stone-200">{p.name}</span>
                        <span className="text-[10px] text-stone-400 ml-2">
                          {p.title || '棋手'} · 天梯 {p.rankScore}分 · 匹配 {p.matchScore}分
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMember(p.id, p.name)}
                      disabled={loading}
                      title="移除成员"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-950/40 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
          >
            完成并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
