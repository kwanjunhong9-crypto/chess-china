export interface TierInfo {
  id: string;
  name: string;
  englishName: string;
  minScore: number;
  maxScore: number;
  minWins: number;
  maxWins: number;
  color: string;
  textColor: string;
  badgeBg: string;
  badgeBorder: string;
  shieldColor: string;
  wingColor: string;
  gemColor: string;
  description: string;
}

export const TIERS: TierInfo[] = [
  {
    id: 'unranked',
    name: '未排名',
    englishName: 'Unranked',
    minScore: 0,
    maxScore: 100,
    minWins: 0,
    maxWins: 10,
    color: '#64748b', // 灰色
    textColor: 'text-stone-400',
    badgeBg: 'bg-stone-800/90',
    badgeBorder: 'border-stone-600',
    shieldColor: '#52525b',
    wingColor: '#3f3f46',
    gemColor: '#71717a',
    description: '0-100分 (0-10局) · 灰色 · 蓄势待发，无段位',
  },
  {
    id: 'bronze',
    name: '铜',
    englishName: 'Bronze',
    minScore: 110,
    maxScore: 200,
    minWins: 11,
    maxWins: 20,
    color: '#854d0e', // 褐色
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-950/80',
    badgeBorder: 'border-amber-800',
    shieldColor: '#78350f',
    wingColor: '#451a03',
    gemColor: '#92400e',
    description: '110-200分 (11-20局) · 褐色 · 褐铜坚石，初显锋芒',
  },
  {
    id: 'silver',
    name: '银',
    englishName: 'Silver',
    minScore: 210,
    maxScore: 300,
    minWins: 21,
    maxWins: 30,
    color: '#cbd5e1', // 银色
    textColor: 'text-slate-100',
    badgeBg: 'bg-slate-800/80',
    badgeBorder: 'border-slate-400',
    shieldColor: '#e2e8f0',
    wingColor: '#94a3b8',
    gemColor: '#f8fafc',
    description: '210-300分 (21-30局) · 银色 · 银光胜雪，技艺精进',
  },
  {
    id: 'gold',
    name: '金',
    englishName: 'Gold',
    minScore: 310,
    maxScore: 500,
    minWins: 31,
    maxWins: 50,
    color: '#eab308', // 金色
    textColor: 'text-yellow-400',
    badgeBg: 'bg-yellow-950/70',
    badgeBorder: 'border-yellow-500/70',
    shieldColor: '#f59e0b',
    wingColor: '#b45309',
    gemColor: '#fef08a',
    description: '310-500分 (31-50局) · 金色 · 金戈铁马，纵横棋盘',
  },
  {
    id: 'diamond',
    name: '钻石',
    englishName: 'Diamond',
    minScore: 510,
    maxScore: 750,
    minWins: 51,
    maxWins: 75,
    color: '#06b6d4', // 蓝钻色
    textColor: 'text-cyan-300',
    badgeBg: 'bg-cyan-950/70',
    badgeBorder: 'border-cyan-500/70',
    shieldColor: '#0ea5e9',
    wingColor: '#0284c7',
    gemColor: '#67e8f9',
    description: '510-750分 (51-75局) · 蓝钻色 · 晶蓝凌厉，坚不可摧',
  },
  {
    id: 'magma',
    name: '岩浆',
    englishName: 'Magma',
    minScore: 760,
    maxScore: 1200,
    minWins: 76,
    maxWins: 120,
    color: '#ea580c', // 黑色岩石+橙色+红色
    textColor: 'text-orange-400',
    badgeBg: 'bg-gradient-to-r from-stone-950 via-orange-950 to-red-950',
    badgeBorder: 'border-orange-600',
    shieldColor: '#1c1917', // 黑色岩石
    wingColor: '#ea580c', // 橙色
    gemColor: '#ef4444', // 红色
    description: '760-1200分 (76-120局) · 黑色岩石+橙色+红色 · 熔岩炽烈',
  },
  {
    id: 'nemesis',
    name: '宿敌',
    englishName: 'Nemesis',
    minScore: 1210,
    maxScore: 2000,
    minWins: 121,
    maxWins: 200,
    color: '#a855f7', // 紫色
    textColor: 'text-purple-300',
    badgeBg: 'bg-purple-950/80',
    badgeBorder: 'border-purple-500',
    shieldColor: '#9333ea',
    wingColor: '#581c87',
    gemColor: '#c084fc',
    description: '1210-2000分 (121-200局) · 紫色 · 天命克星，举世瞩目',
  },
  {
    id: 'arch_nemesis',
    name: '至尊宿敌',
    englishName: 'Arch Nemesis',
    minScore: 2010,
    maxScore: 99999,
    minWins: 201,
    maxWins: 99999,
    color: '#06b6d4', // 黑+青色
    textColor: 'text-teal-300',
    badgeBg: 'bg-gradient-to-r from-stone-950 via-black to-teal-950',
    badgeBorder: 'border-teal-500',
    shieldColor: '#09090b', // 黑
    wingColor: '#0d9488', // 青
    gemColor: '#2dd4bf', // 青亮
    description: '2010分以上 (201局以上) · 黑+青色 · 终极宿敌，傲视群雄',
  },
];

export function getTierByScore(score: number = 0): TierInfo {
  const safeScore = Math.max(0, score);
  if (safeScore <= 100) return TIERS[0];
  if (safeScore <= 200) return TIERS[1];
  if (safeScore <= 300) return TIERS[2];
  if (safeScore <= 500) return TIERS[3];
  if (safeScore <= 750) return TIERS[4];
  if (safeScore <= 1200) return TIERS[5];
  if (safeScore <= 2000) return TIERS[6];
  return TIERS[7];
}

// Backward compatible helper
export function getTierByWins(wins: number = 0): TierInfo {
  const safeWins = Math.max(0, wins);
  for (const tier of TIERS) {
    if (safeWins >= tier.minWins && safeWins <= tier.maxWins) {
      return tier;
    }
  }
  return TIERS[TIERS.length - 1];
}

export function getNextTierProgress(scoreOrWins: number = 0): {
  currentTier: TierInfo;
  nextTier: TierInfo | null;
  progressPercent: number;
  remainingScore: number;
  remainingWins: number;
} {
  const currentTier = getTierByScore(scoreOrWins);
  const currentIndex = TIERS.findIndex(t => t.id === currentTier.id);
  const nextTier = currentIndex < TIERS.length - 1 ? TIERS[currentIndex + 1] : null;

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      progressPercent: 100,
      remainingScore: 0,
      remainingWins: 0,
    };
  }

  const range = nextTier.minScore - currentTier.minScore;
  const currentInRange = Math.max(0, scoreOrWins - currentTier.minScore);
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentInRange / range) * 100)));
  const remainingScore = Math.max(0, nextTier.minScore - scoreOrWins);

  return {
    currentTier,
    nextTier,
    progressPercent,
    remainingScore,
    remainingWins: Math.ceil(remainingScore / 10),
  };
}
