import React from 'react';
import { BoardGrid, PieceColor, Position } from '../types/chess';
import { PIECE_NAMES, isKingInCheck } from '../utils/chessEngine';

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

  // Handle cell click
  const handleCellClick = (r: number, c: number) => {
    // Only admin can move/control pieces as requested: "只要admin的人能开匹配和排位 然后棋也是admin的人控制的"
    if (!isAdmin) return;

    const piece = board[r][c];
    const isLegalTarget = legalMoves.some(m => m.row === r && m.col === c);

    if (selectedPos) {
      if (isLegalTarget) {
        onMoveTo({ row: r, col: c });
      } else if (piece && piece.color === activeColor) {
        onSelectPiece({ row: r, col: c });
      } else {
        // Deselect if clicked outside
        onSelectPiece({ row: r, col: c });
      }
    } else {
      if (piece && piece.color === activeColor) {
        onSelectPiece({ row: r, col: c });
      }
    }
  };

  // Coordinates array
  const rowIndices = isFlipped ? [9, 8, 7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const colIndices = isFlipped ? [8, 7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="relative w-full max-w-[540px] mx-auto select-none">
      {/* Outer Wooden Board Frame */}
      <div className="relative p-2.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#8a531e] via-[#633a12] to-[#3f2208] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.2)] border-2 border-[#a16207]/40">
        
        {/* Inner Playing Surface */}
        <div className="relative aspect-[9/10] w-full rounded-xl bg-gradient-to-b from-[#eed4a6] via-[#e2c18d] to-[#d6af75] shadow-inner overflow-hidden border border-[#926027]">
          
          {/* Subtle Wood Grain Pattern Lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#7c4a16_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* SVG Chessboard Grid Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 900 1000"
            preserveAspectRatio="none"
          >
            {/* Board Border Margin */}
            <rect x="50" y="50" width="800" height="900" fill="none" stroke="#683d16" strokeWidth="4" />
            <rect x="42" y="42" width="816" height="916" fill="none" stroke="#683d16" strokeWidth="1.5" />

            {/* Horizontal Grid Lines */}
            {[50, 150, 250, 350, 450, 550, 650, 750, 850, 950].map((y, idx) => (
              <line key={`h-${idx}`} x1="50" y1={y} x2="850" y2={y} stroke="#683d16" strokeWidth="2.5" />
            ))}

            {/* Vertical Grid Lines: Left & Right border full length; intermediate lines broken by River */}
            <line x1="50" y1="50" x2="50" y2="950" stroke="#683d16" strokeWidth="2.5" />
            <line x1="850" y1="50" x2="850" y2="950" stroke="#683d16" strokeWidth="2.5" />

            {/* Black Side Vertical Lines (Row 0 to 4) */}
            {[150, 250, 350, 450, 550, 650, 750].map((x, idx) => (
              <line key={`v-top-${idx}`} x1={x} y1="50" x2={x} y2="450" stroke="#683d16" strokeWidth="2.5" />
            ))}

            {/* Red Side Vertical Lines (Row 5 to 9) */}
            {[150, 250, 350, 450, 550, 650, 750].map((x, idx) => (
              <line key={`v-bottom-${idx}`} x1={x} y1="550" x2={x} y2="950" stroke="#683d16" strokeWidth="2.5" />
            ))}

            {/* Nine Palaces (九宫) Diagonals */}
            {/* Top Palace (Black side) */}
            <line x1="350" y1="50" x2="550" y2="250" stroke="#683d16" strokeWidth="2" strokeDasharray="6 3" />
            <line x1="550" y1="50" x2="350" y2="250" stroke="#683d16" strokeWidth="2" strokeDasharray="6 3" />

            {/* Bottom Palace (Red side) */}
            <line x1="350" y1="750" x2="550" y2="950" stroke="#683d16" strokeWidth="2" strokeDasharray="6 3" />
            <line x1="550" y1="750" x2="350" y2="950" stroke="#683d16" strokeWidth="2" strokeDasharray="6 3" />

            {/* River Boundary Decorative Text */}
            <text
              x="250"
              y="512"
              fill="#7a461b"
              fontFamily="'STKaiti', 'KaiTi', 'SimSun', serif"
              fontSize="44"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="central"
              letterSpacing="16"
            >
              楚 河
            </text>
            <text
              x="650"
              y="512"
              fill="#7a461b"
              fontFamily="'STKaiti', 'KaiTi', 'SimSun', serif"
              fontSize="44"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="central"
              letterSpacing="16"
            >
              漢 界
            </text>
          </svg>

          {/* Interactive 10x9 Grid Overlay */}
          <div className="absolute inset-0 grid grid-rows-10 grid-cols-9 p-[5%]">
            {rowIndices.map((r) =>
              colIndices.map((c) => {
                const piece = board[r][c];
                const isSelected = selectedPos?.row === r && selectedPos?.col === c;
                const isLegalMove = legalMoves.some(m => m.row === r && m.col === c);
                const isLastMoveFrom = lastMove?.from.row === r && lastMove?.from.col === c;
                const isLastMoveTo = lastMove?.to.row === r && lastMove?.to.col === c;
                const isCheckedKing =
                  piece?.type === 'K' &&
                  ((piece.color === 'red' && redInCheck) || (piece.color === 'black' && blackInCheck));

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`relative flex items-center justify-center transition-all duration-150 ${
                      isAdmin ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    {/* Last Move Square Highlight */}
                    {(isLastMoveFrom || isLastMoveTo) && (
                      <div className="absolute inset-1 rounded-full border-2 border-amber-500/60 bg-amber-400/20 animate-pulse pointer-events-none" />
                    )}

                    {/* Legal Move Target Indicator */}
                    {isLegalMove && (
                      <div className="absolute z-20 flex items-center justify-center pointer-events-none">
                        {piece ? (
                          // Capture target: red pulsing ring
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-red-500 bg-red-500/25 animate-ping" />
                        ) : (
                          // Move target: green/jade dot
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-600/90 shadow-md ring-2 ring-emerald-300 ring-offset-1" />
                        )}
                      </div>
                    )}

                    {/* Chess Piece Rendering */}
                    {piece && (
                      <div
                        className={`relative z-10 w-[84%] h-[84%] max-w-[48px] max-h-[48px] rounded-full flex items-center justify-center transition-transform select-none shadow-[0_5px_12px_rgba(0,0,0,0.45)] ${
                          isSelected
                            ? 'scale-115 ring-4 ring-amber-400 -translate-y-1 z-30 shadow-[0_12px_24px_rgba(0,0,0,0.6)]'
                            : ''
                        } ${
                          isCheckedKing ? 'ring-4 ring-red-600 animate-bounce' : ''
                        } ${
                          piece.color === 'red'
                            ? 'bg-gradient-to-br from-[#fff7ed] via-[#fed7aa] to-[#ea580c] border border-[#ea580c]/60'
                            : 'bg-gradient-to-br from-[#f8fafc] via-[#cbd5e1] to-[#475569] border border-[#334155]/60'
                        }`}
                      >
                        {/* Piece Inner Rim */}
                        <div
                          className={`w-[86%] h-[86%] rounded-full flex items-center justify-center border ${
                            piece.color === 'red'
                              ? 'border-red-600/60 bg-gradient-to-b from-[#fffbeb] to-[#ffedd5]'
                              : 'border-stone-800/60 bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0]'
                          }`}
                        >
                          {/* Chinese Piece Character */}
                          <span
                            className={`font-serif font-black leading-none text-base sm:text-xl md:text-2xl drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] ${
                              piece.color === 'red'
                                ? 'text-red-700'
                                : 'text-stone-900'
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

        {/* Board Bottom Coordinates Label Bar */}
        <div className="mt-2 flex justify-between px-3 text-[11px] sm:text-xs text-amber-200/70 font-serif">
          <span>红方 (执红先手)</span>
          <span>楚河汉界 · 华夏棋规</span>
          <span>黑方 (执黑后手)</span>
        </div>
      </div>
    </div>
  );
};
