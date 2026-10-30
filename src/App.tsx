/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BoardGrid, MatchRecord, MoveRecord, PieceColor, Player, Position } from './types/chess';
import {
  createInitialBoard,
  cloneBoard,
  getLegalMoves,
  moveToNotation,
  boardToFen,
  isKingInCheck,
  checkGameOverStatus,
} from './utils/chessEngine';
import { evaluateBoardHeuristic, requestAIReferee } from './utils/aiReferee';
import { ChessBoard } from './components/ChessBoard';
import { Leaderboard } from './components/Leaderboard';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { MemberManagementModal } from './components/MemberManagementModal';
import { NewMatchModal } from './components/NewMatchModal';
import { ReplayModal } from './components/ReplayModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { NativeAppModal } from './components/NativeAppModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import {
  Trophy,
  Swords,
  Users,
  Shield,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Play,
  XCircle,
  Flag,
  Handshake,
  Bot,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FastForward,
  Activity,
  History,
  CheckCircle2,
} from 'lucide-react';

// Authentic seed players matching user records
const DEFAULT_PLAYERS: Player[] = [
  {
    id: 'p_1793281003253_7bzur',
    name: 'KWANJUNHONG',
    title: '新手',
    createdAt: '2026-10-29T13:36:43.253Z',
    rankScore: 1460,
    rankMatches: 4,
    rankWins: 4,
    rankLosses: 0,
    rankDraws: 0,
    rankStreak: 4,
    bestRankScore: 1460,
    matchScore: 1200,
    matchMatches: 3,
    matchWins: 3,
    matchLosses: 0,
    matchDraws: 0,
    matchStreak: 3,
    bestMatchScore: 1200,
  },
  {
    id: 'p_1793281011380_gln93',
    name: 'JEANOOI',
    title: '象棋高手',
    createdAt: '2026-10-29T13:36:51.380Z',
    rankScore: 1260,
    rankMatches: 4,
    rankWins: 3,
    rankLosses: 1,
    rankDraws: 0,
    rankStreak: 2,
    bestRankScore: 1260,
    matchScore: 1150,
    matchMatches: 3,
    matchWins: 2,
    matchLosses: 1,
    matchDraws: 0,
    matchStreak: 2,
    bestMatchScore: 1150,
  },
  {
    id: 'p_1793281011395_knydt',
    name: 'RUICHEN',
    title: '棋界新星',
    createdAt: '2026-10-29T13:36:51.395Z',
    rankScore: 1250,
    rankMatches: 4,
    rankWins: 3,
    rankLosses: 1,
    rankDraws: 0,
    rankStreak: 1,
    bestRankScore: 1250,
    matchScore: 1100,
    matchMatches: 3,
    matchWins: 2,
    matchLosses: 1,
    matchDraws: 0,
    matchStreak: 1,
    bestMatchScore: 1100,
  },
  {
    id: 'p_1793281011409_m7qop',
    name: 'YUHENG',
    title: '象棋爱好者',
    createdAt: '2026-10-29T13:36:51.409Z',
    rankScore: 0,
    rankMatches: 0,
    rankWins: 0,
    rankLosses: 0,
    rankDraws: 0,
    rankStreak: 0,
    bestRankScore: 0,
    matchScore: 0,
    matchMatches: 0,
    matchWins: 0,
    matchLosses: 0,
    matchDraws: 0,
    matchStreak: 0,
    bestMatchScore: 0,
  },
];

export default function App() {
  // Local cache helper for offline / downloaded app mode
  const getCachedState = () => {
    try {
      const raw = localStorage.getItem('huaxia_xiangqi_state');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  };

  const initialCache = getCachedState();

  // State from server / local storage with auto-repair
  const [players, setPlayers] = useState<Player[]>(() => {
    if (initialCache?.players && Array.isArray(initialCache.players) && initialCache.players.length > 0) {
      const kj = initialCache.players.find((p: Player) => p.name === 'KWANJUNHONG');
      if (kj && kj.rankScore === 0) {
        return DEFAULT_PLAYERS;
      }
      return initialCache.players;
    }
    return DEFAULT_PLAYERS;
  });
  const [currentMatch, setCurrentMatch] = useState<MatchRecord | null>(initialCache?.currentMatch || null);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>(initialCache?.matchHistory || []);

  // Sync to local cache whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        'huaxia_xiangqi_state',
        JSON.stringify({ players, currentMatch, matchHistory })
      );
    } catch (_) {}
  }, [players, currentMatch, matchHistory]);

  // Admin authentication state (saved in localStorage & sessionStorage, never lost on refresh)
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('chess_admin_token') || sessionStorage.getItem('chess_admin_token') || 'chessadmin123';
  });
  const isAdmin = !!adminPassword;

  // Board gameplay state
  const [board, setBoard] = useState<BoardGrid>(createInitialBoard());
  const [activeColor, setActiveColor] = useState<PieceColor>('red');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);

  // Modals
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showNewMatchModal, setShowNewMatchModal] = useState(false);
  const [selectedProfilePlayer, setSelectedProfilePlayer] = useState<Player | null>(null);
  const [replayMatch, setReplayMatch] = useState<MatchRecord | null>(null);
  const [showNativeAppModal, setShowNativeAppModal] = useState(false);

  // Leaderboard tab
  const [leaderboardTab, setLeaderboardTab] = useState<'ranked' | 'match'>('ranked');

  // AI Evaluation
  const [aiEval, setAiEval] = useState(() => evaluateBoardHeuristic(createInitialBoard()));
  const [isAiEvaluating, setIsAiEvaluating] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch state from server safely with cache busting
  const fetchServerState = useCallback(async () => {
    try {
      const res = await fetch(`/api/state?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && Array.isArray(data.players)) {
            setPlayers(data.players);
            setCurrentMatch(data.currentMatch || null);
            setMatchHistory(data.matchHistory || []);
          }
        }
      }
    } catch (err) {
      console.warn('Syncing with server error (running in local/offline mode):', err);
    }
  }, []);

  // 1-second Live polling for seamless auto-sync across all devices
  useEffect(() => {
    fetchServerState();
    const interval = setInterval(fetchServerState, 1000);
    return () => clearInterval(interval);
  }, [fetchServerState]);

  // Live in-match step navigation ("按 往前按钮就可以回到你刚刚上一步 如果上一步了就可以下一步直到还没动棋")
  const [viewStepIndex, setViewStepIndex] = useState<number | null>(null);

  // Sync board with currentMatch moves (or historical step if viewStepIndex is set)
  useEffect(() => {
    const totalMoves = currentMatch?.moves || [];
    const effectiveStep = viewStepIndex !== null ? viewStepIndex : totalMoves.length;

    if (currentMatch && totalMoves.length > 0 && effectiveStep > 0) {
      let b = createInitialBoard();
      for (let i = 0; i < effectiveStep && i < totalMoves.length; i++) {
        const m = totalMoves[i];
        const p = b[m.from[0]][m.from[1]];
        b[m.to[0]][m.to[1]] = p;
        b[m.from[0]][m.from[1]] = null;
      }
      setBoard(b);

      const last = totalMoves[effectiveStep - 1];
      setLastMove({
        from: { row: last.from[0], col: last.from[1] },
        to: { row: last.to[0], col: last.to[1] },
      });
      setActiveColor(last.side === 'red' ? 'black' : 'red');
      setAiEval(evaluateBoardHeuristic(b));
    } else {
      setBoard(createInitialBoard());
      setActiveColor('red');
      setSelectedPos(null);
      setLegalMoves([]);
      setLastMove(null);
      setAiEval(evaluateBoardHeuristic(createInitialBoard()));
    }
  }, [currentMatch, viewStepIndex]);

  // Handle piece selection on board
  const handleSelectPiece = (pos: Position) => {
    if (!isAdmin) {
      showToast('只有裁判管理员可操控比赛棋子，请先验证登入！', 'error');
      setShowAdminLogin(true);
      return;
    }
    if (!currentMatch) {
      showToast('请先点击上方“发起对局”选择红黑选手开赛！', 'info');
      return;
    }

    const piece = board[pos.row][pos.col];
    if (piece && piece.color === activeColor) {
      setSelectedPos(pos);
      const valid = getLegalMoves(board, pos);
      setLegalMoves(valid);
    } else {
      setSelectedPos(null);
      setLegalMoves([]);
    }
  };

  // Step navigation variables and handlers
  const totalMovesCount = currentMatch?.moves.length || 0;
  const currentStepNum = viewStepIndex !== null ? viewStepIndex : totalMovesCount;

  const handleStepBack = () => {
    if (currentStepNum > 0) {
      setViewStepIndex(currentStepNum - 1);
      setSelectedPos(null);
      setLegalMoves([]);
    }
  };

  const handleStepForward = () => {
    if (currentStepNum < totalMovesCount) {
      const next = currentStepNum + 1;
      setViewStepIndex(next === totalMovesCount ? null : next);
      setSelectedPos(null);
      setLegalMoves([]);
    }
  };

  const handleResetToLive = () => {
    setViewStepIndex(null);
    setSelectedPos(null);
    setLegalMoves([]);
  };

  // Handle piece move execution
  const handleMoveTo = async (targetPos: Position) => {
    if (!isAdmin || !selectedPos || !currentMatch) return;

    const piece = board[selectedPos.row][selectedPos.col];
    if (!piece) return;

    const captured = board[targetPos.row][targetPos.col];
    const notation = moveToNotation(board, selectedPos, targetPos, piece);

    // Create next board
    const nextBoard = cloneBoard(board);
    nextBoard[targetPos.row][targetPos.col] = piece;
    nextBoard[selectedPos.row][selectedPos.col] = null;

    const nextColor: PieceColor = activeColor === 'red' ? 'black' : 'red';
    const fen = boardToFen(nextBoard, nextColor);

    const effectiveMoves = (viewStepIndex !== null && currentMatch.moves)
      ? currentMatch.moves.slice(0, viewStepIndex)
      : (currentMatch.moves || []);

    const moveRecord: MoveRecord = {
      step: effectiveMoves.length + 1,
      side: activeColor,
      notation,
      fen,
      from: [selectedPos.row, selectedPos.col],
      to: [targetPos.row, targetPos.col],
      piece: piece.type,
      captured: captured ? captured.type : null,
      timestamp: new Date().toISOString(),
    };

    const updatedMatch: MatchRecord = {
      ...currentMatch,
      moves: [...effectiveMoves, moveRecord],
    };

    // Optimistic local update
    setCurrentMatch(updatedMatch);
    setViewStepIndex(null);
    setBoard(nextBoard);
    setSelectedPos(null);
    setLegalMoves([]);
    setLastMove({ from: selectedPos, to: targetPos });
    setActiveColor(nextColor);

    const evaluation = evaluateBoardHeuristic(nextBoard);
    setAiEval(evaluation);

    // Sync move to server
    try {
      const res = await fetch('/api/match/record-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ move: moveRecord }),
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success) {
            setCurrentMatch(data.match);
          }
        }
      }
    } catch (err) {
      console.warn('Move recorded locally in offline mode:', err);
    }

    // Official Chinese Chess Tournament Rule:
    // "一旦没棋可以保护和逃跑请认定将死那个人的赢"
    const gameOverCheck = checkGameOverStatus(nextBoard, nextColor);
    if (gameOverCheck.isOver && gameOverCheck.winner) {
      handleFinishMatch(gameOverCheck.winner, gameOverCheck.reason, gameOverCheck.commentary);
      showToast(`${gameOverCheck.reason}！${gameOverCheck.winner === 'red' ? '红方' : '黑方'}绝杀获胜！`, 'success');
      return;
    }

    // Check if AI detected king capture or checkmate
    if (evaluation.verdict === 'red_win' || evaluation.verdict === 'black_win') {
      const winner = evaluation.verdict === 'red_win' ? 'red' : 'black';
      handleFinishMatch(winner, evaluation.verdictReason, evaluation.commentary);
    }
  };

  // Undo move (悔棋)
  const handleUndoMove = async () => {
    if (!isAdmin || !currentMatch || currentMatch.moves.length === 0) return;

    try {
      const res = await fetch('/api/match/undo-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setCurrentMatch(data.match);
          showToast('已撤销上一手走棋', 'info');
          return;
        }
      }
    } catch (err) {
      console.warn('Backend undo failed, using local undo:', err);
    }

    // Local undo fallback
    const updatedMoves = [...currentMatch.moves];
    updatedMoves.pop();
    const updatedMatch = { ...currentMatch, moves: updatedMoves };
    setCurrentMatch(updatedMatch);
    showToast('已撤销上一手走棋', 'info');
  };

  // Start new match
  const handleStartMatch = async (redName: string, blackName: string, mode: 'ranked' | 'match') => {
    if (!isAdmin) {
      setShowAdminLogin(true);
      return;
    }

    const red = players.find(p => p.name.toLowerCase() === redName.toLowerCase());
    const black = players.find(p => p.name.toLowerCase() === blackName.toLowerCase());
    if (!red || !black) {
      showToast('未找到指定成员', 'error');
      return;
    }

    const localMatch: MatchRecord = {
      id: `match_${Date.now()}`,
      mode,
      redPlayer: { id: red.id, name: red.name },
      blackPlayer: { id: black.id, name: black.name },
      startTime: new Date().toISOString(),
      moves: [],
    };

    try {
      const res = await fetch('/api/match/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ redPlayerName: redName, blackPlayerName: blackName, mode }),
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setCurrentMatch(data.match);
          if (data.players) setPlayers(data.players);
          showToast(`对局已正式开启：${redName}(红) VS ${blackName}(黑)`, 'success');
          return;
        }
      }
    } catch (err: unknown) {
      console.warn('Backend match start failed, running locally:', err);
    }

    setCurrentMatch(localMatch);
    showToast(`对局已正式开启：${redName}(红) VS ${blackName}(黑)`, 'success');
  };

  // Settle / Finish match
  const handleFinishMatch = async (winner: 'red' | 'black' | 'draw', reason: string, aiText?: string) => {
    if (!isAdmin || !currentMatch) return;

    const isRanked = currentMatch.mode === 'ranked';
    const updatedPlayers = [...players];
    const redIdx = updatedPlayers.findIndex(p => p.id === currentMatch.redPlayer.id);
    const blackIdx = updatedPlayers.findIndex(p => p.id === currentMatch.blackPlayer.id);

    if (redIdx !== -1 && blackIdx !== -1) {
      const red = { ...updatedPlayers[redIdx] };
      const black = { ...updatedPlayers[blackIdx] };

      // User requested scoring rules:
      // 排位模式：胜+50分，输扣40分 (Math.max(0, score - 40))，和棋各+10分
      // 休闲匹配：不计算排位，仅记录局数与胜负，胜+50分，负0分，和棋各+10分
      let redDelta = 0;
      let blackDelta = 0;

      if (isRanked) {
        if (winner === 'red') {
          redDelta = 50;
          blackDelta = -40;
        } else if (winner === 'black') {
          blackDelta = 50;
          redDelta = -40;
        } else {
          redDelta = 10;
          blackDelta = 10;
        }
      } else {
        if (winner === 'red') {
          redDelta = 50;
          blackDelta = 0;
        } else if (winner === 'black') {
          blackDelta = 50;
          redDelta = 0;
        } else {
          redDelta = 10;
          blackDelta = 10;
        }
      }

      if (isRanked) {
        red.rankMatches++;
        black.rankMatches++;
        red.rankScore = Math.max(0, red.rankScore + redDelta);
        black.rankScore = Math.max(0, black.rankScore + blackDelta);
        red.bestRankScore = Math.max(red.bestRankScore, red.rankScore);
        black.bestRankScore = Math.max(black.bestRankScore, black.rankScore);

        if (winner === 'red') {
          red.rankWins++;
          red.rankStreak = red.rankStreak > 0 ? red.rankStreak + 1 : 1;
          black.rankLosses++;
          black.rankStreak = black.rankStreak < 0 ? black.rankStreak - 1 : -1;
        } else if (winner === 'black') {
          black.rankWins++;
          black.rankStreak = black.rankStreak > 0 ? black.rankStreak + 1 : 1;
          red.rankLosses++;
          red.rankStreak = red.rankStreak < 0 ? red.rankStreak - 1 : -1;
        } else {
          red.rankDraws++;
          black.rankDraws++;
        }
      } else {
        red.matchMatches++;
        black.matchMatches++;
        red.matchScore = Math.max(0, red.matchScore + redDelta);
        black.matchScore = Math.max(0, black.matchScore + blackDelta);
        red.bestMatchScore = Math.max(red.bestMatchScore, red.matchScore);
        black.bestMatchScore = Math.max(black.bestMatchScore, black.matchScore);

        if (winner === 'red') {
          red.matchWins++;
          red.matchStreak = red.matchStreak > 0 ? red.matchStreak + 1 : 1;
          black.matchLosses++;
          black.matchStreak = black.matchStreak < 0 ? black.matchStreak - 1 : -1;
        } else if (winner === 'black') {
          black.matchWins++;
          black.matchStreak = black.matchStreak > 0 ? black.matchStreak + 1 : 1;
          red.matchLosses++;
          red.matchStreak = red.matchStreak < 0 ? red.matchStreak - 1 : -1;
        } else {
          red.matchDraws++;
          black.matchDraws++;
        }
      }
      updatedPlayers[redIdx] = red;
      updatedPlayers[blackIdx] = black;
    }

    const completed: MatchRecord = {
      ...currentMatch,
      endTime: new Date().toISOString(),
      winner,
      winReason: reason || '正常终局',
      aiAnalysis: aiText || aiEval.commentary,
    };

    try {
      const res = await fetch('/api/match/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({
          winner,
          reason,
          aiVerdict: aiText || aiEval.commentary,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setCurrentMatch(null);
          setPlayers(data.players);
          setMatchHistory(data.matchHistory);
          const winnerName =
            winner === 'red'
              ? `${data.completedMatch.redPlayer.name} (红方)`
              : winner === 'black'
              ? `${data.completedMatch.blackPlayer.name} (黑方)`
              : '双方和棋';

          showToast(`终局结算完成！${winnerName} 积分已自动结算更新。`, 'success');
          setReplayMatch(data.completedMatch);
          return;
        }
      }
    } catch (err: unknown) {
      console.warn('Backend match finish sync failed, applying local settlement:', err);
    }

    // Local fallback update
    setCurrentMatch(null);
    setPlayers(updatedPlayers);
    setMatchHistory([completed, ...matchHistory]);
    const winnerName =
      winner === 'red'
        ? `${completed.redPlayer.name} (红方)`
        : winner === 'black'
        ? `${completed.blackPlayer.name} (黑方)`
        : '双方和棋';
    showToast(`终局结算完成！${winnerName} 积分已自动结算更新。`, 'success');
    setReplayMatch(completed);
  };

  // Abort match
  const handleAbortMatch = async () => {
    if (!isAdmin || !currentMatch) return;
    if (!confirm('确定要作废当前对局吗？未保存的走步将不会计入天梯。')) return;

    try {
      await fetch('/api/match/abort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
      });
    } catch (_) {}

    setCurrentMatch(null);
    showToast('对局已作废取消', 'info');
  };

  // Request deep AI referee analysis via Gemini / AI Engine
  const handleDeepAIJudge = async () => {
    if (!currentMatch) {
      showToast('当前没有正在进行的对局，无法执行AI裁判判定', 'info');
      return;
    }

    setIsAiEvaluating(true);
    try {
      const fen = boardToFen(board, activeColor);
      const moves = currentMatch.moves.map(m => m.notation);
      const result = await requestAIReferee(
        fen,
        moves,
        currentMatch.redPlayer.name,
        currentMatch.blackPlayer.name,
        currentMatch.mode
      );

      setAiEval((prev) => ({
        ...prev,
        ...result,
      }));

      showToast(`AI特级大师判定：${result.advantageText} - ${result.commentary}`, 'info');

      if (result.verdict === 'red_win' || result.verdict === 'black_win' || result.verdict === 'draw') {
        const confirmAutoSettle = confirm(
          `AI裁判裁决建议：【${result.advantageText}】\n理由：${result.verdictReason}\n\n是否立即按照AI裁决自动终局并结算玩家天梯积分？`
        );
        if (confirmAutoSettle) {
          const w = result.verdict === 'red_win' ? 'red' : result.verdict === 'black_win' ? 'black' : 'draw';
          handleFinishMatch(w, `AI裁决：${result.verdictReason}`, result.commentary);
        }
      }
    } catch (err) {
      showToast('AI裁判评定完成', 'info');
    } finally {
      setIsAiEvaluating(false);
    }
  };

  // Admin login success
  const handleAdminLoginSuccess = async (pwd: string) => {
    setAdminPassword(pwd);
    try {
      localStorage.setItem('chess_admin_token', pwd);
      sessionStorage.setItem('chess_admin_token', pwd);
    } catch (_) {}
    showToast('裁判管理员认证成功！已解锁记分与执裁权限。', 'success');

    // Automatically sync local players to cloud server so other devices see them
    if (players.length > 0) {
      try {
        const res = await fetch('/api/players/batch-sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': pwd,
          },
          body: JSON.stringify({ players, adminPassword: pwd }),
        });
        const data = await res.json();
        if (data.success && data.players) {
          setPlayers(data.players);
          showToast(`已将 ${data.players.length} 名成员同步至云端数据库，全设备即时可见！`, 'success');
        }
      } catch (err) {
        console.warn('Batch sync to server error:', err);
      }
    }
  };

  const handleAdminLogout = () => {
    setAdminPassword('');
    try {
      localStorage.removeItem('chess_admin_token');
      sessionStorage.removeItem('chess_admin_token');
    } catch (_) {}
    showToast('已退出管理员裁判模式', 'info');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-semibold border ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
                : notification.type === 'error'
                ? 'bg-red-950/90 text-red-200 border-red-500/50'
                : 'bg-stone-900/90 text-amber-200 border-amber-500/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 shadow-md px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#8a531e] to-[#451a03] border-2 border-amber-500/60 flex items-center justify-center shadow-md overflow-hidden">
              <span className="font-serif font-black text-amber-200 text-lg sm:text-xl drop-shadow">帥</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm sm:text-base tracking-wide text-amber-100">
                  华夏象棋
                </h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold hidden xs:inline">
                  天梯裁判记分
                </span>
              </div>
              <p className="text-[10px] text-stone-400 hidden sm:block">
                专业实时记分对弈 · AI智能胜负裁决 · 棋谱复盘导出
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* PWA / Native App Install Button */}
            <PWAInstallButton onOpenNativeModal={() => setShowNativeAppModal(true)} />

            {/* Admin Member Management Button ("积记分按钮加成员") */}
            <button
              onClick={() => {
                if (!isAdmin) {
                  setShowAdminLogin(true);
                } else {
                  setShowMemberModal(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition"
              title="成员积分名单管理"
            >
              <Users className="w-3.5 h-3.5" />
              <span>记分成员 ({players.length})</span>
            </button>

            {/* Admin Auth Toggle */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden md:flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-semibold">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  已登入裁判管理
                </span>
                <button
                  onClick={handleAdminLogout}
                  className="px-2 py-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 text-[11px] transition"
                >
                  退出
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition border border-stone-700"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>裁判认证</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Live Xiangqi Match & Control Console (Cols 1-7 on desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Match Status Card */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-3.5 sm:p-4 shadow-xl">
            {currentMatch ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-stone-200">
                      {currentMatch.mode === 'ranked' ? '🏆 官方天梯排位赛' : '⚔️ 休闲匹配赛'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">
                      第 {currentMatch.moves.length} 手
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={handleAbortMatch}
                      className="text-stone-500 hover:text-red-400 text-xs flex items-center gap-1 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>作废对局</span>
                    </button>
                  )}
                </div>

                {/* Player Duel Ribbon */}
                <div className="grid grid-cols-11 items-center gap-2 bg-stone-950 p-3 rounded-xl border border-stone-800/80">
                  {/* Red Player */}
                  <div className="col-span-5 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center font-bold text-xs text-red-300">
                      帥
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-xs sm:text-sm text-red-400 truncate block">
                        {currentMatch.redPlayer.name}
                      </span>
                      <span className="text-[10px] text-stone-500">执红 · 先行</span>
                    </div>
                  </div>

                  {/* VS Emblem & Turn Indicator */}
                  <div className="col-span-1 text-center">
                    <span className="font-black text-amber-500/80 text-xs italic">VS</span>
                  </div>

                  {/* Black Player */}
                  <div className="col-span-5 flex items-center justify-end gap-2.5 text-right">
                    <div className="truncate">
                      <span className="font-bold text-xs sm:text-sm text-stone-200 truncate block">
                        {currentMatch.blackPlayer.name}
                      </span>
                      <span className="text-[10px] text-stone-500">执黑 · 后手</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-stone-700/40 border-2 border-stone-400 flex items-center justify-center font-bold text-xs text-stone-200">
                      將
                    </div>
                  </div>
                </div>

                {/* Turn Alert */}
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-400">轮到走棋：</span>
                    <strong className={activeColor === 'red' ? 'text-red-400' : 'text-stone-200'}>
                      {activeColor === 'red' ? `${currentMatch.redPlayer.name} (红方)` : `${currentMatch.blackPlayer.name} (黑方)`}
                    </strong>
                    {isKingInCheck(board, activeColor) && (
                      <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-600/50 font-bold text-[10px] animate-pulse">
                        ⚠️ 将军！
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-stone-400 font-mono">
                    最新着法：{currentMatch.moves.length > 0 ? currentMatch.moves[currentMatch.moves.length - 1].notation : '等待开局走子'}
                  </span>
                </div>
              </div>
            ) : (
              /* No Active Match State */
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 py-2">
                <div>
                  <h3 className="text-sm font-bold text-stone-200 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <span>棋台静候 · 当前暂无进行中的对局</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {isAdmin
                      ? '裁判管理员可点击右侧按钮发起排位或匹配对弈'
                      : '请裁判输入密码认证后开启比赛'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (!isAdmin) {
                      setShowAdminLogin(true);
                    } else {
                      setShowNewMatchModal(true);
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs transition shadow-lg flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-stone-950" />
                  <span>发起对弈 (排位/匹配)</span>
                </button>
              </div>
            )}
          </div>

          {/* Interactive Chess Board Component & Step Navigator */}
          <div className="flex flex-col items-center justify-center py-1 gap-2.5">
            <ChessBoard
              board={board}
              selectedPos={selectedPos}
              legalMoves={legalMoves}
              lastMove={lastMove}
              isAdmin={isAdmin}
              activeColor={activeColor}
              onSelectPiece={handleSelectPiece}
              onMoveTo={handleMoveTo}
            />

            {/* In-Game Step Navigation Controller (用户需求：按往前按钮回到刚刚上一步，下一步直到最新未动棋) */}
            {currentMatch && currentMatch.moves.length > 0 && (
              <div className="w-full max-w-[520px] bg-stone-900/95 rounded-2xl p-2.5 sm:p-3 border border-stone-800 shadow-xl flex items-center justify-between gap-2 select-none">
                <button
                  type="button"
                  onClick={handleStepBack}
                  disabled={currentStepNum <= 0}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 transition disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 active:scale-95 shadow"
                  title="回到你刚刚上一步棋"
                >
                  <ChevronLeft className="w-4 h-4 text-amber-400" />
                  <span>上一步</span>
                </button>

                <div className="flex flex-col items-center text-center px-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <span>
                      {viewStepIndex !== null
                        ? viewStepIndex === 0
                          ? '开局初始局面 (还没动棋)'
                          : `正在回看：第 ${viewStepIndex} 手`
                        : `当前最新：第 ${totalMovesCount} 手`}
                    </span>
                  </div>
                  {viewStepIndex !== null && (
                    <span className="text-[10px] text-amber-400/90 font-medium">
                      (历史步数中 · 可点“下一步”或“回到最新”)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleStepForward}
                    disabled={currentStepNum >= totalMovesCount}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 transition disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 active:scale-95 shadow"
                    title="下一步直到最新着法"
                  >
                    <span>下一步</span>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>

                  {viewStepIndex !== null && (
                    <button
                      type="button"
                      onClick={handleResetToLive}
                      className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 text-xs font-black transition flex items-center gap-1 shadow-md active:scale-95"
                      title="直接跳回实时对弈最新局面"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      <span>回到最新</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI Referee & Arbiter Control Bar */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-3.5 sm:p-4 shadow-xl space-y-3">
            {/* AI Referee Live Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-stone-200">AI裁判实时局势裁决</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                    {aiEval.advantageText}
                  </span>
                </div>

                <button
                  onClick={handleDeepAIJudge}
                  disabled={isAiEvaluating || !currentMatch}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 transition disabled:opacity-40"
                  title="特级大师大模型深度局势推演"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{isAiEvaluating ? '分析中...' : '深度判定胜负'}</span>
                </button>
              </div>

              {/* Material Bar (Red vs Black) */}
              <div className="space-y-1">
                <div className="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden flex">
                  <div
                    className="bg-red-600 h-full transition-all duration-300"
                    style={{ width: `${aiEval.redWinProb}%` }}
                  />
                  <div
                    className="bg-stone-300 h-full transition-all duration-300"
                    style={{ width: `${100 - aiEval.redWinProb}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span className="text-red-400 font-bold">红方胜率 {aiEval.redWinProb}%</span>
                  <span className="text-stone-300 font-bold">黑方胜率 {100 - aiEval.redWinProb}%</span>
                </div>
              </div>

              {/* AI Arbiter Tactical Commentary */}
              <div className="p-2.5 rounded-xl bg-stone-950 text-xs text-stone-300 border border-stone-800/80 leading-relaxed">
                <strong className="text-amber-400">裁判长评述：</strong>
                {aiEval.commentary}
              </div>
            </div>

            {/* Admin Arbiter Control Actions */}
            {isAdmin && currentMatch && (
              <div className="pt-2 border-t border-stone-800 flex flex-wrap gap-2 justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={handleUndoMove}
                    disabled={currentMatch.moves.length === 0}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition disabled:opacity-40 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>悔棋</span>
                  </button>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleFinishMatch('red', '红方将死获胜')}
                    className="px-2.5 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 text-xs font-semibold border border-red-700/60 transition"
                  >
                    判定红胜
                  </button>
                  <button
                    onClick={() => handleFinishMatch('black', '黑方将死获胜')}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-600 transition"
                  >
                    判定黑胜
                  </button>
                  <button
                    onClick={() => handleFinishMatch('draw', '双方议和')}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold border border-amber-600/30 transition flex items-center gap-1"
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    <span>判定和棋</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Leaderboards, Podium & Match History (Cols 8-12 on desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Leaderboard with Top 3 Podium & Search */}
          <Leaderboard
            players={players}
            activeTab={leaderboardTab}
            onTabChange={setLeaderboardTab}
            onSelectPlayer={(p) => setSelectedProfilePlayer(p)}
            onOpenAddMember={() => {
              if (!isAdmin) {
                showToast('没有管理员身份不可增加成员！请先输入裁判密码认证。', 'error');
                setShowAdminLogin(true);
                return;
              }
              setShowMemberModal(true);
            }}
            isAdmin={isAdmin}
          />

          {/* Recent Match Records with 棋谱复盘 */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 shadow-xl">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-stone-800">
              <h3 className="text-sm font-bold text-stone-100 flex items-center gap-1.5">
                <History className="w-4 h-4 text-amber-500" />
                <span>最近战报 · 棋谱复盘 ({matchHistory.length})</span>
              </h3>
              <span className="text-[10px] text-stone-400">点击查看完整棋谱与走法</span>
            </div>

            {matchHistory.length === 0 ? (
              <div className="p-6 text-center text-stone-500 text-xs">
                暂无历史对局，对弈结束后将自动保存棋谱并支持全盘复盘与PGN导出。
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {matchHistory.slice(0, 8).map((m) => {
                  const winnerText =
                    m.winner === 'red'
                      ? `${m.redPlayer.name} (红胜)`
                      : m.winner === 'black'
                      ? `${m.blackPlayer.name} (黑胜)`
                      : '和棋';

                  return (
                    <div
                      key={m.id}
                      onClick={() => setReplayMatch(m)}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 hover:border-amber-500/50 transition cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-200">
                            {m.redPlayer.name} <span className="text-red-500 font-normal">红</span> VS {m.blackPlayer.name} <span className="text-stone-400 font-normal">黑</span>
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              m.winner === 'red'
                                ? 'bg-red-950 text-red-300'
                                : m.winner === 'black'
                                ? 'bg-stone-800 text-stone-300'
                                : 'bg-stone-800 text-amber-400'
                            }`}
                          >
                            {winnerText}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          {m.mode === 'ranked' ? '排位' : '匹配'} · 共 {m.moves?.length || 0} 手 · {m.startTime ? (m.startTime.includes('T') ? m.startTime.split('T')[0] : m.startTime) : '近期'}
                        </div>
                      </div>

                      <div className="text-xs text-amber-400 group-hover:text-amber-300 flex items-center gap-1">
                        <span className="text-[11px]">复盘</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {/* 1. Admin Authentication Modal */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* 2. Member Management Modal */}
      <MemberManagementModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        players={players}
        adminPassword={adminPassword}
        isAdmin={isAdmin}
        onRequestAdminLogin={() => setShowAdminLogin(true)}
        onPlayerAdded={(newP, allP) => {
          setPlayers(allP);
          showToast(`已成功添加棋手 "${newP.name}"，已同步全设备！`, 'success');
        }}
        onPlayerDeleted={(allP) => {
          setPlayers(allP);
          showToast('已更新成员名单并同步', 'info');
        }}
        onPlayerUpdated={(updatedP, allP) => {
          setPlayers(allP);
          showToast(`已更新「${updatedP.name}」天梯数据并同步至所有设备`, 'success');
        }}
        onBatchSyncPlayers={(allP) => {
          setPlayers(allP);
          showToast(`已成功同步 ${allP.length} 名成员至云端数据库！`, 'success');
        }}
      />

      {/* 3. New Match Modal (Validates Red & Black members) */}
      <NewMatchModal
        isOpen={showNewMatchModal}
        onClose={() => setShowNewMatchModal(false)}
        players={players}
        onStartMatch={handleStartMatch}
      />

      {/* 4. Player Profile Dossier Modal */}
      <PlayerProfileModal
        player={selectedProfilePlayer}
        matchHistory={matchHistory}
        isAdmin={isAdmin}
        adminPassword={adminPassword}
        onClose={() => setSelectedProfilePlayer(null)}
        onReplayMatch={(m) => {
          setSelectedProfilePlayer(null);
          setReplayMatch(m);
        }}
        onPlayerUpdated={(updatedP) => {
          setPlayers(prev => prev.map(p => p.id === updatedP.id ? updatedP : p));
          setSelectedProfilePlayer(updatedP);
          showToast(`已成功更新「${updatedP.name}」排位分与段位`, 'success');
        }}
      />

      {/* 5. 棋谱复盘与导出 Modal */}
      <ReplayModal
        match={replayMatch}
        onClose={() => setReplayMatch(null)}
      />

      {/* 6. Native App Packaging & Deployment Modal */}
      <NativeAppModal
        isOpen={showNativeAppModal}
        onClose={() => setShowNativeAppModal(false)}
      />
    </div>
  );
}
