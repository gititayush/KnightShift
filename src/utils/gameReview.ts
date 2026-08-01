import { Chess, Move, Square } from 'chess.js';
import { GameReviewReport, MoveAnalysis, MoveClassificationType } from '../types/chess';
import { evaluateBoard } from './chessEngine';

const PIECE_VALS: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

// Calculate true material balance in centipawns from White's perspective
function getMaterialBalance(game: Chess): number {
  const board = game.board();
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        const val = PIECE_VALS[p.type] || 0;
        score += p.color === 'w' ? val : -val;
      }
    }
  }
  return score;
}

// Evaluate true centipawn loss and tactical hanging piece vulnerability
function evaluateTacticalLoss(gameBefore: Chess, stepMove: Move, isWhite: boolean): { cpl: number; isBlunder: boolean; isHanging: boolean } {
  const gameAfter = new Chess(gameBefore.fen());
  gameAfter.move(stepMove);

  if (gameAfter.isCheckmate()) {
    // Delivered checkmate = perfect move
    return { cpl: 0, isBlunder: false, isHanging: false };
  }

  const matBefore = getMaterialBalance(gameBefore);
  const matAfter = getMaterialBalance(gameAfter);

  // Material change from mover's perspective
  const matDelta = isWhite ? (matBefore - matAfter) : (matAfter - matBefore);

  const enemyColor = isWhite ? 'b' : 'w';
  const targetSq = stepMove.to;
  const isAttacked = gameAfter.isAttacked(targetSq, enemyColor);

  let cpl = Math.max(0, matDelta);
  let isHanging = false;
  let isBlunder = false;

  // Check if piece was hung (moved into enemy attack without equal/greater defender or gave away major piece)
  if (isAttacked) {
    const pieceVal = PIECE_VALS[stepMove.piece] || 100;
    const capturedVal = stepMove.captured ? (PIECE_VALS[stepMove.captured] || 100) : 0;
    if (pieceVal > capturedVal + 50) {
      isHanging = true;
      cpl += (pieceVal - capturedVal);
    }
  }

  if (cpl >= 250 || (isHanging && PIECE_VALS[stepMove.piece] >= 300)) {
    isBlunder = true;
  }

  return { cpl, isBlunder, isHanging };
}

export function analyzeGame(
  historySteps: Array<{ ply: number; san: string; fen: string; move: Move }>
): GameReviewReport {
  const analyses: MoveAnalysis[] = [];

  const whiteCounts: Record<MoveClassificationType, number> = {
    brilliant: 0, great: 0, best: 0, inaccuracy: 0, mistake: 0, blunder: 0, book: 0,
  };
  const blackCounts: Record<MoveClassificationType, number> = {
    brilliant: 0, great: 0, best: 0, inaccuracy: 0, mistake: 0, blunder: 0, book: 0,
  };

  let totalWhiteAccuracyPoints = 0;
  let whiteMoveCount = 0;
  let totalBlackAccuracyPoints = 0;
  let blackMoveCount = 0;

  let currentFen = new Chess().fen();

  historySteps.forEach((step, index) => {
    const fenBefore = currentFen;
    const fenAfter = step.fen;
    currentFen = fenAfter;

    const gameBefore = new Chess(fenBefore);
    const gameAfter = new Chess(fenAfter);
    const isWhite = step.move.color === 'w';

    const { cpl, isBlunder, isHanging } = evaluateTacticalLoss(gameBefore, step.move, isWhite);

    const legalMoves = gameBefore.moves({ verbose: true });
    let bestMoveObj: Move | null = legalMoves[0] || null;

    // Strict Classification Logic
    let classification: MoveClassificationType = 'best';
    let symbol = '✓';
    let commentary = `Best move in the position.`;

    // 1. Opening Book Moves (First 4 plies)
    if (index < 4) {
      classification = 'book';
      symbol = '📖';
      commentary = `Standard opening move.`;
    }
    // 2. Blunder (Lost major piece, hung piece, or CPL >= 250)
    else if (isBlunder || cpl >= 250) {
      classification = 'blunder';
      symbol = '??';
      commentary = `Blunder! Left ${step.move.piece.toUpperCase()} vulnerable.`;
    }
    // 3. Mistake (Lost 100 - 250 centipawns)
    else if (cpl >= 100) {
      classification = 'mistake';
      symbol = '?';
      commentary = `Mistake. Lost material or position.`;
    }
    // 4. Inaccuracy (Lost 40 - 100 centipawns)
    else if (cpl >= 40) {
      classification = 'inaccuracy';
      symbol = '?!';
      commentary = `Inaccuracy. ${bestMoveObj ? `${bestMoveObj.san} was better.` : ''}`;
    }
    // 5. Great Move (!)
    else if (cpl === 0 && (step.move.san.includes('+') || step.move.san.includes('#'))) {
      classification = 'great';
      symbol = '!';
      commentary = `Great check/pressuring move!`;
    }
    // 6. Best Move (✓)
    else {
      classification = 'best';
      symbol = '✓';
      commentary = `Best move in the position.`;
    }

    // Direct Move Accuracy Score per classification (Chess.com accuracy weights)
    let moveAccuracy = 100;
    switch (classification) {
      case 'book': moveAccuracy = 100; break;
      case 'best': moveAccuracy = 100; break;
      case 'great': moveAccuracy = 100; break;
      case 'inaccuracy': moveAccuracy = 65; break;
      case 'mistake': moveAccuracy = 35; break;
      case 'blunder': moveAccuracy = 0; break;
      default: moveAccuracy = 100; break;
    }

    if (isWhite) {
      totalWhiteAccuracyPoints += moveAccuracy;
      whiteMoveCount++;
      whiteCounts[classification]++;
    } else {
      totalBlackAccuracyPoints += moveAccuracy;
      blackMoveCount++;
      blackCounts[classification]++;
    }

    analyses.push({
      ply: step.ply,
      san: step.san,
      color: step.move.color,
      fenBefore,
      fenAfter,
      playedMove: { from: step.move.from, to: step.move.to },
      bestMove: bestMoveObj ? { from: bestMoveObj.from, to: bestMoveObj.to } : null,
      evalBefore: getMaterialBalance(gameBefore) / 100.0,
      evalAfter: getMaterialBalance(gameAfter) / 100.0,
      evalDelta: cpl / 100.0,
      classification,
      symbol,
      commentary,
    });
  });

  // Calculate final weighted Game Accuracy %
  const whiteAccuracy = whiteMoveCount > 0 
    ? Math.round(totalWhiteAccuracyPoints / whiteMoveCount) 
    : 100;
  const blackAccuracy = blackMoveCount > 0 
    ? Math.round(totalBlackAccuracyPoints / blackMoveCount) 
    : 100;

  return {
    whiteAccuracy,
    blackAccuracy,
    whiteCounts,
    blackCounts,
    analyses,
  };
}
