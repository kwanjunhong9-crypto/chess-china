import { BoardGrid, Move, Piece, PieceColor, PieceType, Position } from '../types/chess';

export const PIECE_NAMES: Record<PieceColor, Record<PieceType, string>> = {
  red: {
    K: '帥',
    A: '仕',
    B: '相',
    N: '傌',
    R: '俥',
    C: '炮',
    P: '兵',
  },
  black: {
    K: '將',
    A: '士',
    B: '象',
    N: '馬',
    R: '車',
    C: '砲',
    P: '卒',
  },
};

export const CHINESE_NUM_RED = ['九', '八', '七', '六', '五', '四', '三', '二', '一'];
export const CHINESE_NUM_BLACK = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function createInitialBoard(): BoardGrid {
  const board: BoardGrid = Array(10).fill(null).map(() => Array(9).fill(null));

  // Black pieces (row 0-3)
  const blackRow0: PieceType[] = ['R', 'N', 'B', 'A', 'K', 'A', 'B', 'N', 'R'];
  blackRow0.forEach((type, col) => {
    board[0][col] = { type, color: 'black', id: `b_r0_c${col}` };
  });

  board[2][1] = { type: 'C', color: 'black', id: 'b_c_1' };
  board[2][7] = { type: 'C', color: 'black', id: 'b_c_7' };

  for (let c = 0; c < 9; c += 2) {
    board[3][c] = { type: 'P', color: 'black', id: `b_p_${c}` };
  }

  // Red pieces (row 6-9)
  for (let c = 0; c < 9; c += 2) {
    board[6][c] = { type: 'P', color: 'red', id: `r_p_${c}` };
  }

  board[7][1] = { type: 'C', color: 'red', id: 'r_c_1' };
  board[7][7] = { type: 'C', color: 'red', id: 'r_c_7' };

  const redRow9: PieceType[] = ['R', 'N', 'B', 'A', 'K', 'A', 'B', 'N', 'R'];
  redRow9.forEach((type, col) => {
    board[9][col] = { type, color: 'red', id: `r_r9_c${col}` };
  });

  return board;
}

export function cloneBoard(board: BoardGrid): BoardGrid {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

// Check if position is inside board
export function isInsideBoard(row: number, col: number): boolean {
  return row >= 0 && row < 10 && col >= 0 && col < 9;
}

// Check if position is inside palace (九宫)
export function isInsidePalace(row: number, col: number, color: PieceColor): boolean {
  if (col < 3 || col > 5) return false;
  if (color === 'red') {
    return row >= 7 && row <= 9;
  } else {
    return row >= 0 && row <= 2;
  }
}

// Check if King face-to-face (飞将/对脸将)
export function isKingFacing(board: BoardGrid): boolean {
  let redKingPos: Position | null = null;
  let blackKingPos: Position | null = null;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p?.type === 'K') {
        if (p.color === 'red') redKingPos = { row: r, col: c };
        else blackKingPos = { row: r, col: c };
      }
    }
  }

  if (!redKingPos || !blackKingPos) return false;
  if (redKingPos.col !== blackKingPos.col) return false;

  const col = redKingPos.col;
  const startRow = Math.min(redKingPos.row, blackKingPos.row) + 1;
  const endRow = Math.max(redKingPos.row, blackKingPos.row);

  for (let r = startRow; r < endRow; r++) {
    if (board[r][col] !== null) return false;
  }
  return true;
}

// Direct attack detection on a target square without recursive legal moves
export function isSquareUnderAttack(board: BoardGrid, target: Position, attackerColor: PieceColor): boolean {
  const { row: tr, col: tc } = target;

  // 1. Orthogonal rays: Chariot (R), Cannon (C), and King Face-to-Face (K)
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of dirs) {
    let r = tr + dr;
    let c = tc + dc;
    let piecesBetween = 0;

    while (r >= 0 && r < 10 && c >= 0 && c < 9) {
      const p = board[r][c];
      if (p !== null) {
        if (p.color === attackerColor) {
          if (piecesBetween === 0) {
            // Chariot attacks with 0 obstacles
            if (p.type === 'R') return true;
            // King face-to-face along file with 0 obstacles
            if (p.type === 'K' && dc === 0) return true;
          } else if (piecesBetween === 1) {
            // Cannon attacks over exactly 1 piece (screen / 炮架)
            if (p.type === 'C') return true;
          }
        }
        piecesBetween++;
        if (piecesBetween > 1) break; // Beyond 1 obstacle, cannon cannot attack either
      }
      r += dr;
      c += dc;
    }
  }

  // 2. Horse (N) attacks: check 8 possible origins around target
  const horseDeltas = [
    { dr: -2, dc: -1, legR: -1, legC: 0 },
    { dr: -2, dc: 1, legR: -1, legC: 0 },
    { dr: 2, dc: -1, legR: 1, legC: 0 },
    { dr: 2, dc: 1, legR: 1, legC: 0 },
    { dr: -1, dc: -2, legR: 0, legC: -1 },
    { dr: 1, dc: -2, legR: 0, legC: -1 },
    { dr: -1, dc: 2, legR: 0, legC: 1 },
    { dr: 1, dc: 2, legR: 0, legC: 1 },
  ];
  for (const { dr, dc, legR, legC } of horseDeltas) {
    const hr = tr + dr;
    const hc = tc + dc;
    if (hr >= 0 && hr < 10 && hc >= 0 && hc < 9) {
      const p = board[hr][hc];
      if (p && p.color === attackerColor && p.type === 'N') {
        // Horse leg is relative to horse position
        const lr = hr - legR;
        const lc = hc - legC;
        if (board[lr][lc] === null) {
          return true;
        }
      }
    }
  }

  // 3. Soldier (P) attacks
  if (attackerColor === 'red') {
    // Red soldier moves up (row - 1), so it attacks (tr, tc) from (tr + 1, tc)
    if (tr + 1 < 10) {
      const p = board[tr + 1][tc];
      if (p && p.color === 'red' && p.type === 'P') return true;
    }
    // If crossed river (tr <= 4), red soldier can also attack horizontally
    if (tr <= 4) {
      if (tc - 1 >= 0) {
        const p = board[tr][tc - 1];
        if (p && p.color === 'red' && p.type === 'P') return true;
      }
      if (tc + 1 < 9) {
        const p = board[tr][tc + 1];
        if (p && p.color === 'red' && p.type === 'P') return true;
      }
    }
  } else {
    // Black soldier moves down (row + 1), so it attacks (tr, tc) from (tr - 1, tc)
    if (tr - 1 >= 0) {
      const p = board[tr - 1][tc];
      if (p && p.color === 'black' && p.type === 'P') return true;
    }
    // If crossed river (tr >= 5), black soldier can also attack horizontally
    if (tr >= 5) {
      if (tc - 1 >= 0) {
        const p = board[tr][tc - 1];
        if (p && p.color === 'black' && p.type === 'P') return true;
      }
      if (tc + 1 < 9) {
        const p = board[tr][tc + 1];
        if (p && p.color === 'black' && p.type === 'P') return true;
      }
    }
  }

  // 4. King (K) 1 step in palace
  const kingDeltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of kingDeltas) {
    const kr = tr + dr;
    const kc = tc + dc;
    if (kr >= 0 && kr < 10 && kc >= 0 && kc < 9) {
      const p = board[kr][kc];
      if (p && p.color === attackerColor && p.type === 'K') {
        return true;
      }
    }
  }

  return false;
}

// Check if King of given color is currently in check (将军)
export function isKingInCheck(board: BoardGrid, color: PieceColor): boolean {
  let kingPos: Position | null = null;
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p?.type === 'K' && p.color === color) {
        kingPos = { row: r, col: c };
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return true; // Captured / Missing

  const opponentColor: PieceColor = color === 'red' ? 'black' : 'red';
  return isSquareUnderAttack(board, kingPos, opponentColor);
}

// Get all legal moves for a given side across the entire board
export function getAllLegalMoves(board: BoardGrid, color: PieceColor): Array<{ from: Position; to: Position }> {
  const allMoves: Array<{ from: Position; to: Position }> = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const moves = getLegalMoves(board, { row: r, col: c });
        for (const m of moves) {
          allMoves.push({ from: { row: r, col: c }, to: m });
        }
      }
    }
  }
  return allMoves;
}

// Detect game over status: Checkmate (将死) or Stalemate (困毙)
// "一旦没棋可以保护和逃跑请认定将死那个人的赢"
export function checkGameOverStatus(
  board: BoardGrid,
  nextTurnColor: PieceColor
): {
  isOver: boolean;
  winner: PieceColor | null;
  isCheckmate: boolean;
  isStalemate: boolean;
  reason: string;
  commentary: string;
} {
  const legalMoves = getAllLegalMoves(board, nextTurnColor);
  if (legalMoves.length > 0) {
    return {
      isOver: false,
      winner: null,
      isCheckmate: false,
      isStalemate: false,
      reason: '',
      commentary: '',
    };
  }

  // 0 legal moves available: the defending player has no moves to run or defend
  const winnerColor: PieceColor = nextTurnColor === 'red' ? 'black' : 'red';
  const inCheck = isKingInCheck(board, nextTurnColor);

  const defenderName = nextTurnColor === 'red' ? '红方' : '黑方';
  const winnerName = winnerColor === 'red' ? '红方' : '黑方';

  if (inCheck) {
    // Checkmate (将死/绝杀)
    return {
      isOver: true,
      winner: winnerColor,
      isCheckmate: true,
      isStalemate: false,
      reason: `绝杀将死 (${defenderName}无棋可逃亦无子能挡)`,
      commentary: `${winnerName}雷霆重炮/兵马绝杀，${defenderName}主帅无路可逃且无棋能救，${winnerName}绝杀获胜！`,
    };
  } else {
    // Stalemate (困毙: 中国象棋规则中，无子可走方判负)
    return {
      isOver: true,
      winner: winnerColor,
      isCheckmate: false,
      isStalemate: true,
      reason: `困毙裁决 (${defenderName}全盘无子可动亦判负)`,
      commentary: `${winnerName}封锁要道，${defenderName}虽未被将军但已无子可动（困毙），依象棋正规赛例裁定${winnerName}胜！`,
    };
  }
}

// Generate legal moves for a given position strictly enforcing Chinese Chess rules
export function getLegalMoves(board: BoardGrid, pos: Position): Position[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const moves: Position[] = [];
  const { row, col } = pos;
  const color = piece.color;

  const addIfValid = (targetRow: number, targetCol: number) => {
    if (!isInsideBoard(targetRow, targetCol)) return;
    const target = board[targetRow][targetCol];
    if (!target || target.color !== color) {
      // Simulate move to ensure King is never in check and no King face-to-face
      const testBoard = cloneBoard(board);
      testBoard[targetRow][targetCol] = testBoard[row][col];
      testBoard[row][col] = null;

      // 1. Prohibit King face-to-face (飞将/对脸将)
      if (isKingFacing(testBoard)) return;

      // 2. Prohibit leaving or placing own King in check (送将/不可处于被将状态)
      if (isKingInCheck(testBoard, color)) return;

      // Valid legal move!
      moves.push({ row: targetRow, col: targetCol });
    }
  };

  switch (piece.type) {
    case 'K': {
      // Orthogonal 1 step inside palace
      const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      deltas.forEach(([dr, dc]) => {
        const nr = row + dr;
        const nc = col + dc;
        if (isInsidePalace(nr, nc, color)) {
          addIfValid(nr, nc);
        }
      });
      break;
    }

    case 'A': {
      // Diagonal 1 step inside palace
      const deltas = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      deltas.forEach(([dr, dc]) => {
        const nr = row + dr;
        const nc = col + dc;
        if (isInsidePalace(nr, nc, color)) {
          addIfValid(nr, nc);
        }
      });
      break;
    }

    case 'B': {
      // Elephant: diagonal 2 steps, cannot cross river, eye check (塞象眼)
      const deltas = [
        { dr: -2, dc: -2, eyeR: -1, eyeC: -1 },
        { dr: -2, dc: 2, eyeR: -1, eyeC: 1 },
        { dr: 2, dc: -2, eyeR: 1, eyeC: -1 },
        { dr: 2, dc: 2, eyeR: 1, eyeC: 1 },
      ];
      deltas.forEach(({ dr, dc, eyeR, eyeC }) => {
        const nr = row + dr;
        const nc = col + dc;
        if (!isInsideBoard(nr, nc)) return;

        // River boundary
        if (color === 'red' && nr < 5) return;
        if (color === 'black' && nr > 4) return;

        // Eye blocking check (塞象眼)
        if (board[row + eyeR][col + eyeC] === null) {
          addIfValid(nr, nc);
        }
      });
      break;
    }

    case 'N': {
      // Horse: 1 step orthogonal then 1 diagonal (日), check horse leg (蹩马腿)
      const horseMoves = [
        { dr: -2, dc: -1, legR: -1, legC: 0 },
        { dr: -2, dc: 1, legR: -1, legC: 0 },
        { dr: 2, dc: -1, legR: 1, legC: 0 },
        { dr: 2, dc: 1, legR: 1, legC: 0 },
        { dr: -1, dc: -2, legR: 0, legC: -1 },
        { dr: 1, dc: -2, legR: 0, legC: -1 },
        { dr: -1, dc: 2, legR: 0, legC: 1 },
        { dr: 1, dc: 2, legR: 0, legC: 1 },
      ];
      horseMoves.forEach(({ dr, dc, legR, legC }) => {
        const nr = row + dr;
        const nc = col + dc;
        if (!isInsideBoard(nr, nc)) return;

        if (board[row + legR][col + legC] === null) {
          addIfValid(nr, nc);
        }
      });
      break;
    }

    case 'R': {
      // Chariot: orthogonal any distance until blocked
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      dirs.forEach(([dr, dc]) => {
        let nr = row + dr;
        let nc = col + dc;
        while (isInsideBoard(nr, nc)) {
          if (board[nr][nc] === null) {
            addIfValid(nr, nc);
          } else {
            if (board[nr][nc]?.color !== color) {
              addIfValid(nr, nc);
            }
            break;
          }
          nr += dr;
          nc += dc;
        }
      });
      break;
    }

    case 'C': {
      // Cannon: moves like chariot without capture; captures over exactly one piece
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      dirs.forEach(([dr, dc]) => {
        let nr = row + dr;
        let nc = col + dc;
        let jump = false;

        while (isInsideBoard(nr, nc)) {
          const target = board[nr][nc];
          if (!jump) {
            if (target === null) {
              addIfValid(nr, nc);
            } else {
              jump = true; // First piece encountered acts as screen
            }
          } else {
            if (target !== null) {
              if (target.color !== color) {
                addIfValid(nr, nc);
              }
              break;
            }
          }
          nr += dr;
          nc += dc;
        }
      });
      break;
    }

    case 'P': {
      // Soldier: forward 1 step; after river crossing can move left/right 1 step
      if (color === 'red') {
        // Forward
        addIfValid(row - 1, col);
        // Cross river check
        if (row <= 4) {
          addIfValid(row, col - 1);
          addIfValid(row, col + 1);
        }
      } else {
        // Black forward
        addIfValid(row + 1, col);
        // Cross river check
        if (row >= 5) {
          addIfValid(row, col - 1);
          addIfValid(row, col + 1);
        }
      }
      break;
    }
  }

  return moves;
}

// Convert numeric coordinates to standard Chinese Xiangqi notation
export function moveToNotation(
  board: BoardGrid,
  from: Position,
  to: Position,
  piece: Piece
): string {
  const isRed = piece.color === 'red';
  const name = PIECE_NAMES[piece.color][piece.type];

  // Starting file coordinate
  let fromFile = isRed ? 9 - from.col : from.col + 1;
  let toFile = isRed ? 9 - to.col : to.col + 1;

  const numMap = isRed
    ? ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']
    : ['', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let action = '';
  let param = '';

  const isStraightPiece = ['R', 'C', 'P', 'K'].includes(piece.type);

  if (from.row === to.row) {
    // Traverse / Horizontal move
    action = '平';
    param = numMap[toFile];
  } else {
    const isAdvancing = isRed ? to.row < from.row : to.row > from.row;
    action = isAdvancing ? '进' : '退';

    if (isStraightPiece) {
      const distance = Math.abs(to.row - from.row);
      param = numMap[distance];
    } else {
      // Diagonal piece (Horse, Elephant, Advisor): parameter is destination column
      param = numMap[toFile];
    }
  }

  return `${name}${numMap[fromFile]}${action}${param}`;
}

// Generate FEN string from current board
export function boardToFen(board: BoardGrid, activeColor: PieceColor = 'red'): string {
  const rows: string[] = [];
  for (let r = 0; r < 10; r++) {
    let emptyCount = 0;
    let rowStr = '';
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (!p) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          rowStr += emptyCount;
          emptyCount = 0;
        }
        const char = p.color === 'red' ? p.type.toUpperCase() : p.type.toLowerCase();
        rowStr += char;
      }
    }
    if (emptyCount > 0) rowStr += emptyCount;
    rows.push(rowStr);
  }
  return `${rows.join('/')} ${activeColor === 'red' ? 'w' : 'b'} - - 0 1`;
}

// Generate exportable PGN string
export function exportToPGN(
  redName: string,
  blackName: string,
  mode: string,
  moves: Array<{ step: number; side: PieceColor; notation: string }>,
  result: string = '*'
): string {
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '.');
  let pgn = `[Event "华夏象棋俱乐部${mode === 'ranked' ? '排位天梯' : '积分匹配'}赛"]\n`;
  pgn += `[Site "华夏象棋裁判记分系统"]\n`;
  pgn += `[Date "${dateStr}"]\n`;
  pgn += `[Red "${redName}"]\n`;
  pgn += `[Black "${blackName}"]\n`;
  pgn += `[Result "${result}"]\n\n`;

  for (let i = 0; i < moves.length; i += 2) {
    const roundNum = Math.floor(i / 2) + 1;
    const redMove = moves[i]?.notation || '';
    const blackMove = moves[i + 1]?.notation || '';
    pgn += `${roundNum}. ${redMove}    ${blackMove}\n`;
  }

  return pgn;
}
