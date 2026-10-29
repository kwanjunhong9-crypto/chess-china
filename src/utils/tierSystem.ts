export interface TierInfo {
  id: string;
  name: string;
  englishName: string;
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
    minWins: 0,
    maxWins: 10,
    color: '#94a3b8',
    textColor: 'text-slate-400',
    badgeBg: 'bg-slate-900/80',
    badgeBorder: 'border-slate-700',
    shieldColor: '#64748b',
    wingColor: '#475569',
    gemColor: '#94a3b8',
    description: '蓄势待发，初登棋坛',
  },
  {
    id: 'bronze',
    name: '青铜',
    englishName: 'Bronze',
    minWins: 11,
    maxWins: 20,
    color: '#cd7f32',
    textColor: 'text-amber-500',
    badgeBg: 'bg-amber-950/60',
    badgeBorder: 'border-amber-700/60',
    shieldColor: '#b45309',
    wingColor: '#92400e',
    gemColor: '#d97706',
    description: '铜坚如铁，初显锋芒',
  },
  {
    id: 'silver',
    name: '白银',
    englishName: 'Silver',
    minWins: 21,
    maxWins: 30,
    color: '#cbd5e1',
    textColor: 'text-slate-200',
    badgeBg: 'bg-slate-800/70',
    badgeBorder: 'border-slate-400/60',
    shieldColor: '#e2e8f0',
    wingColor: '#94a3b8',
    gemColor: '#f1f5f9',
    description: '银光如练，技艺精进',
  },
  {
    id: 'gold',
    name: '黄金',
    englishName: 'Gold',
    minWins: 31,
    maxWins: 50,
    color: '#eab308',
    textColor: 'text-yellow-400',
    badgeBg: 'bg-yellow-950/60',
    badgeBorder: 'border-yellow-500/60',
    shieldColor: '#f59e0b',
    wingColor: '#fbbf24',
    gemColor: '#fef08a',
    description: '金戈铁马，纵横棋盘',
  },
  {
    id: 'diamond',
    name: '钻石',
    englishName: 'Diamond',
    minWins: 51,
    maxWins: 75,
    color: '#06b6d4',
    textColor: 'text-cyan-300',
    badgeBg: 'bg-cyan-950/60',
    badgeBorder: 'border-cyan-500/60',
    shieldColor: '#0ea5e9',
    wingColor: '#38bdf8',
    gemColor: '#67e8f9',
    description: '璀璨凌厉，坚不可摧',
  },
  {
    id: 'magma',
    name: '岩浆',
    englishName: 'Magma',
    minWins: 76,
    maxWins: 120,
    color: '#f97316',
    textColor: 'text-orange-400',
    badgeBg: 'bg-orange-950/60',
    badgeBorder: 'border-orange-600/70',
    shieldColor: '#ea580c',
    wingColor: '#ef4444',
    gemColor: '#ffedd5',
    description: '熔岩炽烈，势吞山河',
  },
  {
    id: 'nemesis',
    name: '宿敌',
    englishName: 'Nemesis',
    minWins: 121,
    maxWins: 200,
    color: '#a855f7',
    textColor: 'text-purple-300',
    badgeBg: 'bg-purple-950/70',
    badgeBorder: 'border-purple-500/70',
    shieldColor: '#f59e0b',
    wingColor: '#c084fc',
    gemColor: '#9333ea',
    description: '天命克星，举世瞩目',
  },
  {
    id: 'arch_nemesis',
    name: '至尊宿敌',
    englishName: 'Arch Nemesis',
    minWins: 201,
    maxWins: 9999,
    color: '#ec4899',
    textColor: 'text-pink-300',
    badgeBg: 'bg-gradient-to-r from-purple-950 to-pink-950',
    badgeBorder: 'border-pink-500/80',
    shieldColor: '#fbbf24',
    wingColor: '#f472b6',
    gemColor: '#d946ef',
    description: '终极宿敌，傲视群雄',
  },
];

export function getTierByWins(wins: number = 0): TierInfo {
  const safeWins = Math.max(0, wins);
  for (const tier of TIERS) {
    if (safeWins >= tier.minWins && safeWins <= tier.maxWins) {
      return tier;
    }
  }
  return TIERS[TIERS.length - 1];
}

export function getNextTierProgress(wins: number = 0): {
  currentTier: TierInfo;
  nextTier: TierInfo | null;
  progressPercent: number;
  remainingWins: number;
} {
  const currentTier = getTierByWins(wins);
  const currentIndex = TIERS.findIndex(t => t.id === currentTier.id);
  const nextTier = currentIndex < TIERS.length - 1 ? TIERS[currentIndex + 1] : null;

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      progressPercent: 100,
      remainingWins: 0,
    };
  }

  const range = nextTier.minWins - currentTier.minWins;
  const currentInRange = wins - currentTier.minWins;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentInRange / range) * 100)));
  const remainingWins = Math.max(0, nextTier.minWins - wins);

  return {
    currentTier,
    nextTier,
    progressPercent,
    remainingWins,
  };
}
