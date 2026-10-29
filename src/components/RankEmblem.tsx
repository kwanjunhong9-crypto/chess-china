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

  // Dimension scaling
  const sizeMap = {
    xs: { width: 36, height: 26, fontSize: 8 },
    sm: { width: 56, height: 38, fontSize: 10 },
    md: { width: 88, height: 58, fontSize: 11 },
    lg: { width: 140, height: 92, fontSize: 13 },
    xl: { width: 200, height: 130, fontSize: 16 },
  };

  const { width, height } = sizeMap[size];

  // Specific color themes per tier (matching user reference image for Nemesis/Arch Nemesis)
  const getTheme = (id: string) => {
    switch (id) {
      case 'arch_nemesis':
        return {
          wingGradientId: 'wing_arch_nemesis',
          wingStart: '#ff4db8',
          wingEnd: '#7928ca',
          shieldRimStart: '#ffe259',
          shieldRimEnd: '#ffa751',
          shieldBase: '#2a0845',
          gemStart: '#f72585',
          gemEnd: '#7209b7',
          glow: '#d946ef',
          hasCrown: true,
        };
      case 'nemesis':
        // Exactly matches user reference image image_41a5a6bb.png!
        return {
          wingGradientId: 'wing_nemesis',
          wingStart: '#e879f9',
          wingEnd: '#9333ea',
          shieldRimStart: '#fde047',
          shieldRimEnd: '#ca8a04',
          shieldBase: '#3b0764',
          gemStart: '#c026d3',
          gemEnd: '#6b21a8',
          glow: '#c084fc',
          hasCrown: false,
        };
      case 'magma':
        return {
          wingGradientId: 'wing_magma',
          wingStart: '#f97316',
          wingEnd: '#dc2626',
          shieldRimStart: '#fdba74',
          shieldRimEnd: '#c2410c',
          shieldBase: '#431407',
          gemStart: '#ffedd5',
          gemEnd: '#ea580c',
          glow: '#ea580c',
          hasCrown: false,
        };
      case 'diamond':
        return {
          wingGradientId: 'wing_diamond',
          wingStart: '#a5f3fc',
          wingEnd: '#0284c7',
          shieldRimStart: '#e0f2fe',
          shieldRimEnd: '#0369a1',
          shieldBase: '#082f49',
          gemStart: '#bae6fd',
          gemEnd: '#0ea5e9',
          glow: '#38bdf8',
          hasCrown: false,
        };
      case 'gold':
        return {
          wingGradientId: 'wing_gold',
          wingStart: '#fef08a',
          wingEnd: '#d97706',
          shieldRimStart: '#fef9c3',
          shieldRimEnd: '#b45309',
          shieldBase: '#451a03',
          gemStart: '#ef4444',
          gemEnd: '#991b1b',
          glow: '#eab308',
          hasCrown: false,
        };
      case 'silver':
        return {
          wingGradientId: 'wing_silver',
          wingStart: '#f1f5f9',
          wingEnd: '#64748b',
          shieldRimStart: '#ffffff',
          shieldRimEnd: '#94a3b8',
          shieldBase: '#1e293b',
          gemStart: '#e2e8f0',
          gemEnd: '#475569',
          glow: '#cbd5e1',
          hasCrown: false,
        };
      case 'bronze':
        return {
          wingGradientId: 'wing_bronze',
          wingStart: '#fed7aa',
          wingEnd: '#9a3412',
          shieldRimStart: '#fcd34d',
          shieldRimEnd: '#78350f',
          shieldBase: '#291405',
          gemStart: '#f59e0b',
          gemEnd: '#78350f',
          glow: '#d97706',
          hasCrown: false,
        };
      default: // unranked
        return {
          wingGradientId: 'wing_unranked',
          wingStart: '#cbd5e1',
          wingEnd: '#475569',
          shieldRimStart: '#94a3b8',
          shieldRimEnd: '#334155',
          shieldBase: '#0f172a',
          gemStart: '#64748b',
          gemEnd: '#1e293b',
          glow: '#64748b',
          hasCrown: false,
        };
    }
  };

  const theme = getTheme(currentTier.id);

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:scale-105"
      >
        <defs>
          {/* Wing Gradients */}
          <linearGradient id={`grad_wing_l_${currentTier.id}`} x1="100%" y1="50%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={theme.wingEnd} />
            <stop offset="60%" stopColor={theme.wingStart} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id={`grad_wing_r_${currentTier.id}`} x1="0%" y1="50%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={theme.wingEnd} />
            <stop offset="60%" stopColor={theme.wingStart} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
          </linearGradient>

          {/* Shield Rim Gradient */}
          <linearGradient id={`grad_shield_${currentTier.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.shieldRimStart} />
            <stop offset="50%" stopColor={theme.shieldRimEnd} />
            <stop offset="100%" stopColor={theme.shieldRimStart} />
          </linearGradient>

          {/* Core Gem Gradient */}
          <linearGradient id={`grad_gem_${currentTier.id}`} x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor={theme.gemStart} />
            <stop offset="100%" stopColor={theme.gemEnd} />
          </linearGradient>

          {/* Subtle Glow Filter */}
          <filter id={`glow_${currentTier.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={theme.glow} floodOpacity="0.6" />
          </filter>
        </defs>

        {/* ================= LEFT SPREADING WING ================= */}
        <g filter={`url(#glow_${currentTier.id})`}>
          {/* Feather 1 (Top Long Feather) */}
          <path
            d="M 90 45 C 75 35, 40 22, 10 20 C 2 19, 0 25, 6 28 C 30 40, 60 52, 85 58 Z"
            fill={`url(#grad_wing_l_${currentTier.id})`}
          />
          {/* Feather 2 (Middle Feather) */}
          <path
            d="M 90 52 C 70 45, 35 38, 16 38 C 10 38, 8 45, 14 47 C 38 56, 68 64, 85 68 Z"
            fill={`url(#grad_wing_l_${currentTier.id})`}
            opacity="0.95"
          />
          {/* Feather 3 (Lower Feather) */}
          <path
            d="M 90 62 C 72 58, 48 55, 30 55 C 25 55, 23 62, 28 64 C 45 70, 72 75, 88 77 Z"
            fill={`url(#grad_wing_l_${currentTier.id})`}
            opacity="0.9"
          />
          {/* Feather 4 (Bottom Minor Feather) */}
          <path
            d="M 90 72 C 75 70, 58 70, 44 72 C 38 73, 38 79, 44 80 C 58 83, 76 84, 88 84 Z"
            fill={`url(#grad_wing_l_${currentTier.id})`}
            opacity="0.8"
          />
        </g>

        {/* ================= RIGHT SPREADING WING ================= */}
        <g filter={`url(#glow_${currentTier.id})`}>
          {/* Feather 1 (Top Long Feather) */}
          <path
            d="M 110 45 C 125 35, 160 22, 190 20 C 198 19, 200 25, 194 28 C 170 40, 140 52, 115 58 Z"
            fill={`url(#grad_wing_r_${currentTier.id})`}
          />
          {/* Feather 2 (Middle Feather) */}
          <path
            d="M 110 52 C 130 45, 165 38, 184 38 C 190 38, 192 45, 186 47 C 162 56, 132 64, 115 68 Z"
            fill={`url(#grad_wing_r_${currentTier.id})`}
            opacity="0.95"
          />
          {/* Feather 3 (Lower Feather) */}
          <path
            d="M 110 62 C 128 58, 152 55, 170 55 C 175 55, 177 62, 172 64 C 155 70, 128 75, 112 77 Z"
            fill={`url(#grad_wing_r_${currentTier.id})`}
            opacity="0.9"
          />
          {/* Feather 4 (Bottom Minor Feather) */}
          <path
            d="M 110 72 C 125 70, 142 70, 156 72 C 162 73, 162 79, 156 80 C 142 83, 124 84, 112 84 Z"
            fill={`url(#grad_wing_r_${currentTier.id})`}
            opacity="0.8"
          />
        </g>

        {/* ================= LOWER CHEVRON BRACKETS ================= */}
        <path
          d="M 68 96 L 76 108 L 88 108 L 78 96 Z"
          fill={`url(#grad_shield_${currentTier.id})`}
        />
        <path
          d="M 132 96 L 124 108 L 112 108 L 122 96 Z"
          fill={`url(#grad_shield_${currentTier.id})`}
        />

        {/* ================= CENTRAL SHIELD ================= */}
        {/* Shield Outer Gold/Metallic Frame */}
        <polygon
          points="100,26 138,34 132,78 100,104 68,78 62,34"
          fill={`url(#grad_shield_${currentTier.id})`}
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Shield Inner Dark Plate */}
        <polygon
          points="100,32 131,39 126,74 100,96 74,74 69,39"
          fill={theme.shieldBase}
        />

        {/* ================= FACETED INNER GEMSTONE ================= */}
        {/* Gem Base */}
        <polygon
          points="100,38 124,44 120,70 100,88 80,70 76,44"
          fill={`url(#grad_gem_${currentTier.id})`}
          stroke="#ffffff"
          strokeWidth="0.8"
        />

        {/* Gem Center Facet (Bright Highlight) */}
        <polygon
          points="100,44 116,49 112,66 100,78 88,66 84,49"
          fill="#ffffff"
          opacity="0.25"
        />

        {/* Gem Highlight Glare */}
        <path
          d="M 82 46 L 100 40 L 96 52 Z"
          fill="#ffffff"
          opacity="0.7"
        />

        {/* Arch Nemesis Extra Crown / Star Crest */}
        {theme.hasCrown && (
          <g filter={`url(#glow_${currentTier.id})`}>
            {/* Crown Tri-Peak */}
            <polygon
              points="100,14 107,24 118,17 114,28 86,28 82,17 93,24"
              fill="#fef08a"
              stroke="#ca8a04"
              strokeWidth="1"
            />
            {/* Crown Center Jewel */}
            <circle cx="100" cy="22" r="2.5" fill="#ec4899" />
          </g>
        )}
      </svg>

      {showLabel && (
        <div className="mt-1 flex flex-col items-center">
          <span className={`text-xs font-black tracking-wide ${currentTier.textColor}`}>
            {currentTier.name}
          </span>
          <span className="text-[10px] text-stone-400 font-mono">
            {currentTier.englishName} ({currentTier.minWins}-{currentTier.maxWins > 500 ? '320+' : currentTier.maxWins}胜)
          </span>
        </div>
      )}
    </div>
  );
};
