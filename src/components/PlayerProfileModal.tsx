import React from 'react';
import { MatchRecord, Player } from '../types/chess';
import { X, Trophy, Swords, Flame, Award, Calendar, ChevronRight, PlayCircle, Shield } from 'lucide-react';
import { RankEmblem } from './RankEmblem';
import { getNextTierProgress, getTierByWins } from '../utils/tierSystem';

interface Props {
  player: Player | null;
  matchHistory: MatchRecord[];
  onClose: () => void;
  onReplayMatch: (match: MatchRecord) => void;
}

export const PlayerProfileModal: React.FC<Props> = ({
  player,
  matchHistory,
  onClose,
  onReplayMatch,
}) => {
  if (!player) return null;

  // Filter player's matches
  const playerMatches = matchHistory.filter(
    m => m.redPlayer.id === player.id || m.blackPlayer.id === player.id
  );

  const totalMatches = player.rankMatches + player.matchMatches;
  const totalWins = player.rankWins + player.matchWins;
  const overallWinRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  // Tier info based on user win ladder requirements
  const tierProgress = getNextTierProgress(player.rankWins);
  const currentTier = tierProgress.currentTier;
  const nextTier = tierProgress.nextTier;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-800 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-amber-400/50 flex items-center justify-center font-serif text-2xl font-black text-amber-100 shadow-lg">
              {player.name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-stone-100">{player.name}</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${currentTier.badgeBg} ${currentTier.textColor} ${currentTier.badgeBorder}`}>
                  {currentTier.name} ({currentTier.englishName})
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                称号：{player.title || '象棋棋手'} · 棋艺入驻：{player.createdAt.split('T')[0]}
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
          
          {/* Glorious Tier Emblem Banner (Matching user reference photo) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 p-4 border border-stone-800 flex flex-col items-center text-center shadow-inner">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c084fc_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

            {/* Winged Insignia Shield */}
            <RankEmblem tier={currentTier} size="lg" />

            <div className="mt-2">
              <span className={`text-base font-black tracking-wider block ${currentTier.textColor}`}>
                {currentTier.name} · {currentTier.englishName}
              </span>
              <span className="text-xs text-stone-400">
                当前段位胜局：<strong className="text-amber-400 font-bold">{player.rankWins}</strong> 局
              </span>
            </div>

            {/* Next Tier Progress Bar */}
            <div className="w-full mt-3 pt-3 border-t border-stone-800/80">
              <div className="flex justify-between items-center text-xs text-stone-400 mb-1.5">
                <span>
                  {nextTier
                    ? `晋级至下一段位「${nextTier.name} (${nextTier.englishName})」`
                    : '已达最高荣誉「至尊宿敌」'}
                </span>
                <span className="font-bold text-amber-300">
                  {nextTier ? `还需 ${tierProgress.remainingWins} 胜` : '最高段位'}
                </span>
              </div>

              {nextTier && (
                <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${tierProgress.progressPercent}%` }}
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
                <span className="text-stone-500 text-[10px]">最高 {player.bestRankScore}</span>
              </div>
              <div className="text-2xl font-black text-amber-400">
                {player.rankScore}
              </div>
              <div className="mt-2 text-[11px] text-stone-400 flex justify-between">
                <span>{player.rankMatches}战 {player.rankWins}胜 {player.rankLosses}负</span>
                <span className="font-semibold text-amber-200">
                  胜率 {player.rankMatches ? Math.round((player.rankWins / player.rankMatches) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Match Card */}
            <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
              <div className="flex items-center justify-between text-xs text-stone-300 font-medium mb-1">
                <span className="flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                  休闲匹配积分
                </span>
                <span className="text-stone-500 text-[10px]">最高 {player.bestMatchScore}</span>
              </div>
              <div className="text-2xl font-black text-stone-200">
                {player.matchScore}
              </div>
              <div className="mt-2 text-[11px] text-stone-400 flex justify-between">
                <span>{player.matchMatches}战 {player.matchWins}胜 {player.matchLosses}负</span>
                <span className="font-semibold text-stone-300">
                  胜率 {player.matchMatches ? Math.round((player.matchWins / player.matchMatches) * 100) : 0}%
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
              <span className={`text-base font-bold ${player.rankStreak > 0 ? 'text-red-400' : 'text-stone-400'}`}>
                {player.rankStreak > 0 ? `${player.rankStreak}连胜` : player.rankStreak < 0 ? `${Math.abs(player.rankStreak)}连败` : '平'}
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
                  const isRed = m.redPlayer.id === player.id;
                  const opponent = isRed ? m.blackPlayer.name : m.redPlayer.name;
                  const isWin = (isRed && m.winner === 'red') || (!isRed && m.winner === 'black');
                  const isDraw = m.winner === 'draw';

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
                            {m.mode === 'ranked' ? '排位天梯' : '休闲匹配'} · 共{m.moves?.length || 0}手 · {m.startTime?.split('T')[0]}
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
