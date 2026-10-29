import React, { useState } from 'react';
import { Player } from '../types/chess';
import { Trophy, Medal, Flame, Search, ChevronRight, UserPlus, Users } from 'lucide-react';
import { RankEmblem } from './RankEmblem';
import { getTierByWins, TIERS } from '../utils/tierSystem';

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
  const [showTierModal, setShowTierModal] = useState(false);

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

  return (
    <div className="w-full bg-stone-900/90 rounded-2xl border border-stone-800 p-4 sm:p-5 shadow-xl">
      {/* Header and Mode Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>棋榜风云 · 积分排名</span>
            </h2>
            <button
              onClick={() => setShowTierModal(true)}
              className="text-[11px] px-2 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-500/50 hover:bg-purple-900 transition flex items-center gap-1 font-semibold"
              title="查看段位规则表"
            >
              <span>段位徽章一览</span>
            </button>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            胜场晋级：未排名 ➔ 铜 ➔ 银 ➔ 黄金 ➔ 钻石 ➔ 岩浆 ➔ 宿敌 ➔ 至尊宿敌
          </p>
        </div>

        {/* Tab Switcher: 排位 vs 匹配 */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-stone-950 rounded-xl border border-stone-800 w-full sm:w-[280px] shrink-0">
          <button
            onClick={() => onTabChange('ranked')}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap select-none ${
              activeTab === 'ranked'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span>排位天梯榜</span>
          </button>
          <button
            onClick={() => onTabChange('match')}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap select-none ${
              activeTab === 'match'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Medal className="w-3.5 h-3.5 shrink-0" />
            <span>匹配积分榜</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium (冠亚季军领奖台 带段位飞翼盾徽) */}
      {sortedPlayers.length > 0 ? (
        <div className="my-5 grid grid-cols-3 gap-2 sm:gap-3 items-end pt-2 pb-2">
          {/* Top 2 - Silver */}
          <div
            onClick={() => top2 && onSelectPlayer(top2)}
            className={`relative rounded-xl p-2.5 sm:p-3 flex flex-col items-center text-center transition cursor-pointer border ${
              top2
                ? 'bg-gradient-to-b from-stone-800/80 to-stone-900 border-slate-400/40 hover:border-slate-300'
                : 'bg-stone-900/40 border-dashed border-stone-800 cursor-default opacity-50'
            }`}
          >
            {top2 ? (
              <>
                <div className="mb-1 flex items-center justify-center">
                  <RankEmblem wins={activeTab === 'ranked' ? top2.rankWins : top2.matchWins} size="sm" />
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-300/20 text-slate-300 border border-slate-300/50 flex items-center justify-center font-black text-xs mb-1 shadow">
                  🥈 2
                </div>
                <span className="font-bold text-xs sm:text-sm text-stone-200 truncate w-full">
                  {top2.name}
                </span>
                <span className="text-amber-400 font-extrabold text-xs sm:text-sm mt-0.5">
                  {activeTab === 'ranked' ? top2.rankScore : top2.matchScore}分
                </span>
                <span className="text-[10px] text-purple-300 font-semibold mt-0.5">
                  {getTierByWins(activeTab === 'ranked' ? top2.rankWins : top2.matchWins).name} · {activeTab === 'ranked' ? top2.rankWins : top2.matchWins}胜
                </span>
              </>
            ) : (
              <span className="text-xs text-stone-500 py-6">虚位以待</span>
            )}
          </div>

          {/* Top 1 - Gold (Elevated with Grand Wings) */}
          <div
            onClick={() => top1 && onSelectPlayer(top1)}
            className={`relative rounded-xl p-3 sm:p-3.5 flex flex-col items-center text-center transition cursor-pointer border -translate-y-2 shadow-lg shadow-amber-950/40 ${
              top1
                ? 'bg-gradient-to-b from-amber-950/50 via-stone-800 to-stone-900 border-amber-500/70 hover:border-amber-400'
                : 'bg-stone-900/40 border-dashed border-stone-800 cursor-default opacity-50'
            }`}
          >
            {top1 ? (
              <>
                <div className="mb-1 flex items-center justify-center">
                  <RankEmblem wins={activeTab === 'ranked' ? top1.rankWins : top1.matchWins} size="md" />
                </div>
                <div className="w-7 h-7 rounded-full bg-amber-500/25 text-amber-300 border-2 border-amber-400 flex items-center justify-center font-black text-xs mb-1 shadow-md">
                  🥇 1
                </div>
                <span className="font-black text-sm sm:text-base text-amber-200 truncate w-full">
                  {top1.name}
                </span>
                <span className="text-amber-400 font-black text-base sm:text-lg mt-0.5">
                  {activeTab === 'ranked' ? top1.rankScore : top1.matchScore}分
                </span>
                <span className="text-[11px] font-bold text-amber-300 mt-0.5 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                  {getTierByWins(activeTab === 'ranked' ? top1.rankWins : top1.matchWins).name} ({activeTab === 'ranked' ? top1.rankWins : top1.matchWins}胜)
                </span>
              </>
            ) : (
              <span className="text-xs text-stone-500 py-8">虚位以待</span>
            )}
          </div>

          {/* Top 3 - Bronze */}
          <div
            onClick={() => top3 && onSelectPlayer(top3)}
            className={`relative rounded-xl p-2.5 sm:p-3 flex flex-col items-center text-center transition cursor-pointer border ${
              top3
                ? 'bg-gradient-to-b from-stone-800/80 to-stone-900 border-amber-800/40 hover:border-amber-700'
                : 'bg-stone-900/40 border-dashed border-stone-800 cursor-default opacity-50'
            }`}
          >
            {top3 ? (
              <>
                <div className="mb-1 flex items-center justify-center">
                  <RankEmblem wins={activeTab === 'ranked' ? top3.rankWins : top3.matchWins} size="sm" />
                </div>
                <div className="w-6 h-6 rounded-full bg-amber-800/30 text-amber-400 border border-amber-700/60 flex items-center justify-center font-black text-xs mb-1 shadow">
                  🥉 3
                </div>
                <span className="font-bold text-xs sm:text-sm text-stone-200 truncate w-full">
                  {top3.name}
                </span>
                <span className="text-amber-400 font-extrabold text-xs sm:text-sm mt-0.5">
                  {activeTab === 'ranked' ? top3.rankScore : top3.matchScore}分
                </span>
                <span className="text-[10px] text-amber-400 font-semibold mt-0.5">
                  {getTierByWins(activeTab === 'ranked' ? top3.rankWins : top3.matchWins).name} · {activeTab === 'ranked' ? top3.rankWins : top3.matchWins}胜
                </span>
              </>
            ) : (
              <span className="text-xs text-stone-500 py-6">虚位以待</span>
            )}
          </div>
        </div>
      ) : null}

      {/* Search Input Bar AND Dedicated Permanent [ + 增加成员 ] Button */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索棋手姓名..."
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600 transition"
          />
        </div>

        {/* ALWAYS VISIBLE Add Member Button */}
        <button
          onClick={onOpenAddMember}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md transition active:scale-95"
          title="点击增加棋手成员"
        >
          <UserPlus className="w-4 h-4" />
          <span>增加成员</span>
        </button>
      </div>

      {/* Leaderboard Table List with Tier Emblems */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {filteredPlayers.length === 0 ? (
          <div className="py-10 text-center text-stone-500">
            {players.length === 0 ? (
              <div className="flex flex-col items-center gap-2">
                <Users className="w-10 h-10 text-stone-600 stroke-[1.5]" />
                <p className="text-sm font-medium text-stone-400">目前暂无成员名单</p>
                <p className="text-xs text-stone-500">
                  点击上方黄色“增加成员”按钮即可输入姓名加入积分榜
                </p>
                {onOpenAddMember && (
                  <button
                    onClick={onOpenAddMember}
                    className="mt-2 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition shadow"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>立即增加成员</span>
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
            const tier = getTierByWins(wins);

            return (
              <div
                key={player.id}
                onClick={() => onSelectPlayer(player)}
                className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-stone-950/70 hover:bg-stone-800/70 border border-stone-800/80 hover:border-amber-600/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {/* Rank number badge */}
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
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

                  {/* Tier Winged Shield Emblem */}
                  <div className="shrink-0 flex items-center justify-center">
                    <RankEmblem tier={tier} size="xs" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-stone-200 group-hover:text-amber-300 transition">
                        {player.name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${tier.badgeBg} ${tier.textColor} ${tier.badgeBorder}`}>
                        {tier.name} · {tier.englishName}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                      <span>{matches}战 {wins}胜{losses}负{draws}和</span>
                      <span>·</span>
                      <span>胜率 {winRate}%</span>
                      <span>·</span>
                      <span className="text-amber-400/80">{wins}局胜利</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
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

      {/* Tier Explanation Modal */}
      {showTierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-stone-800 bg-stone-950 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>象棋天梯 8 大段位勋章体系统</span>
                </h3>
                <p className="text-xs text-stone-400">累计胜场晋级，飞翼盾徽随段位闪耀升级</p>
              </div>
              <button
                onClick={() => setShowTierModal(false)}
                className="text-stone-400 hover:text-white text-xs px-2 py-1 rounded bg-stone-800"
              >
                关闭
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5">
              {TIERS.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-950 border border-stone-800/80 hover:border-amber-500/40"
                >
                  <div className="flex items-center gap-3">
                    <RankEmblem tier={t} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${t.textColor}`}>
                          {t.name}
                        </span>
                        <span className="text-xs text-stone-400 font-mono">
                          ({t.englishName})
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">{t.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-amber-300">
                      需胜 {t.minWins} - {t.maxWins > 500 ? '320+' : t.maxWins} 局
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
