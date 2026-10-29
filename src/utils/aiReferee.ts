import { AIAnalysisResult, BoardGrid, PieceColor } from '../types/chess';
import { isKingInCheck } from './chessEngine';

const PIECE_VALUES = {
  K: 10000,
  R: 900,
  C: 450,
  N: 400,
  B: 200,
  A: 200,
  P: 100, // River-crossed adds +100
};

export function evaluateBoardHeuristic(board: BoardGrid): {
  redScore: number;
  blackScore: number;
  advantage: 'red' | 'black' | 'equal';
  advantageText: string;
  redWinProb: number;
  verdict: 'continue' | 'red_win' | 'black_win' | 'draw';
  verdictReason: string;
  commentary: string;
} {
  let redScore = 0;
  let blackScore = 0;
  let hasRedKing = false;
  let hasBlackKing = false;
  let redChariots = 0;
  let blackChariots = 0;
  let redCannons = 0;
  let blackCannons = 0;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (!p) continue;

      let val = PIECE_VALUES[p.type] || 0;
      if (p.type === 'P') {
        if (p.color === 'red' && r <= 4) val += 100; // Passed river
        if (p.color === 'black' && r >= 5) val += 100;
      }

      if (p.color === 'red') {
        if (p.type === 'K') hasRedKing = true;
        if (p.type === 'R') redChariots++;
        if (p.type === 'C') redCannons++;
        redScore += val;
      } else {
        if (p.type === 'K') hasBlackKing = true;
        if (p.type === 'R') blackChariots++;
        if (p.type === 'C') blackCannons++;
        blackScore += val;
      }
    }
  }

  // Instant win detection by king capture
  if (!hasBlackKing) {
    return {
      redScore,
      blackScore,
      advantage: 'red',
      advantageText: '红方胜出',
      redWinProb: 100,
      verdict: 'red_win',
      verdictReason: '黑方主将被擒',
      commentary: '红方势如破竹，斩获黑方主帅，锁定胜局！',
    };
  }

  if (!hasRedKing) {
    return {
      redScore,
      blackScore,
      advantage: 'black',
      advantageText: '黑方胜出',
      redWinProb: 0,
      verdict: 'black_win',
      verdictReason: '红方主帅被擒',
      commentary: '黑方长驱直入，直捣红方中军大营，赢得比赛！',
    };
  }

  const redCheck = isKingInCheck(board, 'black');
  const blackCheck = isKingInCheck(board, 'red');

  const diff = redScore - blackScore;
  let redWinProb = 50;

  if (diff > 0) {
    redWinProb = Math.min(95, Math.round(50 + (diff / 30)));
  } else if (diff < 0) {
    redWinProb = Math.max(5, Math.round(50 + (diff / 30)));
  }

  let advantage: 'red' | 'black' | 'equal' = 'equal';
  let advantageText = '势均力敌';
  let commentary = '双方兵力均衡，子力犬牙交错，胜负尚在未定之天。';
  let verdict: 'continue' | 'red_win' | 'black_win' | 'draw' = 'continue';
  let verdictReason = '比赛平稳进行中';

  if (diff >= 900) {
    advantage = 'red';
    advantageText = '红方大优';
    commentary = `红方拥有强盛子力压制（车${redChariots}炮${redCannons}），黑方防御已出现严重缺口！`;
    if (redCheck) {
      advantageText = '红方将军占优';
      commentary = '红方攻势凌厉直逼将门，黑方防线告急！';
    }
  } else if (diff >= 300) {
    advantage = 'red';
    advantageText = '红方微优';
    commentary = '红方子力略占上风，正步步为营拓展进攻走廊。';
  } else if (diff <= -900) {
    advantage = 'black';
    advantageText = '黑方大优';
    commentary = `黑方子力雄厚（车${blackChariots}炮${blackCannons}），兵临城下，杀气腾腾！`;
    if (blackCheck) {
      advantageText = '黑方将军占优';
      commentary = '黑方发起雷霆突击直接将军，红方局势万分危急！';
    }
  } else if (diff <= -300) {
    advantage = 'black';
    advantageText = '黑方微优';
    commentary = '黑方在中前场略占优势，控制较多要道。';
  }

  // Draw detection: bare kings or only advisors left
  if (redScore <= 10400 && blackScore <= 10400 && redChariots === 0 && blackChariots === 0 && redCannons === 0 && blackCannons === 0) {
    advantage = 'equal';
    advantageText = '和棋定局';
    verdict = 'draw';
    verdictReason: '双方均无进攻子力';
    commentary = '双方子力已无法组织有效进攻，裁决建议和棋。';
  }

  return {
    redScore,
    blackScore,
    advantage,
    advantageText,
    redWinProb,
    verdict,
    verdictReason,
    commentary,
  };
}

// Request AI Referee from server with Gemini fallback
export async function requestAIReferee(
  fen: string,
  moves: string[],
  redName: string,
  blackName: string,
  mode: string
): Promise<AIAnalysisResult> {
  try {
    const res = await fetch('/api/ai/referee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen, moves, redName, blackName, mode }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          advantage: data.advantage || 'equal',
          advantageText: data.advantageText || '势均力敌',
          redWinProb: typeof data.redWinProb === 'number' ? data.redWinProb : 50,
          commentary: data.commentary || '棋局进行中，双方正稳步推进。',
          verdict: data.verdict || 'continue',
          verdictReason: data.verdictReason || '局势平稳',
        };
      }
    }
  } catch (err) {
    console.warn('API referee request failed, using local heuristic:', err);
  }

  // Default fallback
  return {
    advantage: 'equal',
    advantageText: '局势平稳',
    redWinProb: 50,
    commentary: '双方正在积极布子，局势平稳。',
    verdict: 'continue',
    verdictReason: '正常对弈',
  };
}
