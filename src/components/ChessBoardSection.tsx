import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, Play, Pause, RefreshCw, Zap, Cpu, Award, 
  Clock, Wifi, WifiOff, Sliders, Shield, Sparkles, CheckCircle2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText, Copy, Check, Palette, X,
  Search, BookOpen, AlertOctagon, HelpCircle, CheckCircle, Flame, Flag, Handshake
} from 'lucide-react';
import { calculateEngineMove, cppEngineClient, evaluateBoard } from '../utils/chessEngine';
import { chessSound } from '../utils/chessSound';
import { analyzeGame } from '../utils/gameReview';
import { EngineStats, GameReviewReport, MoveAnalysis } from '../types/chess';

// High-Contrast Board Themes with Theme-Adaptive Last Move Highlights
interface BoardTheme {
  id: string;
  name: string;
  darkSquare: string;
  lightSquare: string;
  border: string;
  lastMoveHighlight: string;
}

const BOARD_THEMES: BoardTheme[] = [
  { 
    id: 'cyber', 
    name: 'Cyber Obsidian', 
    darkSquare: 'bg-[#1b2238]', 
    lightSquare: 'bg-[#3b4766]', 
    border: 'border-slate-700',
    lastMoveHighlight: 'bg-blue-400/25'
  },
  { 
    id: 'emerald', 
    name: 'Emerald Green', 
    darkSquare: 'bg-[#769656]', 
    lightSquare: 'bg-[#eeeed2]', 
    border: 'border-emerald-800',
    lastMoveHighlight: 'bg-[#baca44]/75'
  },
  { 
    id: 'wood', 
    name: 'Walnut Wood', 
    darkSquare: 'bg-[#b58863]', 
    lightSquare: 'bg-[#f0d9b5]', 
    border: 'border-amber-900',
    lastMoveHighlight: 'bg-[#cdd26a]/75'
  },
  { 
    id: 'neon', 
    name: 'Midnight Violet', 
    darkSquare: 'bg-[#2d1b4e]', 
    lightSquare: 'bg-[#6b46c1]', 
    border: 'border-purple-800',
    lastMoveHighlight: 'bg-purple-400/35'
  },
];

const UNICODE_CAPTURES: Record<string, string> = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚',
  P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔',
};

interface TimePreset {
  id: string;
  name: string;
  category: 'Bullet' | 'Blitz' | 'Rapid' | 'Classical' | 'Custom';
  baseMinutes: number;
  incrementSeconds: number;
}

const TIME_PRESETS: TimePreset[] = [
  { id: 'bullet-1-0', name: '1 | 0', category: 'Bullet', baseMinutes: 1, incrementSeconds: 0 },
  { id: 'bullet-2-1', name: '2 | 1', category: 'Bullet', baseMinutes: 2, incrementSeconds: 1 },
  { id: 'blitz-3-0', name: '3 | 0', category: 'Blitz', baseMinutes: 3, incrementSeconds: 0 },
  { id: 'blitz-3-2', name: '3 | 2', category: 'Blitz', baseMinutes: 3, incrementSeconds: 2 },
  { id: 'blitz-5-0', name: '5 | 0', category: 'Blitz', baseMinutes: 5, incrementSeconds: 0 },
  { id: 'rapid-10-0', name: '10 | 0', category: 'Rapid', baseMinutes: 10, incrementSeconds: 0 },
  { id: 'rapid-15-10', name: '15 | 10', category: 'Rapid', baseMinutes: 15, incrementSeconds: 10 },
  { id: 'classical-30-0', name: '30 | 0', category: 'Classical', baseMinutes: 30, incrementSeconds: 0 },
];

interface HistoryStep {
  ply: number;
  san: string;
  fen: string;
  move: Move;
}

export const ChessBoardSection: React.FC = () => {
  // Master persistent game reference
  const gameRef = useRef<Chess>(new Chess());
  const [fen, setFen] = useState<string>(gameRef.current.fen());
  const [historySteps, setHistorySteps] = useState<HistoryStep[]>([]);
  const [viewingPly, setViewingPly] = useState<number>(0);
  const [copiedPgn, setCopiedPgn] = useState<boolean>(false);

  // Theme Customization State
  const [selectedBoardTheme, setSelectedBoardTheme] = useState<BoardTheme>(BOARD_THEMES[0]);
  const [showThemePanel, setShowThemePanel] = useState<boolean>(false);

  const [playerSide, setPlayerSide] = useState<'w' | 'b'>('w');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [isCppConnected, setIsCppConnected] = useState<boolean>(false);

  // Game Review Mode State
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [reviewReport, setReviewReport] = useState<GameReviewReport | null>(null);

  // Time Control State
  const [selectedPreset, setSelectedPreset] = useState<TimePreset>(TIME_PRESETS[4]);
  const [customMinutes, setCustomMinutes] = useState<number>(5);
  const [customIncrement, setCustomIncrement] = useState<number>(3);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Clocks in seconds
  const [whiteTime, setWhiteTime] = useState<number>(300);
  const [blackTime, setBlackTime] = useState<number>(300);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [timeOutWinner, setTimeOutWinner] = useState<string | null>(null);
  const [resignationWinner, setResignationWinner] = useState<string | null>(null);
  const [drawToast, setDrawToast] = useState<string | null>(null);
  const [dismissedModal, setDismissedModal] = useState<boolean>(false);

  const handleResign = () => {
    if (gameRef.current.isGameOver() || timeOutWinner || resignationWinner) return;
    const winner = playerSide === 'w' ? 'KnightShift (Black)' : 'You (White)';
    setResignationWinner(`${winner} won by resignation`);
    chessSound.playEnd(playerSide === 'b');
  };

  const handleOfferDraw = () => {
    if (gameRef.current.isGameOver() || timeOutWinner || resignationWinner) return;
    chessSound.playMove();
    setDrawToast('KnightShift declined the draw offer.');
    setTimeout(() => setDrawToast(null), 3000);
  };

  // Engine depth setting
  const [engineDepth, setEngineDepth] = useState<number>(5);
  const [isEngineThinking, setIsEngineThinking] = useState<boolean>(false);
  const [autoDemo, setAutoDemo] = useState<boolean>(false);
  
  // Dragged piece state
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);

  // Engine Statistics HUD
  const [stats, setStats] = useState<EngineStats>({
    depth: 5,
    selDepth: 8,
    nodes: 42890,
    nps: 650000,
    timeMs: 68,
    score: 0.0,
    isMate: false,
    pv: ['e2e4', 'e7e5', 'g1f3', 'b8c6'],
    hashUsageMb: 24,
    hashUsagePct: 18,
    ttHitRatePct: 58,
    betaCutoffPct: 79,
    pvsResearchesPct: 4,
    lmrReductionsPct: 32,
    historyUpdates: 22400,
    killerUpdates: 9800,
  });

  // Solid Piece Rendering
  const renderSolidPiece = (pieceKey: string) => {
    const isWhite = pieceKey.startsWith('w');
    const type = pieceKey.substring(1);
    const unicodeMap: Record<string, string> = { P: '♟', N: '♞', B: '♝', R: '♜', Q: '♛', K: '♚' };
    const symbol = unicodeMap[type] || '♟';

    return (
      <span 
        className="text-3xl sm:text-5xl font-mono select-none transition-transform hover:scale-105"
        style={{
          color: isWhite ? '#ffffff' : '#0f172a',
          filter: isWhite 
            ? 'drop-shadow(0px 2px 4px rgba(0,0,0,0.9))' 
            : 'drop-shadow(0px 0px 3px rgba(255,255,255,0.9))',
          WebkitTextStroke: isWhite ? 'none' : '1px rgba(255,255,255,0.4)'
        }}
      >
        {symbol}
      </span>
    );
  };

  // Check C++ WebSocket connection
  useEffect(() => {
    const interval = setInterval(() => {
      setIsCppConnected(cppEngineClient.getIsConnected());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isViewingLive = viewingPly === historySteps.length;
  const displayFen = !isViewingLive
    ? (viewingPly === 0 ? new Chess().fen() : historySteps[viewingPly - 1].fen)
    : fen;

  const displayGame = new Chess(displayFen);
  const officialPgn = gameRef.current.pgn();

  const isCheckmate = displayGame.isCheckmate();
  const isDraw = displayGame.isDraw() || displayGame.isStalemate();
  const isGameOver = isCheckmate || isDraw || !!timeOutWinner || !!resignationWinner;

  // Trigger Game End Sound on Game Over
  useEffect(() => {
    if (isGameOver && !dismissedModal) {
      const isPlayerWin = (isCheckmate && displayGame.turn() === 'b' && playerSide === 'w') ||
                          (timeOutWinner && timeOutWinner.includes('White wins')) ||
                          (resignationWinner && resignationWinner.includes('You (White)'));
      chessSound.playEnd(!!isPlayerWin);

      // Auto Generate Game Review Report when game ends
      if (historySteps.length > 0 && !reviewReport) {
        const report = analyzeGame(historySteps);
        setReviewReport(report);
      }
    }
  }, [isGameOver, isCheckmate, timeOutWinner, resignationWinner, dismissedModal, displayGame, playerSide, historySteps, reviewReport]);

  // Instant Real-Time Evaluation Score calculation (Stable from White perspective)
  const currentEval = useMemo(() => {
    const activeGame = new Chess(displayFen);
    
    if (activeGame.isCheckmate()) {
      return activeGame.turn() === 'w' ? -99.9 : 99.9;
    }
    if (activeGame.isDraw() || activeGame.isStalemate()) {
      return 0.0;
    }

    const rawCp = evaluateBoard(activeGame);
    return parseFloat((rawCp / 100.0).toFixed(2));
  }, [displayFen]);

  // Current Move Review Analysis
  const activeMoveAnalysis = useMemo(() => {
    if (!reviewReport || viewingPly === 0 || viewingPly > reviewReport.analyses.length) return null;
    return reviewReport.analyses[viewingPly - 1];
  }, [reviewReport, viewingPly]);

  // Calibrated Evaluation Bar Fill Percentage
  let whiteBarPct = 50;
  if (isCheckmate) {
    whiteBarPct = displayGame.turn() === 'w' ? 0 : 100;
  } else if (isDraw) {
    whiteBarPct = 50;
  } else {
    const rawPct = 50 + (currentEval * 7);
    whiteBarPct = Math.min(95, Math.max(5, rawPct));
  }
  if (isFlipped) {
    whiteBarPct = 100 - whiteBarPct;
  }

  const copyPgnToClipboard = () => {
    if (!officialPgn) return;
    navigator.clipboard.writeText(officialPgn);
    setCopiedPgn(true);
    setTimeout(() => setCopiedPgn(false), 2000);
  };

  const applyTimePreset = (preset: TimePreset) => {
    setSelectedPreset(preset);
    setIsCustomMode(preset.category === 'Custom');
    const totalSec = preset.baseMinutes * 60;
    setWhiteTime(totalSec);
    setBlackTime(totalSec);
    setTimeOutWinner(null);
    setResignationWinner(null);
    setDrawToast(null);
    setDismissedModal(false);
    setGameStarted(false);
    setIsReviewMode(false);
  };

  const applyCustomTime = (mins: number, inc: number) => {
    setCustomMinutes(mins);
    setCustomIncrement(inc);
    const totalSec = mins * 60;
    setWhiteTime(totalSec);
    setBlackTime(totalSec);
    setTimeOutWinner(null);
    setResignationWinner(null);
    setDrawToast(null);
    setDismissedModal(false);
    setGameStarted(false);
    setIsReviewMode(false);
  };

  // Clock Countdown Timer
  useEffect(() => {
    if (!gameStarted || gameRef.current.isGameOver() || timeOutWinner || resignationWinner) return;

    const timer = setInterval(() => {
      if (gameRef.current.turn() === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 0.1) {
            setTimeOutWinner('Black wins on time');
            return 0;
          }
          return prev - 0.1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 0.1) {
            setTimeOutWinner('White wins on time');
            return 0;
          }
          return prev - 0.1;
        });
      }
    }, 100);

    return () => clearInterval(timer);
  }, [gameStarted, fen, timeOutWinner, resignationWinner]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '00:00';
    if (seconds < 10) return `${seconds.toFixed(1)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Captured pieces tracking
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);

  const updateCapturedPieces = useCallback(() => {
    const history = gameRef.current.history({ verbose: true });
    const whiteCaps: string[] = [];
    const blackCaps: string[] = [];

    history.forEach((m) => {
      if (m.captured) {
        if (m.color === 'w') blackCaps.push(m.captured);
        else whiteCaps.push(m.captured);
      }
    });

    setCapturedWhite(whiteCaps);
    setCapturedBlack(blackCaps);
  }, []);

  const navigateToPly = (ply: number) => {
    if (ply < 0 || ply > historySteps.length) return;
    setViewingPly(ply);
    chessSound.playMove();
    if (ply > 0 && ply <= historySteps.length) {
      const step = historySteps[ply - 1];
      setLastMove({ from: step.move.from as Square, to: step.move.to as Square });
    } else {
      setLastMove(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setViewingPly((prev) => Math.max(0, prev - 1));
        chessSound.playMove();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setViewingPly((prev) => Math.min(historySteps.length, prev + 1));
        chessSound.playMove();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setViewingPly(0);
        chessSound.playMove();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setViewingPly(historySteps.length);
        chessSound.playMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historySteps.length]);

  const triggerEngineMove = useCallback(async () => {
    if (gameRef.current.isGameOver() || timeOutWinner || resignationWinner) return;
    
    setIsEngineThinking(true);
    const inc = isCustomMode ? customIncrement : selectedPreset.incrementSeconds;
    const result = await calculateEngineMove(
      gameRef.current, 
      engineDepth, 
      whiteTime,
      blackTime,
      inc,
      inc,
      (liveTelemetry) => {
        setStats(prev => ({ ...prev, ...liveTelemetry }));
      }
    );
    setIsEngineThinking(false);

    if (result.bestMove) {
      try {
        const move = gameRef.current.move(result.bestMove);
        if (move) {
          if (move.captured) chessSound.playCapture();
          else if (move.san.includes('+')) chessSound.playCheck();
          else chessSound.playMove();

          if (move.color === 'w') setWhiteTime(prev => prev + inc);
          else setBlackTime(prev => prev + inc);

          const step: HistoryStep = {
            ply: historySteps.length + 1,
            san: move.san,
            fen: gameRef.current.fen(),
            move: move
          };

          setHistorySteps(prev => {
            const nextH = [...prev, step];
            setViewingPly(nextH.length);
            return nextH;
          });

          setFen(gameRef.current.fen());
          setLastMove({ from: move.from as Square, to: move.to as Square });
          setStats(result.stats);
          updateCapturedPieces();
        }
      } catch (e) {}
    }
  }, [engineDepth, updateCapturedPieces, isCustomMode, customIncrement, selectedPreset, timeOutWinner, resignationWinner, historySteps.length, whiteTime, blackTime]);

  const executeMove = (from: Square, to: Square) => {
    if (isEngineThinking || timeOutWinner || resignationWinner) return false;

    try {
      const move = gameRef.current.move({ from, to, promotion: 'q' });
      if (move) {
        if (!gameStarted) {
          chessSound.playStart();
          setGameStarted(true);
        }

        if (move.captured) chessSound.playCapture();
        else if (move.san.includes('+')) chessSound.playCheck();
        else chessSound.playMove();

        const inc = isCustomMode ? customIncrement : selectedPreset.incrementSeconds;
        if (move.color === 'w') setWhiteTime(prev => prev + inc);
        else setBlackTime(prev => prev + inc);

        const step: HistoryStep = {
          ply: historySteps.length + 1,
          san: move.san,
          fen: gameRef.current.fen(),
          move: move
        };

        const updatedH = [...historySteps, step];
        setHistorySteps(updatedH);
        setViewingPly(updatedH.length);

        setFen(gameRef.current.fen());
        setLastMove({ from: move.from as Square, to: move.to as Square });
        setSelectedSquare(null);
        setLegalMoves([]);
        updateCapturedPieces();

        if (!gameRef.current.isGameOver()) {
          setTimeout(() => {
            triggerEngineMove();
          }, 250);
        }
        return true;
      }
    } catch (e) {}
    return false;
  };

  const handleSquareClick = (square: Square) => {
    if (isEngineThinking || timeOutWinner || resignationWinner) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    if (selectedSquare && legalMoves.includes(square)) {
      executeMove(selectedSquare, square);
      return;
    }

    const piece = displayGame.get(square);
    if (piece && piece.color === gameRef.current.turn()) {
      if (viewingPly !== historySteps.length) {
        setViewingPly(historySteps.length);
      }
      setSelectedSquare(square);
      const moves = gameRef.current.moves({ square, verbose: true });
      setLegalMoves(moves.map(m => m.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handleDragStart = (square: Square) => {
    const piece = displayGame.get(square);
    if (piece && piece.color === gameRef.current.turn()) {
      if (viewingPly !== historySteps.length) {
        setViewingPly(historySteps.length);
      }
      setDraggedSquare(square);
      setSelectedSquare(square);
      const moves = gameRef.current.moves({ square, verbose: true });
      setLegalMoves(moves.map(m => m.to as Square));
    }
  };

  const handleDrop = (targetSquare: Square) => {
    if (draggedSquare && legalMoves.includes(targetSquare)) {
      executeMove(draggedSquare, targetSquare);
    }
    setDraggedSquare(null);
  };

  const resetBoard = () => {
    chessSound.playStart();
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setHistorySteps([]);
    setViewingPly(0);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setTimeOutWinner(null);
    setResignationWinner(null);
    setDrawToast(null);
    setDismissedModal(false);
    setGameStarted(false);
    setIsReviewMode(false);
    setReviewReport(null);
    const totalSec = isCustomMode ? customMinutes * 60 : selectedPreset.baseMinutes * 60;
    setWhiteTime(totalSec);
    setBlackTime(totalSec);
    updateCapturedPieces();
  };

  const startReviewMode = () => {
    if (historySteps.length > 0) {
      const report = analyzeGame(historySteps);
      setReviewReport(report);
      setIsReviewMode(true);
      setDismissedModal(true);
      setViewingPly(1);
    }
  };

  const undoMove = () => {
    if (isEngineThinking) return;
    chessSound.playMove();
    gameRef.current.undo();
    gameRef.current.undo();
    setFen(gameRef.current.fen());
    
    const updatedH = historySteps.slice(0, Math.max(0, historySteps.length - 2));
    setHistorySteps(updatedH);
    setViewingPly(updatedH.length);

    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    updateCapturedPieces();
  };

  useEffect(() => {
    let timer: any;
    if (autoDemo && !gameRef.current.isGameOver() && !isEngineThinking && !timeOutWinner && !resignationWinner) {
      timer = setTimeout(() => {
        triggerEngineMove();
      }, 800);
    }
    return () => clearTimeout(timer);
  }, [autoDemo, fen, isEngineThinking, triggerEngineMove, timeOutWinner, resignationWinner]);

  const currentBoard = displayGame.board();
  const boardRanks = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const boardFiles = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const filesLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  // Calculate Best Move SVG Arrow Coordinates for Review Mode
  const getSquareCoords = (square: string) => {
    const fileIdx = square.charCodeAt(0) - 97; // 'a' -> 0
    const rankIdx = parseInt(square[1]) - 1;   // '1' -> 0
    const col = isFlipped ? (7 - fileIdx) : fileIdx;
    const row = isFlipped ? rankIdx : (7 - rankIdx);
    return {
      x: (col + 0.5) * 12.5,
      y: (row + 0.5) * 12.5
    };
  };

  const pgnPairs: Array<{ moveNum: number, whiteStep?: HistoryStep, blackStep?: HistoryStep }> = [];
  for (let i = 0; i < historySteps.length; i += 2) {
    pgnPairs.push({
      moveNum: Math.floor(i / 2) + 1,
      whiteStep: historySteps[i],
      blackStep: historySteps[i + 1]
    });
  }

  // Classification Color Mapping
  const getBadgeStyle = (type: string) => {
    switch(type) {
      case 'brilliant': return 'bg-cyan-500 text-white font-extrabold shadow-glow-cyan';
      case 'great': return 'bg-emerald-500 text-white font-bold';
      case 'best': return 'bg-emerald-600 text-white font-bold';
      case 'inaccuracy': return 'bg-amber-500 text-slate-950 font-bold';
      case 'mistake': return 'bg-orange-500 text-white font-bold';
      case 'blunder': return 'bg-rose-600 text-white font-extrabold shadow-glow-accent';
      case 'book': return 'bg-blue-500 text-white font-bold';
      default: return 'bg-slate-700 text-white';
    }
  };

  return (
    <section id="live-engine" className="py-24 relative bg-[#090a0e] dark:bg-[#090a0e] light:bg-[#f1f5f9] overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-3">
            <span className="text-base select-none">♞</span>
            KNIGHTSHIFT LIVE ENGINE
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight mb-3 font-sans">
            Play Against <span className="text-gradient-blue">KnightShift</span>
          </h2>

          {/* Connection Badge */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {isCppConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 light:text-emerald-800 text-xs font-mono">
                <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-ping" />
                C++ KnightShift Engine Active (ws://localhost:8080)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 light:text-amber-800 text-xs font-mono">
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                Browser Engine Fallback Mode
              </span>
            )}
          </div>
        </div>

        {/* Time Control Options Bar */}
        <div className="glass-panel p-4 rounded-2xl mb-8 max-w-5xl mx-auto border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white dark:text-white light:text-slate-900 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-blue-400" />
              Time Control Categories
            </div>
            <span className="text-xs font-mono text-blue-300 light:text-blue-700 font-semibold">
              Active: {isCustomMode ? `Custom (${customMinutes}m + ${customIncrement}s)` : selectedPreset.name}
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {TIME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyTimePreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                  selectedPreset.id === preset.id && !isCustomMode
                    ? 'bg-blue-600 text-white font-bold border-blue-400 shadow-glow-blue'
                    : 'bg-slate-900/80 light:bg-slate-100 text-slate-300 light:text-slate-800 border-slate-800 light:border-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] text-slate-400 light:text-slate-500 mr-1">[{preset.category}]</span>
                {preset.name}
              </button>
            ))}

            <button
              onClick={() => {
                setIsCustomMode(true);
                applyCustomTime(customMinutes, customIncrement);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                isCustomMode
                  ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-glow-accent'
                  : 'bg-slate-900/80 light:bg-slate-100 text-slate-300 light:text-slate-800 border-slate-800 light:border-slate-300 hover:border-slate-700'
              }`}
            >
              ⚙️ Custom Time Input
            </button>
          </div>
        </div>

        {/* Live Engine Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive High Contrast Chessboard */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* Board Action Bar & Dedicated Board Theme Toggle */}
            <div className="w-full glass-panel p-3 rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center gap-2">
                <button
                  onClick={resetBoard}
                  className="p-2 rounded-xl bg-slate-800 light:bg-slate-200 hover:bg-slate-700 light:hover:bg-slate-300 text-slate-300 light:text-slate-800 transition-all text-xs font-mono flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                
                <button
                  onClick={undoMove}
                  className="p-2 rounded-xl bg-slate-800 light:bg-slate-200 hover:bg-slate-700 light:hover:bg-slate-300 text-slate-300 light:text-slate-800 transition-all text-xs font-mono flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Undo</span>
                </button>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="p-2 rounded-xl bg-slate-800 light:bg-slate-200 hover:bg-slate-700 light:hover:bg-slate-300 text-slate-300 light:text-slate-800 transition-all text-xs font-mono"
                >
                  Flip 🔄
                </button>

                {/* Resign Button */}
                <button
                  onClick={handleResign}
                  disabled={isGameOver}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 light:bg-slate-200 hover:bg-rose-600 hover:text-white text-rose-400 light:text-rose-700 transition-all text-xs font-mono disabled:opacity-40"
                  title="Resign Game"
                >
                  🏳️ Resign
                </button>

                {/* Draw Offer Button */}
                <button
                  onClick={handleOfferDraw}
                  disabled={isGameOver}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 light:bg-slate-200 hover:bg-amber-600 hover:text-white text-amber-300 light:text-amber-700 transition-all text-xs font-mono disabled:opacity-40"
                  title="Offer Draw"
                >
                  🤝 Draw
                </button>

                {/* Dedicated Board Theme Selector Button */}
                <button
                  onClick={() => setShowThemePanel(!showThemePanel)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 light:bg-slate-200 hover:bg-slate-700 light:hover:bg-slate-300 text-cyan-300 light:text-cyan-800 transition-all text-xs font-mono flex items-center gap-1.5 border border-cyan-500/30"
                >
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Board Theme</span>
                </button>

                {/* Chess.com Style Game Review Button */}
                {historySteps.length > 0 && (
                  <button
                    onClick={startReviewMode}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all ${
                      isReviewMode 
                        ? 'bg-emerald-600 text-white font-bold shadow-glow-cyan' 
                        : 'bg-indigo-600/90 text-white hover:bg-indigo-500'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Game Review 🔍</span>
                  </button>
                )}
              </div>

              {/* Side Choice */}
              <div className="flex items-center gap-1 bg-slate-900/90 light:bg-slate-100 p-1 rounded-xl border border-slate-800 light:border-slate-300">
                <button
                  onClick={() => { setPlayerSide('w'); setIsFlipped(false); }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    playerSide === 'w' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 light:text-slate-600 hover:text-slate-200'
                  }`}
                >
                  ♔ White
                </button>
                <button
                  onClick={() => { setPlayerSide('b'); setIsFlipped(true); }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    playerSide === 'b' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 light:text-slate-600 hover:text-slate-200'
                  }`}
                >
                  ♚ Black
                </button>
              </div>

              {/* Auto Demo toggle */}
              <button
                onClick={() => setAutoDemo(!autoDemo)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all ${
                  autoDemo 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 light:bg-slate-200 text-slate-400 light:text-slate-800 hover:text-white'
                }`}
              >
                {autoDemo ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>Auto Demo</span>
              </button>

            </div>

            {/* Draw Offer Declined Toast */}
            {drawToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full mb-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono text-center font-bold"
              >
                🤝 {drawToast}
              </motion.div>
            )}

            {/* Dedicated Board Theme Selector Dropdown */}
            {showThemePanel && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full glass-panel p-3 rounded-2xl mb-4 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-2"
              >
                <span className="text-xs font-mono font-bold text-cyan-400 light:text-cyan-800">SELECT BOARD THEME:</span>
                <div className="flex flex-wrap gap-2">
                  {BOARD_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedBoardTheme(theme)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border flex items-center gap-2 ${
                        selectedBoardTheme.id === theme.id
                          ? 'bg-blue-600 text-white font-bold border-blue-400 shadow-glow-blue'
                          : 'bg-slate-900 light:bg-slate-100 text-slate-300 light:text-slate-800 border-slate-800 light:border-slate-300'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${theme.darkSquare}`} />
                      {theme.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Black / Top Player Clock Bar */}
            <div className="w-full max-w-[480px] mb-2 flex items-center justify-between p-2.5 rounded-xl bg-slate-900 light:bg-slate-100 border border-slate-800 light:border-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white dark:text-white light:text-slate-900 font-sans">♚ KnightShift (Black)</span>
                {reviewReport && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    {reviewReport.blackAccuracy}% Accuracy
                  </span>
                )}
                {isEngineThinking && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">
                    Thinking...
                  </span>
                )}
              </div>
              <div className={`px-4 py-1 rounded-lg font-mono font-bold text-base transition-all ${
                gameRef.current.turn() === 'b' && !gameRef.current.isGameOver()
                  ? 'bg-amber-500/20 text-amber-300 light:text-amber-800 border border-amber-500/40 shadow-glow-accent'
                  : 'bg-slate-950 light:bg-slate-200 text-slate-300 light:text-slate-900 border border-slate-800 light:border-slate-300'
              }`}>
                {formatTime(blackTime)}
              </div>
            </div>

            {/* Chessboard Container */}
            <div className="relative flex gap-4 items-center justify-center w-full">
              
              {/* Calibrated Evaluation Bar */}
              <div className="w-6 h-[340px] sm:h-[480px] bg-slate-950 rounded-lg overflow-hidden flex flex-col border-2 border-slate-700 relative shadow-2xl">
                
                {/* Subtle 50% Equal Position Midline Marker */}
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-400/50 z-30 pointer-events-none shadow-sm" />

                {/* Top Section (Black Advantage Bar) */}
                <div 
                  className="w-full bg-[#0f172a] transition-all duration-500 ease-out flex items-start justify-center pt-1"
                  style={{ height: `${100 - whiteBarPct}%` }}
                >
                  {currentEval < 0 && (
                    <span className="text-[10px] font-mono font-extrabold text-white bg-slate-900/90 px-1 py-0.5 rounded shadow border border-slate-700 z-40">
                      {isCheckmate ? 'M1' : currentEval.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Bottom Section (White Advantage Bar) */}
                <div 
                  className="w-full bg-slate-100 transition-all duration-500 ease-out flex items-end justify-center pb-1"
                  style={{ height: `${whiteBarPct}%` }}
                >
                  {currentEval >= 0 && (
                    <span className="text-[10px] font-mono font-extrabold text-slate-950 bg-white/90 px-1 py-0.5 rounded shadow border border-slate-300 z-40">
                      {isCheckmate ? 'M1' : `+${currentEval.toFixed(1)}`}
                    </span>
                  )}
                </div>

              </div>

              {/* Board Canvas Grid */}
              <div className={`relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] rounded-2xl overflow-hidden border-4 ${selectedBoardTheme.border} shadow-2xl grid grid-cols-8 grid-rows-8`}>
                
                {/* SVG Overlay for Best Move Arrows & Review Mode Visual Annotations */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
                  <defs>
                    <marker id="arrowhead-green" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <polygon points="0 0, 8 4, 0 8" fill="#22c55e" />
                    </marker>
                  </defs>

                  {/* Draw Green Best Move Arrow in Game Review Mode */}
                  {isReviewMode && activeMoveAnalysis && activeMoveAnalysis.bestMove && (
                    (() => {
                      const p1 = getSquareCoords(activeMoveAnalysis.bestMove.from);
                      const p2 = getSquareCoords(activeMoveAnalysis.bestMove.to);
                      return (
                        <line
                          x1={`${p1.x}%`}
                          y1={`${p1.y}%`}
                          x2={`${p2.x}%`}
                          y2={`${p2.y}%`}
                          stroke="#22c55e"
                          strokeWidth="6"
                          strokeDasharray="8 4"
                          opacity="0.85"
                          markerEnd="url(#arrowhead-green)"
                        />
                      );
                    })()
                  )}
                </svg>

                {boardRanks.map((r) =>
                  boardFiles.map((c) => {
                    const squareName = `${filesLetters[c]}${8 - r}` as Square;
                    const isDark = (r + c) % 2 === 0;
                    const piece = currentBoard[r][c];
                    const pieceKey = piece ? `${piece.color}${piece.type.toUpperCase()}` : null;
                    const isSelected = selectedSquare === squareName;
                    const isLegal = legalMoves.includes(squareName);
                    const isLastMove = lastMove && (lastMove.from === squareName || lastMove.to === squareName);

                    // Move Classification Badge on Played Target Square
                    const hasBadge = activeMoveAnalysis && activeMoveAnalysis.playedMove.to === squareName;

                    return (
                      <div
                        key={squareName}
                        onClick={() => handleSquareClick(squareName)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(squareName)}
                        className={`relative flex items-center justify-center cursor-pointer select-none transition-colors duration-150 ${
                          isDark ? selectedBoardTheme.darkSquare : selectedBoardTheme.lightSquare
                        } ${isSelected ? 'ring-4 ring-blue-400 z-20 bg-blue-500/40' : ''} ${
                          isLastMove ? selectedBoardTheme.lastMoveHighlight : ''
                        }`}
                      >
                        {isLegal && (
                          <div className={`absolute z-30 rounded-full pointer-events-none ${
                            piece ? 'w-full h-full border-4 border-emerald-400 bg-emerald-400/30' : 'w-4 h-4 bg-emerald-400 shadow-glow-cyan animate-pulse'
                          }`} />
                        )}

                        {/* Move Classification Badge overlay */}
                        {hasBadge && (
                          <span className={`absolute top-1 right-1 z-40 px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none ${getBadgeStyle(activeMoveAnalysis.classification)}`}>
                            {activeMoveAnalysis.symbol}
                          </span>
                        )}

                        {pieceKey && (
                          <motion.div
                            key={`${squareName}-${pieceKey}`}
                            draggable
                            onDragStart={() => handleDragStart(squareName)}
                            className="z-10 cursor-grab active:cursor-grabbing flex items-center justify-center"
                          >
                            {renderSolidPiece(pieceKey)}
                          </motion.div>
                        )}

                        {c === 0 && (
                          <span className="absolute top-0.5 left-1 text-[10px] font-mono font-bold text-slate-300 select-none drop-shadow">
                            {8 - r}
                          </span>
                        )}
                        {r === 7 && (
                          <span className="absolute bottom-0.5 right-1 text-[10px] font-mono font-bold text-slate-300 select-none drop-shadow">
                            {filesLetters[c]}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Non-blocking Engine Status Badge */}
                {isEngineThinking && (
                  <div className="absolute top-3 right-3 z-40 bg-slate-950/90 border border-blue-500/60 px-3 py-1.5 rounded-xl shadow-glow-blue flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                    <span className="text-[10px] font-mono font-bold text-blue-300 tracking-wider">
                      C++ THINKING
                    </span>
                  </div>
                )}

                {/* ==========================================================================
                   CHESS.COM STYLE FLOATING OVERLAY MODAL ON CHESSBOARD GRID
                   ========================================================================== */}
                <AnimatePresence>
                  {isGameOver && !dismissedModal && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
                    >
                      {/* Close Button to view board */}
                      <button
                        onClick={() => setDismissedModal(true)}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                        title="Review Board"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Floating Chess.com Trophy Card */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-glow-accent mb-3 animate-bounce">
                        <span className="text-3xl">🏆</span>
                      </div>

                      <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1 font-sans">
                        {resignationWinner ? 'RESIGNATION' : isCheckmate ? 'CHECKMATE' : timeOutWinner ? 'TIME OUT' : 'STALEMATE'}
                      </h3>

                      <p className="text-sm font-bold text-slate-300 mb-6 max-w-xs font-mono">
                        {resignationWinner ? (
                          resignationWinner
                        ) : isCheckmate ? (
                          displayGame.turn() === 'w' 
                            ? 'KnightShift (Black) won by checkmate' 
                            : 'You (White) won by checkmate!'
                        ) : timeOutWinner ? (
                          timeOutWinner
                        ) : (
                          'Game drawn by stalemate'
                        )}
                      </p>

                      <div className="flex flex-col gap-2.5 w-full max-w-xs">
                        <button
                          onClick={startReviewMode}
                          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition-all shadow-glow-cyan flex items-center justify-center gap-2"
                        >
                          <Search className="w-4 h-4" />
                          Game Review 🔍
                        </button>

                        <button
                          onClick={resetBoard}
                          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-glow-blue flex items-center justify-center gap-2"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Play Again
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </div>

            {/* White / Bottom Player Clock Bar */}
            <div className="w-full max-w-[480px] mt-2 flex items-center justify-between p-2.5 rounded-xl bg-slate-900 light:bg-slate-100 border border-slate-800 light:border-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white dark:text-white light:text-slate-900 font-sans">♔ Player (White)</span>
                {reviewReport && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                    {reviewReport.whiteAccuracy}% Accuracy
                  </span>
                )}
              </div>
              <div className={`px-4 py-1 rounded-lg font-mono font-bold text-base transition-all ${
                gameRef.current.turn() === 'w' && !gameRef.current.isGameOver()
                  ? 'bg-blue-600 text-white shadow-glow-blue'
                  : 'bg-slate-950 light:bg-slate-200 text-slate-300 light:text-slate-900 border border-slate-800 light:border-slate-300'
              }`}>
                {formatTime(whiteTime)}
              </div>
            </div>

            {/* Captured Pieces Bar */}
            <div className="w-full max-w-[480px] glass-panel p-2.5 rounded-xl mt-3 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1">
                <span>Taken:</span>
                <span className="text-lg text-slate-200 light:text-slate-800">
                  {capturedBlack.map((p) => UNICODE_CAPTURES[p] || p).join('')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg text-slate-400 light:text-slate-600">
                  {capturedWhite.map((p) => UNICODE_CAPTURES[p.toUpperCase()] || p).join('')}
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Official PGN Game History & Game Review HUD */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Chess.com Style Game Review Accuracy & Classification Panel */}
            {reviewReport && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-5 rounded-2xl border border-emerald-500/40 shadow-glow-cyan"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-white dark:text-white light:text-slate-900 font-sans uppercase">GAME REVIEW ACCURACY</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                    REPORT READY
                  </span>
                </div>

                {/* Accuracy Scores Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3.5 rounded-xl bg-slate-900/90 light:bg-slate-100 border border-slate-800 light:border-slate-300 text-center">
                    <div className="text-[10px] font-mono text-slate-400 mb-1">YOU (WHITE)</div>
                    <div className="text-2xl font-black font-mono text-blue-400">
                      {reviewReport.whiteAccuracy}%
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 light:bg-slate-100 border border-slate-800 light:border-slate-300 text-center">
                    <div className="text-[10px] font-mono text-slate-400 mb-1">KNIGHTSHIFT (BLACK)</div>
                    <div className="text-2xl font-black font-mono text-emerald-400">
                      {reviewReport.blackAccuracy}%
                    </div>
                  </div>
                </div>

                {/* Move Classification Summary Pills */}
                <div className="grid grid-cols-4 gap-2 font-mono text-center text-xs">
                  <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                    <div className="text-[10px]">Brilliant !!</div>
                    <div className="font-bold">{reviewReport.whiteCounts.brilliant + reviewReport.blackCounts.brilliant}</div>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                    <div className="text-[10px]">Best ✓</div>
                    <div className="font-bold">{reviewReport.whiteCounts.best + reviewReport.blackCounts.best}</div>
                  </div>

                  <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
                    <div className="text-[10px]">Inaccuracy ?!</div>
                    <div className="font-bold">{reviewReport.whiteCounts.inaccuracy + reviewReport.blackCounts.inaccuracy}</div>
                  </div>

                  <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300">
                    <div className="text-[10px]">Blunder ??</div>
                    <div className="font-bold">{reviewReport.whiteCounts.blunder + reviewReport.blackCounts.blunder}</div>
                  </div>
                </div>

                {/* Active Review Move Commentary Box */}
                {activeMoveAnalysis && (
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-400 font-bold">MOVE {activeMoveAnalysis.ply} REVIEW:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${getBadgeStyle(activeMoveAnalysis.classification)}`}>
                        {activeMoveAnalysis.classification.toUpperCase()} {activeMoveAnalysis.symbol}
                      </span>
                    </div>
                    <p className="text-slate-200 font-sans">
                      {activeMoveAnalysis.commentary}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* PGN Move History Box */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-white dark:text-white light:text-slate-900 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-blue-400" />
                  PGN Move History ({historySteps.length} moves)
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 light:text-slate-600">
                    Ply {viewingPly} / {historySteps.length}
                  </span>
                  <button
                    onClick={copyPgnToClipboard}
                    className="p-1.5 rounded bg-slate-800 light:bg-slate-200 hover:bg-slate-700 light:hover:bg-slate-300 text-slate-300 light:text-slate-800 transition-all text-xs flex items-center gap-1"
                    title="Copy Official PGN Text"
                  >
                    {copiedPgn ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-mono">Copy PGN</span>
                  </button>
                </div>
              </div>

              {/* Interactive Move Pair Grid */}
              <div className="h-44 bg-slate-950/90 light:bg-slate-100 rounded-xl p-3 border border-slate-800/80 light:border-slate-300 overflow-y-auto font-mono text-xs space-y-1">
                {pgnPairs.length === 0 ? (
                  <div className="text-slate-500 text-center py-12 text-xs italic font-sans">
                    No moves played yet. Start by moving a piece!
                  </div>
                ) : (
                  pgnPairs.map((pair) => (
                    <div key={pair.moveNum} className="grid grid-cols-12 items-center py-1 px-2 rounded hover:bg-slate-900/60 light:hover:bg-slate-200">
                      <span className="col-span-2 text-slate-500 font-bold">{pair.moveNum}.</span>
                      
                      {pair.whiteStep && (
                        <button
                          onClick={() => navigateToPly(pair.whiteStep!.ply)}
                          className={`col-span-5 text-left px-2 py-1 rounded transition-all font-semibold flex items-center justify-between ${
                            viewingPly === pair.whiteStep.ply
                              ? 'bg-blue-600 text-white font-bold shadow-md'
                              : 'text-slate-200 light:text-slate-800 hover:bg-slate-800 light:hover:bg-slate-300'
                          }`}
                        >
                          <span>{pair.whiteStep.san}</span>
                          {reviewReport && reviewReport.analyses[pair.whiteStep.ply - 1] && (
                            <span className="text-[9px] opacity-90">
                              {reviewReport.analyses[pair.whiteStep.ply - 1].symbol}
                            </span>
                          )}
                        </button>
                      )}

                      {pair.blackStep && (
                        <button
                          onClick={() => navigateToPly(pair.blackStep!.ply)}
                          className={`col-span-5 text-left px-2 py-1 rounded transition-all font-semibold flex items-center justify-between ${
                            viewingPly === pair.blackStep.ply
                              ? 'bg-blue-600 text-white font-bold shadow-md'
                              : 'text-slate-300 light:text-slate-700 hover:bg-slate-800 light:hover:bg-slate-300'
                          }`}
                        >
                          <span>{pair.blackStep.san}</span>
                          {reviewReport && reviewReport.analyses[pair.blackStep.ply - 1] && (
                            <span className="text-[9px] opacity-90">
                              {reviewReport.analyses[pair.blackStep.ply - 1].symbol}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Official Standard PGN Text Box */}
              {officialPgn && (
                <div className="mt-3 p-3 rounded-xl bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-300 font-mono text-xs text-blue-300 light:text-blue-800 max-h-20 overflow-y-auto break-words select-all">
                  <span className="text-[10px] text-slate-400 light:text-slate-600 block mb-1 font-bold">STANDARD PGN FORMAT:</span>
                  {officialPgn}
                </div>
              )}

              {/* Navigation Controls Bar */}
              <div className="flex items-center justify-between gap-2 mt-3">
                <button
                  onClick={() => navigateToPly(0)}
                  disabled={viewingPly === 0}
                  className="flex-1 py-2 rounded-xl bg-slate-900 light:bg-slate-200 hover:bg-slate-800 light:hover:bg-slate-300 disabled:opacity-30 text-slate-300 light:text-slate-800 text-xs font-mono flex items-center justify-center transition-all border border-slate-800 light:border-slate-300"
                  title="First Position (Up Arrow)"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigateToPly(viewingPly - 1)}
                  disabled={viewingPly === 0}
                  className="flex-1 py-2 rounded-xl bg-slate-900 light:bg-slate-200 hover:bg-slate-800 light:hover:bg-slate-300 disabled:opacity-30 text-slate-300 light:text-slate-800 text-xs font-mono flex items-center justify-center transition-all border border-slate-800 light:border-slate-300"
                  title="Previous Move (Left Arrow)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigateToPly(viewingPly + 1)}
                  disabled={viewingPly === historySteps.length}
                  className="flex-1 py-2 rounded-xl bg-slate-900 light:bg-slate-200 hover:bg-slate-800 light:hover:bg-slate-300 disabled:opacity-30 text-slate-300 light:text-slate-800 text-xs font-mono flex items-center justify-center transition-all border border-slate-800 light:border-slate-300"
                  title="Next Move (Right Arrow)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigateToPly(historySteps.length)}
                  disabled={viewingPly === historySteps.length}
                  className="flex-1 py-2 rounded-xl bg-slate-900 light:bg-slate-200 hover:bg-slate-800 light:hover:bg-slate-300 disabled:opacity-30 text-slate-300 light:text-slate-800 text-xs font-mono flex items-center justify-center transition-all border border-slate-800 light:border-slate-300"
                  title="Current Live Move (Down Arrow)"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Depth Selector */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white dark:text-white light:text-slate-900 font-sans">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Engine Depth Target
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 light:text-blue-800 border border-blue-500/30">
                  Depth {engineDepth}
                </span>
              </div>
              
              <input
                type="range"
                min="1"
                max="12"
                value={engineDepth}
                onChange={(e) => setEngineDepth(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 light:bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              
              <div className="flex justify-between text-[10px] font-mono text-slate-500 light:text-slate-600 mt-2">
                <span>D1 (Instant)</span>
                <span>D5 (Standard)</span>
                <span>D12 (Deep C++)</span>
              </div>
            </div>

            {/* Live Search Stats Card */}
            <div className="glass-panel-glow p-6 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-bold text-slate-200 light:text-slate-800 tracking-wider">LIVE C++ TELEMETRY</span>
                </div>
                <span className="text-xs font-mono text-slate-400 light:text-slate-600">
                  {stats.timeMs} ms search
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3.5 rounded-xl bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300">
                  <div className="text-[10px] font-mono text-slate-400 light:text-slate-600 mb-0.5">NODES SEARCHED</div>
                  <div className="text-xl font-bold font-mono text-white dark:text-white light:text-slate-900">
                    {stats.nodes.toLocaleString()}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300">
                  <div className="text-[10px] font-mono text-slate-400 light:text-slate-600 mb-0.5">SPEED (NPS)</div>
                  <div className="text-xl font-bold font-mono text-cyan-400 light:text-cyan-800">
                    {stats.nps >= 1000000 ? `${(stats.nps / 1000000).toFixed(2)} M/s` : `${Math.round(stats.nps / 1000)} K/s`}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300">
                  <div className="text-[10px] font-mono text-slate-400 light:text-slate-600 mb-0.5">SEARCH EVAL</div>
                  <div className="text-xl font-bold font-mono text-blue-400 light:text-blue-800">
                    {isCheckmate ? 'M1' : (currentEval > 0 ? `+${currentEval.toFixed(2)}` : currentEval.toFixed(2))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300">
                  <div className="text-[10px] font-mono text-slate-400 light:text-slate-600 mb-0.5">TT HIT RATE</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 light:text-emerald-800">
                    {stats.ttHitRatePct}%
                  </div>
                </div>
              </div>

              {/* Principal Variation (PV) Line */}
              <div className="p-4 rounded-xl bg-slate-950/90 light:bg-slate-100 border border-slate-800 light:border-slate-300">
                <div className="text-[11px] font-mono text-slate-400 light:text-slate-600 mb-2 flex items-center justify-between">
                  <span>PRINCIPAL VARIATION (BEST LINE)</span>
                  <span className="text-[9px] text-blue-400 light:text-blue-800">KnightShift.exe STDOUT</span>
                </div>
                <div className="font-mono text-xs text-blue-300 light:text-blue-800 bg-slate-900/60 light:bg-slate-200 p-2.5 rounded-lg border border-slate-800/80 light:border-slate-300 overflow-x-auto whitespace-nowrap">
                  {stats.pv.length > 0 ? stats.pv.join('  ⟶  ') : 'e2e4  ⟶  e7e5  ⟶  g1f3'}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
