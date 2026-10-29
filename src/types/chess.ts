export type PieceColor = 'red' | 'black';

export type PieceType = 
  | 'K' // 帅/将
  | 'A' // 仕/士
  | 'B' // 相/象
  | 'N' // 傌/馬
  | 'R' // 俥/車
  | 'C' // 炮/砲
  | 'P'; // 兵/卒

export interface Piece {
  type: PieceType;
  color: PieceColor;
  id: string;
}

export type BoardGrid = (Piece | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece | null;
  notation: string;
  fen: string;
  timestamp: string;
}

export interface Player {
  id: string;
  name: string;
  title?: string;
  avatar?: string;
  createdAt: string;
  // Ranked ladder stats
  rankScore: number;
  rankMatches: number;
  rankWins: number;
  rankLosses: number;
  rankDraws: number;
  rankStreak: number;
  bestRankScore: number;
  // Match casual stats
  matchScore: number;
  matchMatches: number;
  matchWins: number;
  matchLosses: number;
  matchDraws: number;
  matchStreak: number;
  bestMatchScore: number;
}

export interface MatchRecord {
  id: string;
  mode: 'ranked' | 'match';
  redPlayer: { id: string; name: string };
  blackPlayer: { id: string; name: string };
  startTime: string;
  endTime?: string;
  winner?: 'red' | 'black' | 'draw' | null;
  winReason?: string;
  moves: MoveRecord[];
  aiAnalysis?: string;
  ratingChanges?: {
    red: { before: number; after: number; change: number };
    black: { before: number; after: number; change: number };
  };
}

export interface MoveRecord {
  step: number;
  side: PieceColor;
  notation: string;
  fen: string;
  from: [number, number];
  to: [number, number];
  piece: string;
  captured?: string | null;
  timestamp: string;
}

export interface AIAnalysisResult {
  advantage: 'red' | 'black' | 'equal';
  advantageText: string;
  redWinProb: number;
  commentary: string;
  verdict: 'continue' | 'red_win' | 'black_win' | 'draw';
  verdictReason: string;
}
