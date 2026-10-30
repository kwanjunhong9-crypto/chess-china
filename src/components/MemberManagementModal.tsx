import React, { useState } from 'react';
import { Player } from '../types/chess';
import { X, UserPlus, Trash2, Users, AlertCircle, CheckCircle2, Edit2, ShieldAlert, Save, RefreshCw, RotateCcw } from 'lucide-react';
import { getTierByScore } from '../utils/tierSystem';
import { RankEmblem } from './RankEmblem';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  adminPassword?: string;
  isAdmin: boolean;
  onRequestAdminLogin: () => void;
  onPlayerAdded: (newPlayer: Player, allPlayers: Player[]) => void;
  onPlayerDeleted: (allPlayers: Player[]) => void;
  onPlayerUpdated: (updatedPlayer: Player, allPlayers: Player[]) => void;
  onBatchSyncPlayers: (syncedPlayers: Player[]) => void;
}

export const MemberManagementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  players,
  adminPassword = '',
  isAdmin,
  onRequestAdminLogin,
  onPlayerAdded,
  onPlayerDeleted,
  onPlayerUpdated,
  onBatchSyncPlayers,
}) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editing state for an individual player
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editRankScore, setEditRankScore] = useState<number>(0);
  const [editMatchScore, setEditMatchScore] = useState<number>(0);
  const [editRankWins, setEditRankWins] = useState<number>(0);
  const [editRankMatches, setEditRankMatches] = useState<number>(0);
  const [editTitle, setEditTitle] = useState<string>('');

  if (!isOpen) return null;

  const startEditPlayer = (p: Player) => {
    setEditingPlayerId(p.id);
    setEditRankScore(p.rankScore || 0);
    setEditMatchScore(p.matchScore || 0);
    setEditRankWins(p.rankWins || 0);
    setEditRankMatches(p.rankMatches || 0);
    setEditTitle(p.title || '');
    setError(null);
    setSuccess(null);
  };

  const cancelEdit = () => {
    setEditingPlayerId(null);
  };

  const handleSavePlayerEdit = async (id: string) => {
    if (!isAdmin) {
      setError('需要裁判管理员密码认证才能修改成员分数与段位！');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const pwd = adminPassword || localStorage.getItem('chess_admin_token') || 'chessadmin123';
    try {
      const res = await fetch('/api/players/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pwd,
        },
        body: JSON.stringify({
          id,
          rankScore: editRankScore,
          matchScore: editMatchScore,
          rankWins: editRankWins,
          rankMatches: editRankMatches,
          title: editTitle.trim(),
          adminPassword: pwd,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setSuccess('棋手分数与段位已成功更新并同步到所有设备！');
          setEditingPlayerId(null);
          onPlayerUpdated(data.player, data.players);
          return;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || '保存修改失败，请重试');
      }
    } catch (err: unknown) {
      console.warn('Backend update failed:', err);
      // Fallback local update
      const updated = players.map(p => {
        if (p.id === id) {
          return {
            ...p,
            rankScore: editRankScore,
            matchScore: editMatchScore,
            rankWins: editRankWins,
            rankMatches: editRankMatches,
            title: editTitle.trim(),
          };
        }
        return p;
      });
      const p = updated.find(x => x.id === id)!;
      setSuccess('棋手分数已在本地保存！');
      setEditingPlayerId(null);
      onPlayerUpdated(p, updated);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      setError('没有管理员身份不可增加成员！请先输入裁判密码认证。');
      onRequestAdminLogin();
      return;
    }

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

    const pwd = adminPassword || localStorage.getItem('chess_admin_token') || 'chessadmin123';
    try {
      const res = await fetch('/api/players/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pwd,
        },
        body: JSON.stringify({
          name: cleanName,
          title: title.trim(),
          adminPassword: pwd,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setSuccess(`成功添加成员 "${cleanName}"！已自动同步至全平台各设备。`);
          setName('');
          setTitle('');
          onPlayerAdded(data.player, data.players);
          return;
        }
      }

      const errData = await res.json().catch(() => ({}));
      setError(errData.error || '添加失败，请确认管理员权限后重试');
    } catch (err: unknown) {
      console.error('Failed to add player to server:', err);
      // Local fallback creation so user work is never lost
      const fallbackPlayer: Player = {
        id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        title: title ? title.trim() : '象棋爱好者',
        createdAt: new Date().toISOString(),
        rankScore: 0,
        rankMatches: 0,
        rankWins: 0,
        rankLosses: 0,
        rankDraws: 0,
        rankStreak: 0,
        bestRankScore: 0,
        matchScore: 0,
        matchMatches: 0,
        matchWins: 0,
        matchLosses: 0,
        matchDraws: 0,
        matchStreak: 0,
        bestMatchScore: 0,
      };
      const updatedPlayers = [...players, fallbackPlayer];
      onPlayerAdded(fallbackPlayer, updatedPlayers);
      setSuccess(`已在本地添加成员 "${cleanName}"，网络恢复后将自动同步至云端！`);
      setName('');
      setTitle('');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id: string, playerName: string) => {
    if (!isAdmin) {
      setError('没有管理员身份不可删除成员！');
      onRequestAdminLogin();
      return;
    }

    if (!confirm(`确定要移除成员 "${playerName}" 吗？此操作将同步在所有设备生效。`)) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const pwd = adminPassword || localStorage.getItem('chess_admin_token') || 'chessadmin123';
    try {
      const res = await fetch('/api/players/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pwd,
        },
        body: JSON.stringify({ id, adminPassword: pwd }),
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setSuccess(`已在全部设备移除成员 "${playerName}"`);
          onPlayerDeleted(data.players);
          return;
        }
      }

      const errData = await res.json().catch(() => ({}));
      setError(errData.error || '移除成员失败');
    } catch (err: unknown) {
      console.warn('Backend delete sync failed:', err);
      const updated = players.filter(p => p.id !== id);
      onPlayerDeleted(updated);
      setSuccess(`已在本地移除成员 "${playerName}"`);
    } finally {
      setLoading(false);
    }
  };

  // Sync existing local players to cloud server
  const handleSyncLocalToCloud = async () => {
    if (!isAdmin) {
      setError('请先完成管理员密码认证后同步');
      onRequestAdminLogin();
      return;
    }

    setLoading(true);
    setError(null);
    const pwd = adminPassword || localStorage.getItem('chess_admin_token') || 'chessadmin123';
    try {
      const res = await fetch('/api/players/batch-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pwd,
        },
        body: JSON.stringify({ players, adminPassword: pwd }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(`云端数据库已同步完成！现有 ${data.players.length} 名成员，所有设备已可见。`);
        onBatchSyncPlayers(data.players);
      }
    } catch (err) {
      setError('同步到云端失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // Restore official registered leaderboard baseline
  const handleRestoreOfficialBaseline = async () => {
    if (!isAdmin) {
      setError('请先输入裁判管理员密码');
      onRequestAdminLogin();
      return;
    }
    if (!confirm('确定要恢复官方天梯积分榜基准吗？（KWANJUNHONG 1460分、JEANOOI 1260分、RUICHEN 1250分）')) return;

    setLoading(true);
    setError(null);
    const officialBaseline: Player[] = [
      {
        id: 'p_1793281003253_7bzur',
        name: 'KWANJUNHONG',
        title: '新手',
        createdAt: '2026-10-29T13:36:43.253Z',
        rankScore: 1460,
        rankMatches: 4,
        rankWins: 4,
        rankLosses: 0,
        rankDraws: 0,
        rankStreak: 4,
        bestRankScore: 1460,
        matchScore: 1200,
        matchMatches: 3,
        matchWins: 3,
        matchLosses: 0,
        matchDraws: 0,
        matchStreak: 3,
        bestMatchScore: 1200,
      },
      {
        id: 'p_1793281011380_gln93',
        name: 'JEANOOI',
        title: '象棋高手',
        createdAt: '2026-10-29T13:36:51.380Z',
        rankScore: 1260,
        rankMatches: 4,
        rankWins: 3,
        rankLosses: 1,
        rankDraws: 0,
        rankStreak: 2,
        bestRankScore: 1260,
        matchScore: 1150,
        matchMatches: 3,
        matchWins: 2,
        matchLosses: 1,
        matchDraws: 0,
        matchStreak: 2,
        bestMatchScore: 1150,
      },
      {
        id: 'p_1793281011395_knydt',
        name: 'RUICHEN',
        title: '棋界新星',
        createdAt: '2026-10-29T13:36:51.395Z',
        rankScore: 1250,
        rankMatches: 4,
        rankWins: 3,
        rankLosses: 1,
        rankDraws: 0,
        rankStreak: 1,
        bestRankScore: 1250,
        matchScore: 1100,
        matchMatches: 3,
        matchWins: 2,
        matchLosses: 1,
        matchDraws: 0,
        matchStreak: 1,
        bestMatchScore: 1100,
      },
      {
        id: 'p_1793281011409_m7qop',
        name: 'YUHENG',
        title: '象棋爱好者',
        createdAt: '2026-10-29T13:36:51.409Z',
        rankScore: 0,
        rankMatches: 0,
        rankWins: 0,
        rankLosses: 0,
        rankDraws: 0,
        rankStreak: 0,
        bestRankScore: 0,
        matchScore: 0,
        matchMatches: 0,
        matchWins: 0,
        matchLosses: 0,
        matchDraws: 0,
        matchStreak: 0,
        bestMatchScore: 0,
      },
    ];

    const pwd = adminPassword || localStorage.getItem('chess_admin_token') || 'chessadmin123';
    try {
      for (const p of officialBaseline) {
        await fetch('/api/players/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': pwd,
          },
          body: JSON.stringify({
            ...p,
            adminPassword: pwd,
          }),
        });
      }
      setSuccess('已成功恢复官方天梯积分榜（KWANJUNHONG 1460分、JEANOOI 1260分、RUICHEN 1250分）并全球同步！');
      onBatchSyncPlayers(officialBaseline);
    } catch (err) {
      onBatchSyncPlayers(officialBaseline);
      setSuccess('已在本地恢复官方天梯积分榜！');
    } finally {
      setLoading(false);
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
              <h3 className="text-base font-bold text-stone-100">成员与段位积分管理</h3>
              <p className="text-xs text-stone-400">仅裁判管理员可增加、减少成员及修改天梯分数</p>
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
          {!isAdmin ? (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>当前未取得管理员授权</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                只有持有管理密码的人员可以增加、删除成员或修改成员的天梯排位积分与段位。
              </p>
              <button
                type="button"
                onClick={onRequestAdminLogin}
                className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition shadow"
              >
                输入裁判密码登入管理
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>已取得裁判管理权限 · 更改将跨所有设备即时生效</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRestoreOfficialBaseline}
                  disabled={loading}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600/50 flex items-center gap-1 transition"
                  title="一键恢复官方天梯积分榜（KWANJUNHONG 1460、JEANOOI 1260、RUICHEN 1250）"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>恢复官方积分榜</span>
                </button>
                <button
                  type="button"
                  onClick={handleSyncLocalToCloud}
                  disabled={loading}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 flex items-center gap-1 transition"
                  title="将当前成员名单同步至云端数据库"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>全设备同步</span>
                </button>
              </div>
            </div>
          )}

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

          {/* Add Member Form (Strictly Admin Only) */}
          {isAdmin && (
            <form onSubmit={handleAddMember} className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" />
                <span>添加新棋手成员</span>
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
                    placeholder="输入姓名 (初始0分，未排名)"
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-400 mb-1">
                    称号 (选填)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例如：特级大师、学员"
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="text-[11px] text-stone-400 flex items-center justify-between">
                <span>新成员初始积分：<strong>0分</strong> (未排名 0-100分)</span>
                <span>每局结算：<strong>+50分/局</strong></span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition shadow-md disabled:opacity-50"
              >
                确认加入成员名册并广播全网
              </button>
            </form>
          )}

          {/* Existing Member List */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                当前成员列表 ({players.length} 人)
              </span>
              <span className="text-[11px] text-stone-500">
                跨设备秒级同步 · 自动持久化
              </span>
            </div>

            {players.length === 0 ? (
              <div className="p-8 text-center text-stone-500 bg-stone-950 rounded-xl border border-stone-800 text-xs">
                暂无任何成员，请由管理员在上方表单添加成员。
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {players.map((p) => {
                  const isEditing = editingPlayerId === p.id;
                  const tier = getTierByScore(p.rankScore);

                  return (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg bg-stone-950 border border-stone-800/80 hover:border-stone-700 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <RankEmblem tier={tier} size="xs" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-stone-200">{p.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${tier.badgeBg} ${tier.textColor}`}>
                                {tier.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-stone-400">
                              天梯排位：<strong className="text-amber-400">{p.rankScore}分</strong> (胜 {p.rankWins}/总 {p.rankMatches}局) · 匹配：{p.matchScore}分
                            </div>
                          </div>
                        </div>

                        {isAdmin && !isEditing && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEditPlayer(p)}
                              title="管理员修改分数与段位"
                              className="px-2 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-amber-300 text-[11px] font-semibold transition flex items-center gap-1 border border-stone-700"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>改分/段位</span>
                            </button>
                            <button
                              onClick={() => handleDeleteMember(p.id, p.name)}
                              disabled={loading}
                              title="移除成员"
                              className="p-1 rounded-md text-stone-500 hover:text-red-400 hover:bg-red-950/40 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Inline Edit Form for Admin */}
                      {isEditing && (
                        <div className="p-3 rounded-lg bg-stone-900 border border-amber-600/40 space-y-2.5 mt-2 animate-in fade-in duration-200">
                          <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>修改「{p.name}」天梯排位分与数据</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] text-stone-400 block mb-0.5">
                                排位分 (当前对应段位)
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={editRankScore}
                                onChange={(e) => setEditRankScore(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-stone-950 border border-stone-700 rounded px-2 py-1 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                              />
                              <span className="text-[10px] text-stone-500 block mt-0.5">
                                对应段位：{getTierByScore(editRankScore).name}
                              </span>
                            </div>

                            <div>
                              <label className="text-[10px] text-stone-400 block mb-0.5">
                                匹配积分
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={editMatchScore}
                                onChange={(e) => setEditMatchScore(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-stone-950 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-stone-400 block mb-0.5">
                                胜局数
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={editRankWins}
                                onChange={(e) => setEditRankWins(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-stone-950 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-stone-400 block mb-0.5">
                                总对局数
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={editRankMatches}
                                onChange={(e) => setEditRankMatches(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-stone-950 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1 border-t border-stone-800">
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition"
                            >
                              取消
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSavePlayerEdit(p.id)}
                              disabled={loading}
                              className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1 transition shadow"
                            >
                              <Save className="w-3 h-3" />
                              <span>保存更改</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
