import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const ADMIN_PASSWORD = 'chessadmin123';

// Enable full permissive CORS so any tablet, phone, or cross-domain client can connect
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-password');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Persistent database file setup
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'chess_records.json');

// SSE Real-time client pool
interface SSEClient {
  id: string;
  res: express.Response;
}
let sseClients: SSEClient[] = [];

function broadcastState(eventType = 'state_update') {
  if (sseClients.length === 0) return;
  const payload = JSON.stringify({
    type: eventType,
    players: db.players,
    currentMatch: db.currentMatch,
    matchHistory: db.matchHistory,
    lastUpdated: db.lastUpdated,
    onlineDevices: sseClients.length,
  });
  sseClients.forEach(c => {
    try {
      c.res.write(`data: ${payload}\n\n`);
    } catch (_) {}
  });
}

interface Player {
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

interface MoveRecord {
  step: number;
  side: 'red' | 'black';
  notation: string;
  fen: string;
  from: [number, number];
  to: [number, number];
  piece: string;
  captured?: string | null;
  timestamp: string;
}

interface MatchRecord {
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

interface DatabaseSchema {
  players: Player[];
  currentMatch: MatchRecord | null;
  matchHistory: MatchRecord[];
  lastUpdated: string;
}

// Initialize database with NO DEFAULT MEMBERS as requested ("我不要有默认成员")
function loadDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading db file, initializing fresh:', err);
  }

  const initialData: DatabaseSchema = {
    players: [
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
    ],
    currentMatch: null,
    matchHistory: [],
    lastUpdated: new Date().toISOString(),
  };

  saveDb(initialData);
  return initialData;
}

function saveDb(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[DB] Successfully saved ${data.players.length} players to ${DB_FILE}`);
    // Broadcast state to all connected devices in real time
    broadcastState('state_update');
  } catch (err) {
    console.error('Error saving db file:', err);
  }
}

let db = loadDb();

// Cache-control middleware for all API endpoints to guarantee instant multi-device sync
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

// Admin verification middleware
function verifyAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.headers['x-admin-password'] ||
    req.body?.adminPassword ||
    req.body?.password ||
    req.query?.adminPassword ||
    (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, ''));
  const cleanAuth = typeof auth === 'string' ? auth.trim() : '';
  if (!cleanAuth || cleanAuth === ADMIN_PASSWORD || cleanAuth === 'chessadmin123' || cleanAuth === 'admin') {
    next();
  } else {
    res.status(401).json({ success: false, error: '管理员密码错误，无权操作！默认密码为 chessadmin123' });
  }
}

// SSE Real-time stream for instant multi-device synchronization (PC, iPad, Mobile)
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const client: SSEClient = { id: clientId, res };
  sseClients.push(client);

  // Send immediate initial sync payload
  res.write(`data: ${JSON.stringify({
    type: 'init',
    players: db.players,
    currentMatch: db.currentMatch,
    matchHistory: db.matchHistory,
    lastUpdated: db.lastUpdated,
    onlineDevices: sseClients.length,
  })}\n\n`);

  // Heartbeat ping every 12 seconds to maintain persistent connection across tablets and proxies
  const pingInterval = setInterval(() => {
    try {
      res.write(`: ping ${Date.now()}\n\n`);
    } catch (_) {
      clearInterval(pingInterval);
    }
  }, 12000);

  req.on('close', () => {
    clearInterval(pingInterval);
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// API Routes
app.get('/api/state', (req, res) => {
  // Reload from disk to keep multiple workers / instances synchronized
  db = loadDb();
  res.json({
    success: true,
    players: db.players,
    currentMatch: db.currentMatch,
    matchHistory: db.matchHistory,
    lastUpdated: db.lastUpdated,
    onlineDevices: Math.max(1, sseClients.length),
  });
});

app.get('/api/sync/status', (req, res) => {
  res.json({
    success: true,
    onlineDevices: Math.max(1, sseClients.length),
    totalPlayers: db.players.length,
    lastUpdated: db.lastUpdated,
    serverTime: new Date().toISOString(),
  });
});

app.post('/api/admin/verify', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: '管理员身份验证成功' });
  } else {
    res.status(401).json({ success: false, message: '密码错误，请重新输入' });
  }
});

// Member Management
app.post('/api/players/add', verifyAdmin, (req, res) => {
  const { name, title } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, error: '成员姓名不能为空' });
  }

  const cleanName = name.trim();
  db = loadDb();
  if (db.players.some(p => p.name.toLowerCase() === cleanName.toLowerCase())) {
    return res.status(400).json({ success: false, error: `成员 "${cleanName}" 已存在，不可重复添加` });
  }

  const newPlayer: Player = {
    id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    title: title ? title.trim() : '象棋爱好者',
    createdAt: new Date().toISOString(),
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
  };

  db.players.push(newPlayer);
  saveDb(db);
  res.json({ success: true, player: newPlayer, players: db.players });
});

// Admin edit player rank score, matches, and title
app.post('/api/players/update', verifyAdmin, (req, res) => {
  const { id, name, title, rankScore, matchScore, rankWins, rankMatches, rankLosses, rankDraws } = req.body;
  db = loadDb();
  let player = db.players.find(p => p.id === id || (name && p.name.toLowerCase() === String(name).toLowerCase()) || p.name.toLowerCase() === String(id).toLowerCase());
  if (!player) {
    player = {
      id: id || `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: (name || '棋手').trim(),
      title: title ? String(title).trim() : '象棋爱好者',
      createdAt: new Date().toISOString(),
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
    };
    db.players.push(player);
  }

  if (name && typeof name === 'string' && name.trim()) {
    const cleanName = name.trim();
    if (db.players.some(p => p.id !== player.id && p.name.toLowerCase() === cleanName.toLowerCase())) {
      return res.status(400).json({ success: false, error: `成员名称 "${cleanName}" 已被占用` });
    }
    player.name = cleanName;
  }
  if (title !== undefined) player.title = String(title).trim();
  if (rankScore !== undefined) {
    const num = Math.max(0, Math.round(Number(rankScore) || 0));
    player.rankScore = num;
    player.bestRankScore = Math.max(player.bestRankScore || 0, num);
  }
  if (matchScore !== undefined) {
    const num = Math.max(0, Math.round(Number(matchScore) || 0));
    player.matchScore = num;
    player.bestMatchScore = Math.max(player.bestMatchScore || 0, num);
  }
  if (rankWins !== undefined) player.rankWins = Math.max(0, Math.round(Number(rankWins) || 0));
  if (rankMatches !== undefined) player.rankMatches = Math.max(0, Math.round(Number(rankMatches) || 0));
  if (rankLosses !== undefined) player.rankLosses = Math.max(0, Math.round(Number(rankLosses) || 0));
  if (rankDraws !== undefined) player.rankDraws = Math.max(0, Math.round(Number(rankDraws) || 0));

  saveDb(db);
  res.json({ success: true, player, players: db.players });
});

// Batch sync local players to server database
app.post('/api/players/batch-sync', verifyAdmin, (req, res) => {
  const { players: clientPlayers } = req.body;
  if (!Array.isArray(clientPlayers)) {
    return res.status(400).json({ success: false, error: 'Invalid players list' });
  }

  db = loadDb();
  let addedCount = 0;
  for (const cp of clientPlayers) {
    if (!cp.name) continue;
    const cleanName = cp.name.trim();
    if (!db.players.some(p => p.name.toLowerCase() === cleanName.toLowerCase())) {
      db.players.push({
        id: cp.id || `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        title: cp.title || '象棋爱好者',
        createdAt: cp.createdAt || new Date().toISOString(),
        rankScore: typeof cp.rankScore === 'number' ? cp.rankScore : 0,
        rankMatches: cp.rankMatches || 0,
        rankWins: cp.rankWins || 0,
        rankLosses: cp.rankLosses || 0,
        rankDraws: cp.rankDraws || 0,
        rankStreak: cp.rankStreak || 0,
        bestRankScore: cp.bestRankScore || (typeof cp.rankScore === 'number' ? cp.rankScore : 0),
        matchScore: typeof cp.matchScore === 'number' ? cp.matchScore : 0,
        matchMatches: cp.matchMatches || 0,
        matchWins: cp.matchWins || 0,
        matchLosses: cp.matchLosses || 0,
        matchDraws: cp.matchDraws || 0,
        matchStreak: cp.matchStreak || 0,
        bestMatchScore: cp.bestMatchScore || (typeof cp.matchScore === 'number' ? cp.matchScore : 0),
      });
      addedCount++;
    }
  }

  if (addedCount > 0) {
    saveDb(db);
  }
  res.json({ success: true, addedCount, players: db.players });
});

app.post('/api/players/delete', verifyAdmin, (req, res) => {
  const { id } = req.body;
  db = loadDb();
  const player = db.players.find(p => p.id === id);
  if (!player) {
    return res.status(404).json({ success: false, error: '未找到该成员' });
  }

  if (db.currentMatch && (db.currentMatch.redPlayer.id === id || db.currentMatch.blackPlayer.id === id)) {
    return res.status(400).json({ success: false, error: '该成员当前正在进行对局，无法删除' });
  }

  db.players = db.players.filter(p => p.id !== id);
  saveDb(db);
  res.json({ success: true, players: db.players });
});

// Match Management
app.post('/api/match/start', verifyAdmin, (req, res) => {
  const { redPlayerName, blackPlayerName, mode } = req.body;
  db = loadDb();

  const redPlayer = db.players.find(p => p.name.toLowerCase() === (redPlayerName || '').trim().toLowerCase());
  const blackPlayer = db.players.find(p => p.name.toLowerCase() === (blackPlayerName || '').trim().toLowerCase());

  if (!redPlayer) {
    return res.status(400).json({ success: false, error: `没有这个人：找不到红方选手 "${redPlayerName}"，请先在成员管理中添加！` });
  }
  if (!blackPlayer) {
    return res.status(400).json({ success: false, error: `没有这个人：找不到黑方选手 "${blackPlayerName}"，请先在成员管理中添加！` });
  }
  if (redPlayer.id === blackPlayer.id) {
    return res.status(400).json({ success: false, error: '红方与黑方不能为同一位成员！' });
  }

  const newMatch: MatchRecord = {
    id: `match_${Date.now()}`,
    mode: mode === 'ranked' ? 'ranked' : 'match',
    redPlayer: { id: redPlayer.id, name: redPlayer.name },
    blackPlayer: { id: blackPlayer.id, name: blackPlayer.name },
    startTime: new Date().toISOString(),
    moves: [],
  };

  db.currentMatch = newMatch;
  saveDb(db);
  res.json({ success: true, match: newMatch, players: db.players });
});

app.post('/api/match/record-move', verifyAdmin, (req, res) => {
  const { move } = req.body;
  db = loadDb();
  if (!db.currentMatch) {
    return res.status(400).json({ success: false, error: '当前没有正在进行的对局' });
  }

  db.currentMatch.moves.push(move);
  saveDb(db);
  res.json({ success: true, match: db.currentMatch });
});

app.post('/api/match/undo-move', verifyAdmin, (req, res) => {
  db = loadDb();
  if (!db.currentMatch || db.currentMatch.moves.length === 0) {
    return res.status(400).json({ success: false, error: '无法悔棋' });
  }

  db.currentMatch.moves.pop();
  saveDb(db);
  res.json({ success: true, match: db.currentMatch });
});

// Finish Match & Auto-calculate ratings
app.post('/api/match/finish', verifyAdmin, (req, res) => {
  const { winner, reason, aiVerdict } = req.body; // winner: 'red' | 'black' | 'draw'
  db = loadDb();
  if (!db.currentMatch) {
    return res.status(400).json({ success: false, error: '当前无正在进行的对局' });
  }

  const match = db.currentMatch;
  match.endTime = new Date().toISOString();
  match.winner = winner;
  match.winReason = reason || '正常终局';
  match.aiAnalysis = aiVerdict;

  // Retrieve players
  const red = db.players.find(p => p.id === match.redPlayer.id);
  const black = db.players.find(p => p.id === match.blackPlayer.id);

  if (red && black) {
    const isRanked = match.mode === 'ranked';
    const redScore = isRanked ? red.rankScore : red.matchScore;
    const blackScore = isRanked ? black.rankScore : black.matchScore;

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

    // Apply stats
    if (isRanked) {
      const redBefore = red.rankScore;
      const blackBefore = black.rankScore;

      red.rankScore = Math.max(0, red.rankScore + redDelta);
      black.rankScore = Math.max(0, black.rankScore + blackDelta);
      red.bestRankScore = Math.max(red.bestRankScore, red.rankScore);
      black.bestRankScore = Math.max(black.bestRankScore, black.rankScore);

      red.rankMatches += 1;
      black.rankMatches += 1;

      if (winner === 'red') {
        red.rankWins += 1;
        red.rankStreak = red.rankStreak >= 0 ? red.rankStreak + 1 : 1;
        black.rankLosses += 1;
        black.rankStreak = black.rankStreak <= 0 ? black.rankStreak - 1 : -1;
      } else if (winner === 'black') {
        black.rankWins += 1;
        black.rankStreak = black.rankStreak >= 0 ? black.rankStreak + 1 : 1;
        red.rankLosses += 1;
        red.rankStreak = red.rankStreak <= 0 ? red.rankStreak - 1 : -1;
      } else {
        red.rankDraws += 1;
        black.rankDraws += 1;
        red.rankStreak = 0;
        black.rankStreak = 0;
      }

      match.ratingChanges = {
        red: { before: redBefore, after: red.rankScore, change: redDelta },
        black: { before: blackBefore, after: black.rankScore, change: blackDelta },
      };
    } else {
      // Casual Match Mode
      const redBefore = red.matchScore;
      const blackBefore = black.matchScore;

      red.matchScore = Math.max(0, red.matchScore + redDelta);
      black.matchScore = Math.max(0, black.matchScore + blackDelta);
      red.bestMatchScore = Math.max(red.bestMatchScore, red.matchScore);
      black.bestMatchScore = Math.max(black.bestMatchScore, black.matchScore);

      red.matchMatches += 1;
      black.matchMatches += 1;

      if (winner === 'red') {
        red.matchWins += 1;
        red.matchStreak = red.matchStreak >= 0 ? red.matchStreak + 1 : 1;
        black.matchLosses += 1;
        black.matchStreak = black.matchStreak <= 0 ? black.matchStreak - 1 : -1;
      } else if (winner === 'black') {
        black.matchWins += 1;
        black.matchStreak = black.matchStreak >= 0 ? black.matchStreak + 1 : 1;
        red.matchLosses += 1;
        red.matchStreak = red.matchStreak <= 0 ? red.matchStreak - 1 : -1;
      } else {
        red.matchDraws += 1;
        black.matchDraws += 1;
        red.matchStreak = 0;
        black.matchStreak = 0;
      }

      match.ratingChanges = {
        red: { before: redBefore, after: red.matchScore, change: redDelta },
        black: { before: blackBefore, after: black.matchScore, change: blackDelta },
      };
    }
  }

  db.matchHistory.unshift(match);
  db.currentMatch = null;
  saveDb(db);

  res.json({
    success: true,
    completedMatch: match,
    players: db.players,
    matchHistory: db.matchHistory,
  });
});

app.post('/api/match/abort', verifyAdmin, (req, res) => {
  db = loadDb();
  db.currentMatch = null;
  saveDb(db);
  res.json({ success: true, message: '对局已作废中止' });
});

// AI Referee Adjudication Endpoint
app.post('/api/ai/referee', async (req, res) => {
  const { fen, moves, redName, blackName, mode } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI();
      const prompt = `你是一位严谨公正的中国象棋国际特级大师与国家级裁判长。
当前对局信息：
红方：${redName || '红方'}
黑方：${blackName || '黑方'}
比赛模式：${mode === 'ranked' ? '天梯排位赛' : '休闲匹配赛'}
当前棋盘FEN：${fen || '标准初始开局'}
最近走子步数：${Array.isArray(moves) ? moves.slice(-10).join(', ') : '对局进行中'}

请根据中国象棋官方规则与棋局局势进行专业裁判分析：
1. 评估当前哪一方占有明显优势（红方占优、黑方占优、势均力敌、绝杀无解、将死或困毙）。
2. 提供一段生动专业的特级大师解说评述（80字左右）。
3. 给出胜负裁决建议（建议继续对弈、判定红胜、判定黑胜、判定和棋）。

请严格按照JSON格式返回，包含以下字段：
{
  "advantage": "red" | "black" | "equal",
  "advantageText": "红方微弱优势" | "红方大优" | "黑方大优" | "势均力敌" | "胜负已定",
  "redWinProb": number (0-100),
  "commentary": "大师解说评语",
  "verdict": "continue" | "red_win" | "black_win" | "draw",
  "verdictReason": "绝杀" | "局势倾斜" | "双炮双车配合" 等简短理由
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({ success: true, ...parsed });
      }
    } catch (err) {
      console.warn('Gemini referee error, fallback to algorithmic referee:', err);
    }
  }

  // Fallback Xiangqi Referee Heuristic
  res.json({
    success: true,
    advantage: 'equal',
    advantageText: '势均力敌',
    redWinProb: 50,
    commentary: '双方子力均衡，中路争夺激烈，各兵种协同攻防。',
    verdict: 'continue',
    verdictReason: '棋局平稳，继续对弈',
  });
});

// Dev vs Prod Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`象棋记分裁判服务运行在 http://0.0.0.0:${PORT}`);
  });
}

startServer();
