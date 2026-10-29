import React from 'react';
import { TierInfo, getTierByScore, getTierByWins } from '../utils/tierSystem';

interface Props {
  tier?: TierInfo;
  wins?: number;
  score?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

export const RankEmblem: React.FC<Props> = ({
  tier,
  wins,
  score,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const currentTier = tier || (score !== undefined ? getTierByScore(score) : getTierByWins(wins ?? 0));

  // Scale map
  const sizeMap = {
    xs: { width: 34, height: 26 },
    sm: { width: 52, height: 38 },
    md: { width: 84, height: 58 },
    lg: { width: 130, height: 88 },
    xl: { width: 180, height: 120 },
  };

  const { width, height } = sizeMap[size];

  // 100% original, copyright-free Chinese Chess theme palette
  // Colors strictly follow user requirements: 未排名=灰色, 铜=褐色, 银=银白
  const getTheme = (id: string) => {
    switch (id) {
      case 'arch_nemesis':
        return {
          id: 'arch_nemesis',
          nameZh: '至尊宿敌',
          tokenChar: '圣',
          primary: '#0d9488', // 青色
          secondary: '#09090b', // 黑色
          accent: '#2dd4bf', // 青亮
          glow: '#14b8a6',
          bgBase: '#09090b', // 黑
          borderGradStart: '#2dd4bf',
          borderGradEnd: '#042f2e',
        };
      case 'nemesis':
        return {
          id: 'nemesis',
          nameZh: '宿敌',
          tokenChar: '敌',
          primary: '#a855f7', // 紫色
          secondary: '#581c87',
          accent: '#c084fc',
          glow: '#9333ea',
          bgBase: '#2e1065',
          borderGradStart: '#c084fc',
          borderGradEnd: '#7e22ce',
        };
      case 'magma':
        return {
          id: 'magma',
          nameZh: '岩浆',
          tokenChar: '焱',
          primary: '#ea580c', // 橙色
          secondary: '#1c1917', // 黑色岩石
          accent: '#ef4444', // 红色
          glow: '#f97316',
          bgBase: '#1c1917', // 黑色岩石基底
          borderGradStart: '#ea580c', // 橙
          borderGradEnd: '#ef4444', // 红
        };
      case 'diamond':
        return {
          id: 'diamond',
          nameZh: '钻石',
          tokenChar: '晶',
          primary: '#0ea5e9',
          secondary: '#0369a1',
          accent: '#bae6fd',
          glow: '#38bdf8',
          bgBase: '#082f49',
          borderGradStart: '#f0f9ff',
          borderGradEnd: '#0284c7',
        };
      case 'gold':
        return {
          id: 'gold',
          nameZh: '黄金',
          tokenChar: '金',
          primary: '#eab308',
          secondary: '#a16207',
          accent: '#fef9c3',
          glow: '#f59e0b',
          bgBase: '#422006',
          borderGradStart: '#fef08a',
          borderGradEnd: '#ca8a04',
        };
      case 'silver':
        return {
          id: 'silver',
          nameZh: '银',
          tokenChar: '银',
          primary: '#cbd5e1',
          secondary: '#64748b',
          accent: '#ffffff',
          glow: '#cbd5e1',
          bgBase: '#1e293b',
          borderGradStart: '#ffffff',
          borderGradEnd: '#94a3b8',
        };
      case 'bronze':
        return {
          id: 'bronze',
          nameZh: '铜',
          tokenChar: '铜',
          primary: '#854d0e', // 褐色
          secondary: '#451a03',
          accent: '#d97706',
          glow: '#b45309',
          bgBase: '#261205',
          borderGradStart: '#fed7aa',
          borderGradEnd: '#78350f',
        };
      default: // unranked
        return {
          id: 'unranked',
          nameZh: '未排名',
          tokenChar: '棋',
          primary: '#64748b', // 灰色
          secondary: '#334155',
          accent: '#94a3b8',
          glow: '#52525b',
          bgBase: '#18181b',
          borderGradStart: '#a1a1aa',
          borderGradEnd: '#3f3f46',
        };
    }
  };

  const t = getTheme(currentTier.id);

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 180 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Main Aura Glow */}
          <filter id={`emblem_glow_${t.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor={t.glow} floodOpacity="0.75" />
          </filter>

          {/* Left Wing Gradient */}
          <linearGradient id={`wing_l_${t.id}`} x1="100%" y1="50%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={t.secondary} />
            <stop offset="60%" stopColor={t.primary} />
            <stop offset="100%" stopColor={t.accent} />
          </linearGradient>

          {/* Right Wing Gradient */}
          <linearGradient id={`wing_r_${t.id}`} x1="0%" y1="50%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={t.secondary} />
            <stop offset="60%" stopColor={t.primary} />
            <stop offset="100%" stopColor={t.accent} />
          </linearGradient>

          {/* Shield Rim Gradient */}
          <linearGradient id={`shield_grad_${t.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={t.borderGradStart} />
            <stop offset="50%" stopColor={t.primary} />
            <stop offset="100%" stopColor={t.borderGradEnd} />
          </linearGradient>

          {/* Disc Radial Gradient */}
          <radialGradient id={`disc_grad_${t.id}`} cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor={t.accent} stopOpacity="0.4" />
            <stop offset="70%" stopColor={t.bgBase} />
            <stop offset="100%" stopColor="#0c0a09" />
          </radialGradient>
        </defs>

        {/* 100% ORIGINAL CHINESE CHESS WINGED EMBLEM (NO EXTERNAL/COPYRIGHT ASSETS) */}
        
        {/* Left Wing Flanges */}
        <g filter={`url(#emblem_glow_${t.id})`}>
          {/* Tier 1 Primary Feather Blade */}
          <path
            d="M 80 44 C 64 34, 32 20, 8 20 C 0 20, 0 27, 6 30 C 26 40, 56 50, 76 56 Z"
            fill={`url(#wing_l_${t.id})`}
          />
          {/* Tier 2 Secondary Blade */}
          <path
            d="M 80 54 C 62 48, 30 40, 14 42 C 8 43, 8 50, 14 52 C 34 58, 62 66, 76 68 Z"
            fill={`url(#wing_l_${t.id})`}
            opacity="0.9"
          />
          {/* Tier 3 Lower Tail Wing */}
          <path
            d="M 80 66 C 66 64, 44 62, 28 65 C 22 66, 22 72, 28 73 C 44 76, 64 78, 76 78 Z"
            fill={`url(#wing_l_${t.id})`}
            opacity="0.75"
          />
        </g>

        {/* Right Wing Flanges */}
        <g filter={`url(#emblem_glow_${t.id})`}>
          {/* Tier 1 Primary Feather Blade */}
          <path
            d="M 100 44 C 116 34, 148 20, 172 20 C 180 20, 180 27, 174 30 C 154 40, 124 50, 104 56 Z"
            fill={`url(#wing_r_${t.id})`}
          />
          {/* Tier 2 Secondary Blade */}
          <path
            d="M 100 54 C 118 48, 150 40, 166 42 C 172 43, 172 50, 166 52 C 146 58, 118 66, 104 68 Z"
            fill={`url(#wing_r_${t.id})`}
            opacity="0.9"
          />
          {/* Tier 3 Lower Tail Wing */}
          <path
            d="M 100 66 C 114 64, 136 62, 152 65 C 158 66, 158 72, 152 73 C 136 76, 116 78, 104 78 Z"
            fill={`url(#wing_r_${t.id})`}
            opacity="0.75"
          />
        </g>

        {/* Lower Banner Ribbon Support */}
        <path
          d="M 64 90 L 74 104 L 90 98 L 106 104 L 116 90 L 104 94 L 90 90 L 76 94 Z"
          fill={`url(#shield_grad_${t.id})`}
          opacity="0.85"
        />

        {/* Central Shield Octagon Outer Frame */}
        <polygon
          points="90,16 122,28 126,72 90,102 54,72 58,28"
          fill={`url(#shield_grad_${t.id})`}
          stroke={t.accent}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Central Shield Inner Recess */}
        <polygon
          points="90,22 116,32 120,68 90,94 60,68 64,32"
          fill={`url(#disc_grad_${t.id})`}
        />

        {/* Traditional Chinese Chess (中国象棋) Medallion Ring */}
        <circle
          cx="90"
          cy="56"
          r="26"
          fill="none"
          stroke={`url(#shield_grad_${t.id})`}
          strokeWidth="2.5"
        />
        <circle
          cx="90"
          cy="56"
          r="22"
          fill={t.bgBase}
          stroke={t.accent}
          strokeWidth="0.8"
          strokeDasharray="2 1.5"
        />

        {/* Central Calligraphy Character (e.g. 棋, 铜, 银, 金, 晶, 焱, 敌, 圣) */}
        <text
          x="90"
          y="63"
          textAnchor="middle"
          fill={t.accent}
          fontSize="18"
          fontWeight="900"
          fontFamily="serif"
          className="select-none"
          style={{ textShadow: `0 0 6px ${t.glow}` }}
        >
          {t.tokenChar}
        </text>

        {/* Arch Nemesis Extra Crest Crown */}
        {t.id === 'arch_nemesis' && (
          <g filter={`url(#emblem_glow_${t.id})`}>
            <polygon
              points="90,4 97,14 108,8 104,18 76,18 72,8 83,14"
              fill="#fef08a"
              stroke="#eab308"
              strokeWidth="0.8"
            />
            <circle cx="90" cy="11" r="2" fill="#ec4899" />
          </g>
        )}
      </svg>

      {showLabel && (
        <div className="mt-1 flex flex-col items-center">
          <span className={`text-xs font-black tracking-wide ${currentTier.textColor}`}>
            {currentTier.name}
          </span>
          <span className="text-[10px] text-stone-400 font-mono">
            {currentTier.englishName} ({currentTier.minScore}分)
          </span>
        </div>
      )}
    </div>
  );
};
