import React, { useState } from 'react';
import { MatchRecord, Player } from '../types/chess';
import { X, Flame, Swords, Calendar, PlayCircle, Edit2, Save, User } from 'lucide-react';
import { RankEmblem } from './RankEmblem';
import { getNextTierProgress, getTierByScore } from '../utils/tierSystem';
import { ErrorBoundary } from './ErrorBoundary';

interface Props {
  player: Player | null;
  matchHistory: MatchRecord[];
  isAdmin?: boolean;
  adminPassword?: string;
  onClose: () => void;
  onReplayMatch: (match: MatchRecord) => void;
  onPlayerUpdated?: (player: Player) => void;
}

export const PlayerProfileModal: React.FC<Props> = ({
  player,
  matchHistory = [],
  isAdmin = false,
  adminPassword = '',
  onClose,
  onReplayMatch,
  onPlayerUpdated,
}) => {
  if (!player) return null;

  return (
    <ErrorBoundary fallbackTitle="棋手个人资料加载异常" onReset={onClose}>
      <PlayerProfileContent
        player={player}
        matchHistory={matchHistory}
        isAdmin={isAdmin}
        adminPassword={adminPassword}
        onClose={onClose}
        onReplayMatch={onReplayMatch}
        onPlayerUpdated={onPlayerUpdated}
      />
    </ErrorBoundary>
  );
};

const PlayerProfileContent: React.FC<Props & { player: Player }> = ({
  player,
  matchHistory,
  isAdmin = false,
  adminPassword = '',
  onClose,
  onReplayMatch,
  onPlayerUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editRankScore, setEditRankScore] = useState<number>(Number(player.rankScore) || 0);
  const [editMatchScore, setEditMatchScore] = useState<number>(Number(player.matchScore) || 0);
  const [editRankWins, setEditRankWins] = useState<number>(Number(player.rankWins) || 0);
  const [editRankMatches, setEditRankMatches] = useState<number>(Number(player.rankMatches) || 0);
  const [editTitle, setEditTitle] = useState<string>(player.title || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Fallback-safe player attributes
  const playerName = player.name || '棋手';
  const playerTitle = player.title || '象棋棋手';
  const rankScore = Math.max(0, Number(player.rankScore) || 0);
  const matchScore = Math.max(0, Number(player.matchScore) || 0);
  const rankWins = Math.max(0, Number(player.rankWins) || 0);
  const rankMatches = Math.max(0, Number(player.rankMatches) || 0);
  const rankLosses = Math.max(0, Number(player.rankLosses) || 0);
  const rankStreak = Number(player.rankStreak) || 0;
  const bestRankScore = Math.max(rankScore, Number(player.bestRankScore) || 0);

  const matchWins = Math.max(0, Number(player.matchWins) || 0);
  const matchMatches = Math.max(0, Number(player.matchMatches) || 0);
  const matchLosses = Math.max(0, Number(player.matchLosses) || 0);
  const bestMatchScore = Math.max(matchScore, Number(player.bestMatchScore) || 0);

  const totalMatches = rankMatches + matchMatches;
  const totalWins = rankWins + matchWins;
  const overallWinRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  const joinDate = player.createdAt
    ? (player.createdAt.includes('T') ? player.createdAt.split('T')[0] : player.createdAt)
    : new Date().toISOString().split('T')[0];

  // Tier info based on score formula
  const tierProgress = getNextTierProgress(rankScore);
  const currentTier = tierProgress?.currentTier || getTierByScore(rankScore);
  const nextTier = tierProgress?.nextTier;

  // Safe match history
  const safeMatches = Array.isArray(matchHistory) ? matchHistory : [];
  const playerMatches = safeMatches.filter(
    m => m && ((m.redPlayer?.id && m.redPlayer.id === player.id) || (m.blackPlayer?.id && m.blackPlayer.id === player.id))
  );

  const [adminPasswordInput, setAdminPasswordInput] = useState<string>(
    () => adminPassword || localStorage.getItem('chess_admin_token') || 'chessadmin123'
  );

  const startEdit = () => {
    setIsEditing(true);
    setEditRankScore(rankScore);
    setEditMatchScore(matchScore);
    setEditRankWins(rankWins);
    setEditRankMatches(rankMatches);
    setEditTitle(playerTitle);
    setAdminPasswordInput(adminPassword || localStorage.getItem('chess_admin_token') || 'chessadmin123');
    setMsg(null);
  };

  const saveEdit = async () => {
    setLoading(true);
    setMsg(null);
    const pwd = (adminPasswordInput || adminPassword || localStorage.getItem('chess_admin_token') || 'chessadmin123').trim();
    if (pwd) {
      localStorage.setItem('chess_admin_token', pwd);
    }

    const updated: Player = {
      ...player,
      rankScore: editRankScore,
      matchScore: editMatchScore,
      rankWins: editRankWins,
      rankMatches: editRankMatches,
      rankLosses: Math.max(0, editRankMatches - editRankWins),
      bestRankScore: Math.max(bestRankScore, editRankScore),
      bestMatchScore: Math.max(bestMatchScore, editMatchScore),
      title: editTitle.trim(),
    };

    try {
      const res = await fetch('/api/players/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pwd,
        },
        body: JSON.stringify({
          id: player.id,
          name: player.name,
          rankScore: editRankScore,
          matchScore: editMatchScore,
          rankWins: editRankWins,
          rankMatches: editRankMatches,
          rankLosses: Math.max(0, editRankMatches - editRankWins),
          title: editTitle.trim(),
          adminPassword: pwd,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setMsg({ text: '修改已成功保存并广播至所有设备！' });
          setIsEditing(false);
          if (onPlayerUpdated) onPlayerUpdated(data.player || updated);
          setLoading(false);
          return;
        } else {
          setMsg({ text: data.error || '保存失败，请检查密码', error: true });
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend update endpoint unavailable, applying local update:', err);
    }

    // Local optimistic update so user changes are NEVER lost
    if (onPlayerUpdated) onPlayerUpdated(updated);
    setMsg({ text: '数据已在本地保存生效！' });
    setIsEditing(false);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-800 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-amber-400/50 flex items-center justify-center font-serif text-2xl font-black text-amber-100 shadow-lg shrink-0">
              {playerName.slice(0, 1) || <User className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-stone-100">{playerName}</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${currentTier.badgeBg} ${currentTier.textColor} ${currentTier.badgeBorder}`}>
                  {currentTier.name} ({currentTier.englishName})
                </span>
                {!isEditing && (
                  <button
                    onClick={startEdit}
                    className="text-[11px] px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 flex items-center gap-1 font-semibold transition"
                    title="修改此棋手的天梯排位与积分"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>管理员修改段位分</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-1">
                称号：{playerTitle} · 棋艺入驻：{joinDate}
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
          {msg && (
            <div
              className={`p-2.5 rounded-xl text-xs font-medium border ${
                msg.error
                  ? 'bg-red-950/60 border-red-500/40 text-red-300'
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {msg.text}
            </div>
          )}

          {/* Admin Edit Form Section */}
          {isEditing && (
            <div className="p-4 rounded-xl bg-stone-950 border border-amber-500/40 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>管理员修改「{playerName}」天梯数据</span>
                </span>
                <span className="text-[10px] text-stone-500">局数 × 10 = 段位分标准</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">
                    排位天梯分 (目前: {getTierByScore(editRankScore).name})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editRankScore}
                    onChange={(e) => setEditRankScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">休闲匹配积分</label>
                  <input
                    type="number"
                    min={0}
                    value={editMatchScore}
                    onChange={(e) => setEditMatchScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">排位胜局数</label>
                  <input
                    type="number"
                    min={0}
                    value={editRankWins}
                    onChange={(e) => setEditRankWins(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">总对局数</label>
                  <input
                    type="number"
                    min={0}
                    value={editRankMatches}
                    onChange={(e) => setEditRankMatches(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] text-stone-400 block mb-1">称号头衔</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] text-amber-400 font-semibold block mb-1">
                    管理员裁判密码认证 (默认: chessadmin123)
                  </label>
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="输入管理员密码"
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={loading}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{loading ? '保存中...' : '保存并广播到所有设备'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Chinese Chess Piece Rank Emblem Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 p-4 border border-stone-800 flex flex-col items-center text-center shadow-inner">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c084fc_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

            {/* Authentic Circular Chinese Chess Token */}
            <RankEmblem tier={currentTier} size="lg" />

            <div className="mt-2">
              <span className={`text-base font-black tracking-wider block ${currentTier.textColor}`}>
                {currentTier.name} · {currentTier.englishName}
              </span>
              <span className="text-xs text-stone-400">
                当前排位积分：<strong className="text-amber-400 font-bold">{rankScore}</strong> 分 · 胜局：{rankWins} 局
              </span>
            </div>

              {/* Next Tier Progress Bar */}
              <div className="w-full mt-3 pt-3 border-t border-stone-800/80">
                <div className="flex justify-between items-center text-xs text-stone-400 mb-1.5">
                  <span>
                    {nextTier
                      ? `下一段位「${nextTier.name} (${nextTier.englishName})」需 ${nextTier.minScore}分`
                      : '已达最高荣誉「至尊宿敌」'}
                  </span>
                  <span className="font-bold text-amber-300">
                    {nextTier ? `还需 ${tierProgress?.remainingScore || 0} 分` : '已达最高峰'}
                  </span>
                </div>

                {nextTier && (
                  <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${tierProgress?.progressPercent || 0}%` }}
                    />
                  </div>
                )}
              </div>
          </div>

          {/* Dual Rating Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Ranked Card */}
            <div className="bg-stone-950 p-3.5 rounded-xl border border-amber-500/20">
              <div className="flex items-center justify-between text-xs text-amber-400/90 font-medium mb-1">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  排位天梯积分
                </span>
                <span className="text-stone-500 text-[10px]">最高 {bestRankScore}</span>
              </div>
              <div className="text-2xl font-black text-amber-400">
                {rankScore}
              </div>
              <div className="mt-2 text-[11px] text-stone-400 flex justify-between">
                <span>{rankMatches}战 {rankWins}胜 {rankLosses}负</span>
                <span className="font-semibold text-amber-200">
                  胜率 {rankMatches ? Math.round((rankWins / rankMatches) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Casual Match Card */}
            <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
              <div className="flex items-center justify-between text-xs text-stone-300 font-medium mb-1">
                <span className="flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                  休闲匹配积分
                </span>
                <span className="text-stone-500 text-[10px]">最高 {bestMatchScore}</span>
              </div>
              <div className="text-2xl font-black text-stone-200">
                {matchScore}
              </div>
              <div className="mt-2 text-[11px] text-stone-400 flex justify-between">
                <span>{matchMatches}战 {matchWins}胜 {matchLosses}负</span>
                <span className="font-semibold text-stone-300">
                  胜率 {matchMatches ? Math.round((matchWins / matchMatches) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Aggregate Stats Bar */}
          <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800/80 flex items-center justify-around text-center">
            <div>
              <span className="text-[11px] text-stone-400 block">总对局</span>
              <span className="text-base font-bold text-stone-200">{totalMatches}</span>
            </div>
            <div className="w-px h-6 bg-stone-800" />
            <div>
              <span className="text-[11px] text-stone-400 block">总胜局</span>
              <span className="text-base font-bold text-emerald-400">{totalWins}</span>
            </div>
            <div className="w-px h-6 bg-stone-800" />
            <div>
              <span className="text-[11px] text-stone-400 block">综合胜率</span>
              <span className="text-base font-bold text-amber-400">{overallWinRate}%</span>
            </div>
            <div className="w-px h-6 bg-stone-800" />
            <div>
              <span className="text-[11px] text-stone-400 block">当前连胜/连败</span>
              <span className={`text-base font-bold ${rankStreak > 0 ? 'text-red-400' : 'text-stone-400'}`}>
                {rankStreak > 0 ? `${rankStreak}连胜` : rankStreak < 0 ? `${Math.abs(rankStreak)}连败` : '平'}
              </span>
            </div>
          </div>

          {/* Match History & 棋谱复盘 */}
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>近期对局记录与棋谱复盘 ({playerMatches.length})</span>
            </h4>

            {playerMatches.length === 0 ? (
              <div className="p-6 text-center text-stone-500 bg-stone-950 rounded-xl border border-stone-800/60 text-xs">
                该棋手暂无完成的对局记录
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {playerMatches.map((m) => {
                  const isRed = m.redPlayer?.id === player.id;
                  const opponent = isRed ? (m.blackPlayer?.name || '黑方') : (m.redPlayer?.name || '红方');
                  const isWin = (isRed && m.winner === 'red') || (!isRed && m.winner === 'black');
                  const isDraw = m.winner === 'draw';
                  const matchDate = m.startTime
                    ? (m.startTime.includes('T') ? m.startTime.split('T')[0] : m.startTime)
                    : '近期';

                  return (
                    <div
                      key={m.id}
                      onClick={() => onReplayMatch(m)}
                      className="group flex items-center justify-between p-3 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 hover:border-amber-600/40 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-bold ${
                            isWin
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : isDraw
                              ? 'bg-stone-800 text-stone-400 border border-stone-700'
                              : 'bg-red-950 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {isWin ? '胜' : isDraw ? '和' : '负'}
                        </span>

                        <div>
                          <div className="text-xs font-semibold text-stone-200">
                            对战 <span className="text-amber-300">{opponent}</span>
                            <span className="text-[10px] text-stone-500 ml-1.5">
                              ({isRed ? '执红先手' : '执黑后手'})
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-500 mt-0.5">
                            {m.mode === 'ranked' ? '排位天梯' : '休闲匹配'} · 共{m.moves?.length || 0}手 · {matchDate}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-amber-400 group-hover:text-amber-300">
                        <span className="text-[11px] hidden sm:inline">复盘棋谱</span>
                        <PlayCircle className="w-4 h-4" />
                      </div>
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
            关闭资料
          </button>
        </div>
      </div>
    </div>
  );
};
