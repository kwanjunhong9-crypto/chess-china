import React from 'react';
import { BoardGrid, PieceColor, Position } from '../types/chess';
import { PIECE_NAMES, isKingInCheck, getAllLegalMoves } from '../utils/chessEngine';

interface Props {
  board: BoardGrid;
  selectedPos: Position | null;
  legalMoves: Position[];
  lastMove: { from: Position; to: Position } | null;
  isAdmin: boolean;
  activeColor: PieceColor;
  onSelectPiece: (pos: Position) => void;
  onMoveTo: (pos: Position) => void;
  isFlipped?: boolean;
}

export const ChessBoard: React.FC<Props> = ({
  board,
  selectedPos,
  legalMoves,
  lastMove,
  isAdmin,
  activeColor,
  onSelectPiece,
  onMoveTo,
  isFlipped = false,
}) => {
  const redInCheck = isKingInCheck(board, 'red');
  const blackInCheck = isKingInCheck(board, 'black');
  const activeLegalCount = getAllLegalMoves(board, activeColor).length;
  const isCheckmated = activeLegalCount === 0 && (activeColor === 'red' ? redInCheck : blackInCheck);
  const isStalemated = activeLegalCount === 0 && !(activeColor === 'red' ? redInCheck : blackInCheck);

  // Handle intersection click
  const handleIntersectionClick = (r: number, c: number) => {
    if (!isAdmin) return;

    const piece = board[r][c];
    const isLegalTarget = legalMoves.some(m => m.row === r && m.col === c);

    if (selectedPos) {
      if (isLegalTarget) {
        onMoveTo({ row: r, col: c });
      } else if (piece && piece.color === activeColor) {
        onSelectPiece({ row: r, col: c });
      } else {
        onSelectPiece({ row: r, col: c });
      }
    } else {
      if (piece && piece.color === activeColor) {
        onSelectPiece({ row: r, col: c });
      }
    }
  };

  // Convert row, col (0..9, 0..8) to exact percentage on 900x1000 board
  const getCoordinates = (r: number, c: number) => {
    const actualR = isFlipped ? 9 - r : r;
    const actualC = isFlipped ? 8 - c : c;
    const leftPercent = ((50 + actualC * 100) / 900) * 100;
    const topPercent = ((50 + actualR * 100) / 1000) * 100;
    return { left: `${leftPercent}%`, top: `${topPercent}%` };
  };

  return (
    <div className="relative w-full max-w-[520px] mx-auto select-none">
      {/* Outer Wooden Board Frame with luxury carved bevel */}
      <div className="relative p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#8a531e] via-[#633a12] to-[#3a1e06] shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.25)] border-2 border-[#a16207]/50">
        
        {/* Inner Playing Surface (Aspect Ratio 9:10 for 900x1000 SVG) */}
        <div className="relative aspect-[9/10] w-full rounded-xl bg-gradient-to-b from-[#f5dfb8] via-[#e8cb9b] to-[#dcbf8a] shadow-inner overflow-hidden border border-[#85511b]">
          
          {/* Subtle Authentic Wood Grain Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#7c4a16_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* SVG Chessboard Grid Lines (Official 9x10 Intersections) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 900 1000"
            preserveAspectRatio="none"
          >
            {/* Outer Boundary Frame */}
            <rect x="50" y="50" width="800" height="900" fill="none" stroke="#683d16" strokeWidth="3.5" />
            <rect x="42" y="42" width="816" height="916" fill="none" stroke="#683d16" strokeWidth="1.2" opacity="0.8" />

            {/* 10 Horizontal Lines (y = 50 to 950) */}
            {[50, 150, 250, 350, 450, 550, 650, 750, 850, 950].map((y, idx) => (
              <line key={`h-${idx}`} x1="50" y1={y} x2="850" y2={y} stroke="#683d16" strokeWidth="2.2" />
            ))}

            {/* 9 Vertical Lines: Outer 2 lines run full length; inner 7 lines break across River */}
            <line x1="50" y1="50" x2="50" y2="950" stroke="#683d16" strokeWidth="2.2" />
            <line x1="850" y1="50" x2="850" y2="950" stroke="#683d16" strokeWidth="2.2" />

            {/* Top Half Vertical Lines (Black side, row 0 to 4) */}
            {[150, 250, 350, 450, 550, 650, 750].map((x, idx) => (
              <line key={`v-top-${idx}`} x1={x} y1="50" x2={x} y2="450" stroke="#683d16" strokeWidth="2.2" />
            ))}

            {/* Bottom Half Vertical Lines (Red side, row 5 to 9) */}
            {[150, 250, 350, 450, 550, 650, 750].map((x, idx) => (
              <line key={`v-bottom-${idx}`} x1={x} y1="550" x2={x} y2="950" stroke="#683d16" strokeWidth="2.2" />
            ))}

            {/* Nine Palaces (九宫格) Diagonals */}
            {/* Black Palace: (350, 50) to (550, 250) and (550, 50) to (350, 250), cross at (450, 150) */}
            <line x1="350" y1="50" x2="550" y2="250" stroke="#683d16" strokeWidth="2" strokeDasharray="5 3" />
            <line x1="550" y1="50" x2="350" y2="250" stroke="#683d16" strokeWidth="2" strokeDasharray="5 3" />

            {/* Red Palace: (350, 750) to (550, 950) and (550, 750) to (350, 950), cross at (450, 850) */}
            <line x1="350" y1="750" x2="550" y2="950" stroke="#683d16" strokeWidth="2" strokeDasharray="5 3" />
            <line x1="550" y1="750" x2="350" y2="950" stroke="#683d16" strokeWidth="2" strokeDasharray="5 3" />

            {/* Chu River and Han Boundary Calligraphy Text */}
            <text
              x="250"
              y="505"
              fill="#7a461b"
              fontFamily="'STKaiti', 'KaiTi', 'SimSun', serif"
              fontSize="40"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="central"
              letterSpacing="18"
            >
              楚 河
            </text>
            <text
              x="650"
              y="505"
              fill="#7a461b"
              fontFamily="'STKaiti', 'KaiTi', 'SimSun', serif"
              fontSize="40"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="central"
              letterSpacing="18"
            >
              漢 界
            </text>
          </svg>

          {/* Interactive Pieces and Intersections Layer */}
          <div className="absolute inset-0 pointer-events-auto">
            {board.map((rowArr, r) =>
              rowArr.map((piece, c) => {
                const isSelected = selectedPos?.row === r && selectedPos?.col === c;
                const isLegalMove = legalMoves.some(m => m.row === r && m.col === c);
                const isLastMoveFrom = lastMove?.from.row === r && lastMove?.from.col === c;
                const isLastMoveTo = lastMove?.to.row === r && lastMove?.to.col === c;
                const isCheckedKing =
                  piece?.type === 'K' &&
                  ((piece.color === 'red' && redInCheck) || (piece.color === 'black' && blackInCheck));

                const { left, top } = getCoordinates(r, c);

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleIntersectionClick(r, c)}
                    style={{ left, top }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center aspect-square w-[10%] max-w-[46px] min-w-[34px] z-20 ${
                      isAdmin ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    {/* Last Move Indicator Ring */}
                    {(isLastMoveFrom || isLastMoveTo) && (
                      <div className="absolute inset-[-4px] rounded-full border-2 border-amber-500 bg-amber-400/25 animate-pulse pointer-events-none" />
                    )}

                    {/* Legal Target Move Indicator */}
                    {isLegalMove && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                        {piece ? (
                          <div className="w-full h-full rounded-full border-2 border-red-500 bg-red-500/30 animate-ping" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 shadow-md ring-2 ring-emerald-300 ring-offset-1" />
                        )}
                      </div>
                    )}

                    {/* Chinese Chess Piece (Strictly 1:1 Aspect-Square Circle) */}
                    {piece && (
                      <div
                        className={`relative w-full aspect-square rounded-full flex items-center justify-center transition-transform select-none shadow-[0_4px_10px_rgba(0,0,0,0.5)] ${
                          isSelected
                            ? 'scale-115 ring-4 ring-amber-400 -translate-y-1 z-40 shadow-[0_12px_22px_rgba(0,0,0,0.7)]'
                            : ''
                        } ${
                          isCheckedKing ? 'ring-4 ring-red-600 animate-bounce z-30' : ''
                        } ${
                          piece.color === 'red'
                            ? 'bg-gradient-to-br from-[#fff7ed] via-[#fed7aa] to-[#ea580c] border border-[#c2410c]'
                            : 'bg-gradient-to-br from-[#f8fafc] via-[#cbd5e1] to-[#475569] border border-[#1e293b]'
                        }`}
                      >
                        {/* Piece Inner Rim Bevel */}
                        <div
                          className={`w-[88%] aspect-square rounded-full flex items-center justify-center border shadow-inner ${
                            piece.color === 'red'
                              ? 'border-red-600/70 bg-gradient-to-b from-[#fffbeb] to-[#ffedd5]'
                              : 'border-stone-800/80 bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0]'
                          }`}
                        >
                          {/* Chinese Calligraphy Character */}
                          <span
                            className={`font-serif font-black leading-none text-base sm:text-xl drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)] ${
                              piece.color === 'red' ? 'text-red-700' : 'text-stone-900'
                            }`}
                          >
                            {PIECE_NAMES[piece.color][piece.type]}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Checkmate / Stalemate / Check Alert Banner */}
        {(isCheckmated || isStalemated || redInCheck || blackInCheck) && (
          <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-bold flex items-center justify-between animate-pulse shadow-md">
            <span>
              {isCheckmated
                ? `⚡ 绝杀将死！${activeColor === 'red' ? '红方' : '黑方'}无棋可逃亦无子能挡，攻方胜出！`
                : isStalemated
                ? `⚠️ 困毙裁决！${activeColor === 'red' ? '红方' : '黑方'}无路可走依例判负！`
                : redInCheck
                ? '⚔️ 红方主帅正被将军！请走棋化解！'
                : '⚔️ 黑方主将正被将军！请走棋化解！'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-800 text-white font-mono">
              {isCheckmated ? '将死' : isStalemated ? '困毙' : '将军'}
            </span>
          </div>
        )}

        {/* Board Bottom Coordinates Label Bar */}
        <div className="mt-2 flex justify-between px-3 text-[11px] sm:text-xs text-amber-200/80 font-serif">
          <span>红方 (帅居中位 · 兵正冲锋)</span>
          <span>楚河汉界 · 点位交叉规制</span>
          <span>黑方 (将守九宫 · 卒巡关隘)</span>
        </div>
      </div>
    </div>
  );
};
