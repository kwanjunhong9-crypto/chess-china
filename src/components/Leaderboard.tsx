import React, { useState } from 'react';
import { Player } from '../types/chess';
import { Trophy, Medal, Award, Flame, Search, ChevronRight, UserPlus, Users } from 'lucide-react';

interface Props {
  players: Player[];
  activeTab: 'ranked' | 'match';
  onTabChange: (tab: 'ranked' | 'match') => void;
  onSelectPlayer: (player: Player) => void;
  onOpenAddMember?: () => void;
  isAdmin: boolean;
}

export const Leaderboard: React.FC<Props> = ({
  players,
  activeTab,
  onTabChange,
  onSelectPlayer,
  onOpenAddMember,
  isAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sort players depending on activeTab
  const sortedPlayers = [...players].sort((a, b) => {
    if (activeTab === 'ranked') {
      if (b.rankScore !== a.rankScore) return b.rankScore - a.rankScore;
      return b.rankWins - a.rankWins;
    } else {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return b.matchWins - a.matchWins;
    }
  });

  const filteredPlayers = sortedPlayers.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const top1 = sortedPlayers[0];
  const top2 = sortedPlayers[1];
  const top3 = sortedPlayers[2];

  const getRankBadge = (score: number) => {
    if (score >= 2400) return { title: '特级大师', bg: 'bg-red-500/20 text-red-400 border-red-500/40' };
    if (score >= 2000) return { title: '国家大师', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
    if (score >= 1700) return { title: '一级棋士', bg: 'bg-purple-500/20 text-purple-400 border-purple-500/40' };
    if (score >= 1400) return { title: '二级棋士', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
    if (score >= 1200) return { title: '三级棋士', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
    return { title: '象棋新秀', bg: 'bg-stone-500/20 text-stone-400 border-stone-500/40' };
  };

  return (
    <div className="w-full bg-stone-900/90 rounded-2xl border border-stone-800 p-4 sm:p-5 shadow-xl">
      {/* Header and Mode Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-stone-800">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>棋榜风云 · 积分排名</span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            点击任意棋手可查看详细战绩与对局档案
          </p>
        </div>

        {/* Tab Switcher: 排位 vs 匹配 */}
        <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 self-stretch sm:self-auto">
          <button
            onClick={() => onTabChange('ranked')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'ranked'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>排位天梯榜</span>
          </button>
          <button
            onClick={() => onTabChange('match')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'match'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Medal className="w-3.5 h-3.5" />
            <span>匹配积分榜</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium (冠亚季军领奖台) */}
      {sortedPlayers.length > 0 ? (
        <div className="my-5 grid grid-cols-3 gap-2 sm:gap-3 items-end pt-4 pb-2">
          {/* Top 2 - Silver */}
          <div
            onClick={() => top2 && onSelectPlayer(top2)}
            className={`relative rounded-xl p-3 flex flex-col items-center text-center transition cursor-pointer border ${
              top2
                ? 'bg-gradient-to-b from-stone-800/80 to-stone-900 border-slate-400/40 hover:border-slate-300'
                : 'bg-stone-900/40 border-dashed border-stone-800 cursor-default opacity-50'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-300/20 text-slate-300 border border-slate-300/50 flex items-center justify-center font-black text-sm mb-1.5 shadow">
              🥈 2
            </div>
            {top2 ? (
              <>
                <span className="font-bold text-xs sm:text-sm text-stone-200 truncate w-full">
                  {top2.name}
                </span>
                <span className="text-amber-400 font-extrabold text-sm sm:text-base mt-0.5">
                  {activeTab === 'ranked' ? top2.rankScore : top2.matchScore}分
                </span>
                <span className="text-[10px] text-stone-400 mt-1">
                  胜率 {top2.rankMatches ? Math.round((top2.rankWins / top2.rankMatches) * 100) : 0}%
                </span>
              </>
            ) : (
              <span className="text-xs text-stone-500 py-3">虚位以待</span>
            )}
          </div>

          {/* Top 1 - Gold (Elevated) */}
          <div
            onClick={() => top1 && onSelectPlayer(top1)}
            className={`relative rounded-xl p-3.5 flex flex-col items-center text-center transition cursor-pointer border -translate-y-2 shadow-lg shadow-amber-950/40 ${
              top1
                ? 'bg-gradient-to-b from-amber-950/50 via-stone-800 to-stone-900 border-amber-500/70 hover:border-amber-400'
                : 'bg-stone-900/40 border-dashed border-stone-800 cursor-default opacity-50'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/25 text-amber-300 border-2 border-amber-400 flex items-center justify-center font-black text-base mb-1.5 shadow-md">
              🥇 1
            </div>
            {top1 ? (
              <>
                <span className="font-black text-sm sm:text-base text-amber-200 truncate w-full">
                  {top1.name}
                </span>
                <span className="text-amber-400 font-black text-base sm:text-lg mt-0.5">
                  {activeTab === 'ranked' ? top1.rankScore : top1.matchScore}分
                </span>
                <span className="text-[10px] text-amber-300/80 mt-1">
                  {activeTab === 'ranked' ? getRankBadge(top1.rankScore).title : '匹配擂主'}
                </span>
              </>
            ) : (
              <span className="text-xs text-stone-500 py-4">虚位以待</span>
            )}
          </div>

          {/* Top 3 - Bronze */}
          <div
            onClick={() => top3 && onSelectPlayer(top3)}
            className={`relative rounded-xl p-3 flex flex-col items-center text-center transition cursor-pointer border ${
              top3
                ? 'bg-gradient-to-b from-stone-800/80 to-stone-900 border-amber-800/40 hover:border-amber-700'
                : 'bg-stone-900/40 border-dashed border-stone-800 cursor-default opacity-50'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-amber-800/30 text-amber-400 border border-amber-700/60 flex items-center justify-center font-black text-sm mb-1.5 shadow">
              🥉 3
            </div>
            {top3 ? (
              <>
                <span className="font-bold text-xs sm:text-sm text-stone-200 truncate w-full">
                  {top3.name}
                </span>
                <span className="text-amber-400 font-extrabold text-sm sm:text-base mt-0.5">
                  {activeTab === 'ranked' ? top3.rankScore : top3.matchScore}分
                </span>
                <span className="text-[10px] text-stone-400 mt-1">
                  胜率 {top3.rankMatches ? Math.round((top3.rankWins / top3.rankMatches) * 100) : 0}%
                </span>
              </>
            ) : (
              <span className="text-xs text-stone-500 py-3">虚位以待</span>
            )}
          </div>
        </div>
      ) : null}

      {/* Search Input Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索棋手姓名..."
          className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600 transition"
        />
      </div>

      {/* Leaderboard Table List */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {filteredPlayers.length === 0 ? (
          <div className="py-10 text-center text-stone-500">
            {players.length === 0 ? (
              <div className="flex flex-col items-center gap-2">
                <Users className="w-10 h-10 text-stone-600 stroke-[1.5]" />
                <p className="text-sm font-medium text-stone-400">目前暂无成员名单</p>
                <p className="text-xs text-stone-500">
                  {isAdmin
                    ? '请点击右上方“记分管理 / 添加成员”输入成员姓名即可加入积分榜'
                    : '请联系管理员输入密码登录后添加棋手成员'}
                </p>
                {isAdmin && onOpenAddMember && (
                  <button
                    onClick={onOpenAddMember}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 text-xs font-semibold border border-amber-500/40 flex items-center gap-1.5 transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>添加第一位成员</span>
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs">未找到匹配的棋手 "{searchTerm}"</p>
            )}
          </div>
        ) : (
          filteredPlayers.map((player, index) => {
            const score = activeTab === 'ranked' ? player.rankScore : player.matchScore;
            const matches = activeTab === 'ranked' ? player.rankMatches : player.matchMatches;
            const wins = activeTab === 'ranked' ? player.rankWins : player.matchWins;
            const losses = activeTab === 'ranked' ? player.rankLosses : player.matchLosses;
            const draws = activeTab === 'ranked' ? player.rankDraws : player.matchDraws;
            const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
            const badge = getRankBadge(player.rankScore);

            return (
              <div
                key={player.id}
                onClick={() => onSelectPlayer(player)}
                className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-stone-950/70 hover:bg-stone-800/70 border border-stone-800/80 hover:border-amber-600/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Rank number badge */}
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      index === 0
                        ? 'bg-amber-500 text-stone-950'
                        : index === 1
                        ? 'bg-slate-300 text-stone-950'
                        : index === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {index + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-200 group-hover:text-amber-300 transition">
                        {player.name}
                      </span>
                      {activeTab === 'ranked' && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.title}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                      <span>{matches}战 {wins}胜{losses}负{draws}和</span>
                      <span>·</span>
                      <span>胜率 {winRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-amber-400">
                      {score}
                    </span>
                    <span className="text-[10px] text-stone-500 ml-1">分</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-amber-400 transition" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
