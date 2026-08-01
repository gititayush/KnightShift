import { Chess, Move, Square } from 'chess.js';
import { GameReviewReport, MoveAnalysis, MoveClassificationType } from '../types/chess';

const PIECE_VALS: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

// Calculate material balance in centipawns (White - Black)
function getMaterialScore(game: Chess): number {
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

// Detect if a move hung a piece (moved a piece into an enemy attack without equal/greater defender or gave away material)
function evaluateMoveLoss(gameBefore: Chess, move: Move, isWhite: boolean): { cpl: number; isHanging: boolean } {
  const matBefore = getMaterialScore(gameBefore);

  const gameAfter = new Chess(gameBefore.fen());
  gameAfter.move(move);
  const matAfter = getMaterialScore(gameAfter);

  // Immediate material change from mover's perspective
  const matDelta = isWhite ? (matAfter - matBefore) : (matBefore - matAfter);

  // Check if target square is attacked by opponent
  const enemyColor = isWhite ? 'b' : 'w';
  const targetSq = move.to;
  const isAttackedByEnemy = gameAfter.isAttacked(targetSq, enemyColor);

  let cpl = 0;
  let isHanging = false;

  // Checkmate delivered by opponent on next move or checkmate on board
  if (gameAfter.isCheckmate()) {
    return { cpl: 0, isHanging: false }; // Delivered checkmate!
  }

  // If piece moved into enemy attack
  if (isAttackedByEnemy) {
    const movedVal = PIECE_VALS[move.piece] || 100;
    const capturedVal = move.captured ? (PIECE_VALS[move.captured] || 100) : 0;
    
    // Net material at risk
    if (movedVal > capturedVal) {
      isHanging = true;
      cpl += (movedVal - capturedVal);
    }
  }

  // Add material loss if lost piece
  if (matDelta < 0) {
    cpl += Math.abs(matDelta);
  }

  return { cpl, isHanging };
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

  let totalWhiteAccuracy = 0;
  let whiteMoveCount = 0;
  let totalBlackAccuracy = 0;
  let blackMoveCount = 0;

  let currentFen = new Chess().fen();

  historySteps.forEach((step, index) => {
    const fenBefore = currentFen;
    const fenAfter = step.fen;
    currentFen = fenAfter;

    const gameBefore = new Chess(fenBefore);
    const gameAfter = new Chess(fenAfter);
    const isWhite = step.move.color === 'w';

    const { cpl, isHanging } = evaluateMoveLoss(gameBefore, step.move, isWhite);

    // Calculate move accuracy (100 - cpl / 2.5) clamped 0 to 100
    const moveAccuracy = Math.min(100, Math.max(0, Math.round(100 - (cpl / 2.5))));

    if (isWhite) {
      totalWhiteAccuracy += moveAccuracy;
      whiteMoveCount++;
    } else {
      totalBlackAccuracy += moveAccuracy;
      blackMoveCount++;
    }

    const legalMoves = gameBefore.moves({ verbose: true });
    const bestMoveObj = legalMoves[0] || null;

    // Classification Rules
    let classification: MoveClassificationType = 'best';
    let symbol = '✓';
    let commentary = `Best move.`;

    // 1. Book Moves (Opening 4 plies)
    if (index < 4) {
      classification = 'book';
      symbol = '📖';
      commentary = `Standard opening theory.`;
    }
    // 2. Blunder (Hung a piece or lost >= 250 centipawns / 2.5 pawns)
    else if (cpl >= 250 || (isHanging && PIECE_VALS[step.move.piece] >= 300)) {
      classification = 'blunder';
      symbol = '??';
      commentary = `Blunder! Left ${step.move.piece.toUpperCase()} unprotected.`;
    }
    // 3. Mistake (Lost 120 - 250 centipawns)
    else if (cpl >= 120) {
      classification = 'mistake';
      symbol = '?';
      commentary = `Mistake. Lost material or position.`;
    }
    // 4. Inaccuracy (Lost 40 - 120 centipawns)
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

    if (isWhite) whiteCounts[classification]++;
    else blackCounts[classification]++;

    analyses.push({
      ply: step.ply,
      san: step.san,
      color: step.move.color,
      fenBefore,
      fenAfter,
      playedMove: { from: step.move.from, to: step.move.to },
      bestMove: bestMoveObj ? { from: bestMoveObj.from, to: bestMoveObj.to } : null,
      evalBefore: getMaterialScore(gameBefore) / 100.0,
      evalAfter: getMaterialScore(gameAfter) / 100.0,
      evalDelta: cpl / 100.0,
      classification,
      symbol,
      commentary,
    });
  });

  const whiteAccuracy = whiteMoveCount > 0 
    ? Math.round(totalWhiteAccuracy / whiteMoveCount) 
    : 100;
  const blackAccuracy = blackMoveCount > 0 
    ? Math.round(totalBlackAccuracy / blackMoveCount) 
    : 100;

  return {
    whiteAccuracy,
    blackAccuracy,
    whiteCounts,
    blackCounts,
    analyses,
  };
}
