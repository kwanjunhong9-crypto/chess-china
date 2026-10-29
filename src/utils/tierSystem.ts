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
    color: '#94a3b8',
    textColor: 'text-slate-400',
    badgeBg: 'bg-slate-900/80',
    badgeBorder: 'border-slate-700',
    shieldColor: '#64748b',
    wingColor: '#475569',
    gemColor: '#94a3b8',
    description: '0-100分 (0-10局) · 蓄势待发，初登棋坛',
  },
  {
    id: 'bronze',
    name: '青铜',
    englishName: 'Bronze',
    minScore: 110,
    maxScore: 200,
    minWins: 11,
    maxWins: 20,
    color: '#cd7f32',
    textColor: 'text-amber-500',
    badgeBg: 'bg-amber-950/60',
    badgeBorder: 'border-amber-700/60',
    shieldColor: '#b45309',
    wingColor: '#92400e',
    gemColor: '#d97706',
    description: '110-200分 (11-20局) · 铜坚如铁，初显锋芒',
  },
  {
    id: 'silver',
    name: '白银',
    englishName: 'Silver',
    minScore: 210,
    maxScore: 300,
    minWins: 21,
    maxWins: 30,
    color: '#cbd5e1',
    textColor: 'text-slate-200',
    badgeBg: 'bg-slate-800/70',
    badgeBorder: 'border-slate-400/60',
    shieldColor: '#e2e8f0',
    wingColor: '#94a3b8',
    gemColor: '#f1f5f9',
    description: '210-300分 (21-30局) · 银光如练，技艺精进',
  },
  {
    id: 'gold',
    name: '黄金',
    englishName: 'Gold',
    minScore: 310,
    maxScore: 500,
    minWins: 31,
    maxWins: 50,
    color: '#eab308',
    textColor: 'text-yellow-400',
    badgeBg: 'bg-yellow-950/60',
    badgeBorder: 'border-yellow-500/60',
    shieldColor: '#f59e0b',
    wingColor: '#fbbf24',
    gemColor: '#fef08a',
    description: '310-500分 (31-50局) · 金戈铁马，纵横棋盘',
  },
  {
    id: 'diamond',
    name: '钻石',
    englishName: 'Diamond',
    minScore: 510,
    maxScore: 750,
    minWins: 51,
    maxWins: 75,
    color: '#06b6d4',
    textColor: 'text-cyan-300',
    badgeBg: 'bg-cyan-950/60',
    badgeBorder: 'border-cyan-500/60',
    shieldColor: '#0ea5e9',
    wingColor: '#38bdf8',
    gemColor: '#67e8f9',
    description: '510-750分 (51-75局) · 璀璨凌厉，坚不可摧',
  },
  {
    id: 'magma',
    name: '岩浆',
    englishName: 'Magma',
    minScore: 760,
    maxScore: 1200,
    minWins: 76,
    maxWins: 120,
    color: '#f97316',
    textColor: 'text-orange-400',
    badgeBg: 'bg-orange-950/60',
    badgeBorder: 'border-orange-600/70',
    shieldColor: '#ea580c',
    wingColor: '#ef4444',
    gemColor: '#ffedd5',
    description: '760-1200分 (76-120局) · 熔岩炽烈，势吞山河',
  },
  {
    id: 'nemesis',
    name: '宿敌',
    englishName: 'Nemesis',
    minScore: 1210,
    maxScore: 2000,
    minWins: 121,
    maxWins: 200,
    color: '#a855f7',
    textColor: 'text-purple-300',
    badgeBg: 'bg-purple-950/70',
    badgeBorder: 'border-purple-500/70',
    shieldColor: '#f59e0b',
    wingColor: '#c084fc',
    gemColor: '#9333ea',
    description: '1210-2000分 (121-200局) · 天命克星，举世瞩目',
  },
  {
    id: 'arch_nemesis',
    name: '至尊宿敌',
    englishName: 'Arch Nemesis',
    minScore: 2010,
    maxScore: 99999,
    minWins: 201,
    maxWins: 99999,
    color: '#ec4899',
    textColor: 'text-pink-300',
    badgeBg: 'bg-gradient-to-r from-purple-950 to-pink-950',
    badgeBorder: 'border-pink-500/80',
    shieldColor: '#fbbf24',
    wingColor: '#f472b6',
    gemColor: '#d946ef',
    description: '2010分以上 (201局以上) · 终极宿敌，傲视群雄',
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
