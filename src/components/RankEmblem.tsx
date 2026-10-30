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
  const currentTier = tier || (score !== undefined ? getTierByScore(score) : getTierByWins(wins ?? 0)) || {
    id: 'unranked',
    name: '未排名',
    englishName: 'Unranked',
    minScore: 0,
    maxScore: 100,
    minWins: 0,
    maxWins: 10,
    color: '#64748b',
    textColor: 'text-stone-400',
    badgeBg: 'bg-stone-800/90',
    badgeBorder: 'border-stone-600',
    shieldColor: '#52525b',
    wingColor: '#3f3f46',
    gemColor: '#71717a',
    description: '未排名',
  };

  // Square dimensions for round Chinese Chess piece shape
  const sizeMap: Record<string, { dim: number; fontSize: number; strokeWidth: number }> = {
    xs: { dim: 24, fontSize: 13, strokeWidth: 1.2 },
    sm: { dim: 34, fontSize: 18, strokeWidth: 1.6 },
    md: { dim: 48, fontSize: 26, strokeWidth: 2.2 },
    lg: { dim: 72, fontSize: 40, strokeWidth: 3 },
    xl: { dim: 96, fontSize: 52, strokeWidth: 3.8 },
  };

  const { dim, fontSize, strokeWidth } = sizeMap[size] || sizeMap.md;

  // 100% original Chinese Chess Piece Rank Palette
  // Colors strictly follow user requirements:
  // 未排名=灰色, 铜=褐色, 银=银色, 金=金色, 钻石=蓝钻色,
  // 岩浆=黑色岩石+橙色+红色, nemesis=紫色, archnemesis=黑+青色
  const getPieceTheme = (id: string) => {
    switch (id) {
      case 'arch_nemesis':
        return {
          id: 'arch_nemesis',
          nameZh: '至尊宿敌',
          tokenChar: '尊',
          rimColor: '#09090b', // 黑
          outerBorder: '#0d9488', // 青色
          innerBgStart: '#09090b', // 纯黑底
          innerBgEnd: '#042f2e', // 深青墨色
          carvedRing: '#2dd4bf', // 青亮车削环
          charColor: '#2dd4bf', // 青色书法
          glowColor: '#14b8a6',
        };
      case 'nemesis':
        return {
          id: 'nemesis',
          nameZh: '宿敌',
          tokenChar: '敌',
          rimColor: '#3b0764',
          outerBorder: '#9333ea', // 紫色
          innerBgStart: '#2e1065',
          innerBgEnd: '#170638',
          carvedRing: '#c084fc', // 紫色车削环
          charColor: '#e9d5ff', // 紫白书法
          glowColor: '#a855f7',
        };
      case 'magma':
        return {
          id: 'magma',
          nameZh: '岩浆',
          tokenChar: '浆',
          rimColor: '#1c1917', // 黑色岩石
          outerBorder: '#ea580c', // 橙色
          innerBgStart: '#1c1917', // 黑色岩石底
          innerBgEnd: '#450a0a', // 暗红
          carvedRing: '#ef4444', // 红色雕环
          charColor: '#fbbf24', // 烈焰橙黄书法
          glowColor: '#f97316',
        };
      case 'diamond':
        return {
          id: 'diamond',
          nameZh: '钻石',
          tokenChar: '钻',
          rimColor: '#083344',
          outerBorder: '#06b6d4', // 蓝钻色
          innerBgStart: '#0c4a6e',
          innerBgEnd: '#082f49',
          carvedRing: '#38bdf8', // 浅蓝雕环
          charColor: '#e0f2fe', // 晶蓝书法
          glowColor: '#06b6d4',
        };
      case 'gold':
        return {
          id: 'gold',
          nameZh: '黄金',
          tokenChar: '金',
          rimColor: '#451a03',
          outerBorder: '#eab308', // 金色
          innerBgStart: '#713f12',
          innerBgEnd: '#422006',
          carvedRing: '#fde047', // 亮金雕环
          charColor: '#fef08a', // 纯金书法
          glowColor: '#eab308',
        };
      case 'silver':
        return {
          id: 'silver',
          nameZh: '白银',
          tokenChar: '银',
          rimColor: '#1e293b',
          outerBorder: '#cbd5e1', // 银色
          innerBgStart: '#475569',
          innerBgEnd: '#1e293b',
          carvedRing: '#e2e8f0', // 银白雕环
          charColor: '#ffffff', // 银白书法
          glowColor: '#cbd5e1',
        };
      case 'bronze':
        return {
          id: 'bronze',
          nameZh: '青铜',
          tokenChar: '铜',
          rimColor: '#361804',
          outerBorder: '#854d0e', // 褐色
          innerBgStart: '#542d0a',
          innerBgEnd: '#291203',
          carvedRing: '#b45309', // 褐色雕环
          charColor: '#fed7aa', // 铜色书法
          glowColor: '#854d0e',
        };
      default: // unranked
        return {
          id: 'unranked',
          nameZh: '未排名',
          tokenChar: '未',
          rimColor: '#1f2937',
          outerBorder: '#64748b', // 灰色
          innerBgStart: '#374151',
          innerBgEnd: '#1f2937',
          carvedRing: '#94a3b8', // 灰色雕环
          charColor: '#cbd5e1', // 灰白书法
          glowColor: '#64748b',
        };
    }
  };

  const t = getPieceTheme(currentTier.id);

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      {/* Authentic Round Chinese Chess Piece SVG Disc (圆圆的中国象棋棋子造型) */}
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)] transition-transform duration-200 hover:scale-110 shrink-0"
      >
        <defs>
          {/* Subtle Outer Drop Glow */}
          <filter id={`piece_glow_${t.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="3" floodColor={t.glowColor} floodOpacity="0.6" />
          </filter>

          {/* Piece Body Radial Bevel */}
          <radialGradient id={`body_radial_${t.id}`} cx="42%" cy="38%" r="60%">
            <stop offset="0%" stopColor={t.innerBgStart} />
            <stop offset="85%" stopColor={t.innerBgEnd} />
            <stop offset="100%" stopColor="#0a0a0c" />
          </radialGradient>

          {/* Outer Wooden/Stone Bevel Edge */}
          <linearGradient id={`outer_rim_${t.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={t.outerBorder} />
            <stop offset="45%" stopColor={t.rimColor} />
            <stop offset="100%" stopColor="#050505" />
          </linearGradient>

          {/* Upper Specular Light Reflection */}
          <linearGradient id={`light_refl_${t.id}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Outer Circular Base (象棋木质/宝玉圆币外身) */}
        <circle
          cx="50"
          cy="50"
          r="47"
          fill={`url(#outer_rim_${t.id})`}
          stroke={t.outerBorder}
          strokeWidth="1.8"
          filter={`url(#piece_glow_${t.id})`}
        />

        {/* 2. Outer Beveled Shadow Ring */}
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="#000000"
          strokeOpacity="0.4"
          strokeWidth="1.2"
        />

        {/* 3. Inner Recessed Playing Disc (内陷圆形受墨盘) */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill={`url(#body_radial_${t.id})`}
        />

        {/* 4. Traditional Xiangqi Concentric Carved Groove (象棋经典车削双圈凹槽线) */}
        <circle
          cx="50"
          cy="50"
          r="37"
          fill="none"
          stroke={t.carvedRing}
          strokeWidth={strokeWidth}
          strokeOpacity="0.9"
        />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke={t.carvedRing}
          strokeWidth="0.8"
          strokeDasharray="2 1.5"
          strokeOpacity="0.65"
        />

        {/* 5. Delicate Top Light Arc Sheen */}
        <ellipse
          cx="50"
          cy="26"
          rx="24"
          ry="10"
          fill={`url(#light_refl_${t.id})`}
          pointerEvents="none"
        />

        {/* 6. Authentic Chinese Calligraphy Xiangqi Rank Character (正宗中国象棋端面楷体/魏碑体书法) */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fill={t.charColor}
          fontSize={fontSize}
          fontWeight="900"
          fontFamily="'STKaiti', 'KaiTi', 'SimSun', 'Noto Serif SC', serif"
          letterSpacing="0"
          className="select-none"
          style={{
            filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.85))`,
          }}
        >
          {t.tokenChar}
        </text>
      </svg>

      {showLabel && (
        <div className="mt-1 flex flex-col items-center text-center">
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
