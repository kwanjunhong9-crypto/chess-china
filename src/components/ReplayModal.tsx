import React, { useState, useEffect } from 'react';
import { MatchRecord } from '../types/chess';
import { ChessBoard } from './ChessBoard';
import { createInitialBoard, cloneBoard, exportToPGN } from '../utils/chessEngine';
import { X, Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Download, Copy, Check, RotateCcw } from 'lucide-react';

interface Props {
  match: MatchRecord | null;
  onClose: () => void;
}

export const ReplayModal: React.FC<Props> = ({ match, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1500); // ms
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Reset to start when match changes
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [match]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && match && match.moves.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= match.moves.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playSpeed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, match, playSpeed]);

  if (!match) return null;

  const totalSteps = match.moves.length;

  // Reconstruct board at current step
  const reconstructBoard = () => {
    let board = createInitialBoard();
    for (let i = 0; i < currentStepIndex && i < totalSteps; i++) {
      const m = match.moves[i];
      const fromR = m.from[0];
      const fromC = m.from[1];
      const toR = m.to[0];
      const toC = m.to[1];
      const piece = board[fromR][fromC];
      board[toR][toC] = piece;
      board[fromR][fromC] = null;
    }
    return board;
  };

  const currentBoard = reconstructBoard();
  const lastMove = currentStepIndex > 0 ? {
    from: { row: match.moves[currentStepIndex - 1].from[0], col: match.moves[currentStepIndex - 1].from[1] },
    to: { row: match.moves[currentStepIndex - 1].to[0], col: match.moves[currentStepIndex - 1].to[1] },
  } : null;

  const currentMoveRecord = currentStepIndex > 0 ? match.moves[currentStepIndex - 1] : null;

  // Export handlers
  const handleCopyPGN = () => {
    const pgn = exportToPGN(
      match.redPlayer.name,
      match.blackPlayer.name,
      match.mode,
      match.moves,
      match.winner === 'red' ? '1-0' : match.winner === 'black' ? '0-1' : '1/2-1/2'
    );
    navigator.clipboard.writeText(pgn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPGN = () => {
    const pgn = exportToPGN(
      match.redPlayer.name,
      match.blackPlayer.name,
      match.mode,
      match.moves,
      match.winner === 'red' ? '1-0' : match.winner === 'black' ? '0-1' : '1/2-1/2'
    );
    const blob = new Blob([pgn], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `棋谱_${match.redPlayer.name}VS${match.blackPlayer.name}_${match.id}.pgn`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5">
      <div className="w-full max-w-4xl max-h-[95vh] rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl flex flex-col overflow-hidden text-stone-100">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 bg-stone-950 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-amber-200">
                  棋谱智能复盘 · {match.redPlayer.name} (红) VS {match.blackPlayer.name} (黑)
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                  {match.mode === 'ranked' ? '排位天梯' : '休闲匹配'}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                胜负结果：{match.winner === 'red' ? `${match.redPlayer.name} 执红获胜` : match.winner === 'black' ? `${match.blackPlayer.name} 执黑获胜` : '双方和棋'} · {match.winReason || '终局'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPGN}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs transition border border-stone-700"
              title="复制棋谱PGN"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
              <span>{copied ? '已复制棋谱' : '复制PGN'}</span>
            </button>

            <button
              onClick={handleDownloadPGN}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition shadow"
              title="下载棋谱文件"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出棋谱</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Replay Main View: Split for Board & Move List */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
          {/* Left: Interactive Board */}
          <div className="md:col-span-7 flex flex-col items-center justify-center">
            <ChessBoard
              board={currentBoard}
              selectedPos={null}
              legalMoves={[]}
              lastMove={lastMove}
              isAdmin={false}
              activeColor="red"
              onSelectPiece={() => {}}
              onMoveTo={() => {}}
            />

            {/* Step Controls Bar */}
            <div className="mt-4 w-full max-w-[480px] bg-stone-950 p-3 rounded-xl border border-stone-800 flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-xs text-stone-400">
                <span>
                  当前步骤：<strong className="text-amber-400">{currentStepIndex}</strong> / {totalSteps}
                </span>
                <span className="text-amber-300 font-serif">
                  {currentMoveRecord ? `第${currentStepIndex}手：${currentMoveRecord.side === 'red' ? '红方' : '黑方'} ${currentMoveRecord.notation}` : '开局初始'}
                </span>
              </div>

              {/* Progress Slider */}
              <input
                type="range"
                min="0"
                max={totalSteps}
                value={currentStepIndex}
                onChange={(e) => {
                  setCurrentStepIndex(Number(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
              />

              {/* Playback Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setCurrentStepIndex(0);
                      setIsPlaying(false);
                    }}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
                    title="开局"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStepIndex((prev) => Math.max(0, prev - 1));
                      setIsPlaying(false);
                    }}
                    disabled={currentStepIndex <= 0}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-40"
                    title="上一手"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1 shadow"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? '暂停' : '播放'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStepIndex((prev) => Math.min(totalSteps, prev + 1));
                      setIsPlaying(false);
                    }}
                    disabled={currentStepIndex >= totalSteps}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-40"
                    title="下一手"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStepIndex(totalSteps);
                      setIsPlaying(false);
                    }}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
                    title="终局"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed Selector */}
                <div className="flex items-center gap-1 text-[11px] text-stone-400">
                  <span>速度:</span>
                  {[2000, 1200, 600].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaySpeed(speed)}
                      className={`px-2 py-0.5 rounded ${
                        playSpeed === speed ? 'bg-amber-600 text-stone-950 font-bold' : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      {speed === 2000 ? '慢' : speed === 1200 ? '中' : '快'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Detailed Move List & AI Verdict */}
          <div className="md:col-span-5 flex flex-col gap-3">
            {/* AI Arbiter Summary */}
            {match.aiAnalysis && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs">
                <span className="font-bold text-amber-400 block mb-1">🤖 AI裁判长对局复盘评述</span>
                <p className="text-amber-200/90 leading-relaxed">{match.aiAnalysis}</p>
              </div>
            )}

            {/* Step List Container */}
            <div className="flex-1 bg-stone-950 rounded-xl border border-stone-800 p-3 flex flex-col overflow-hidden max-h-[380px]">
              <div className="flex justify-between items-center pb-2 border-b border-stone-800 mb-2">
                <span className="text-xs font-bold text-stone-300">着法记录表 (点击跳转)</span>
                <span className="text-[10px] text-stone-500">共 {totalSteps} 手</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
                {Array.from({ length: Math.ceil(totalSteps / 2) }).map((_, roundIdx) => {
                  const redStep = roundIdx * 2 + 1;
                  const blackStep = roundIdx * 2 + 2;
                  const redMove = match.moves[redStep - 1];
                  const blackMove = match.moves[blackStep - 1];

                  return (
                    <div
                      key={`round-${roundIdx}`}
                      className="grid grid-cols-12 gap-1 py-1 px-1.5 rounded-lg hover:bg-stone-900 items-center text-xs"
                    >
                      <span className="col-span-2 text-stone-500 text-[11px]">
                        {roundIdx + 1}.
                      </span>

                      {/* Red Move */}
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStepIndex(redStep);
                          setIsPlaying(false);
                        }}
                        className={`col-span-5 text-left px-2 py-1 rounded transition text-xs ${
                          currentStepIndex === redStep
                            ? 'bg-red-950/80 text-red-300 border border-red-500/50 font-bold'
                            : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        {redMove ? redMove.notation : ''}
                      </button>

                      {/* Black Move */}
                      <button
                        type="button"
                        onClick={() => {
                          if (blackMove) {
                            setCurrentStepIndex(blackStep);
                            setIsPlaying(false);
                          }
                        }}
                        disabled={!blackMove}
                        className={`col-span-5 text-left px-2 py-1 rounded transition text-xs ${
                          currentStepIndex === blackStep
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 font-bold'
                            : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        {blackMove ? blackMove.notation : ''}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
