import { Chess, Move, Square } from 'chess.js';
import { GameReviewReport, MoveAnalysis, MoveClassificationType } from '../types/chess';
import { evaluateBoard } from './chessEngine';

const PIECE_VALS: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

// Calculate true position evaluation incorporating immediate tactical threats & hanging pieces
function getTacticalEval(game: Chess, isWhite: boolean): number {
  let baseScore = evaluateBoard(game);

  if (game.isCheckmate()) {
    // If current turn is checkmated, it's -30000 for them
    return game.turn() === 'w' ? -30000 : 30000;
  }

  const board = game.board();
  const sideColor = isWhite ? 'w' : 'b';
  const enemyColor = isWhite ? 'b' : 'w';

  // Deduct for any undefended or underdefended pieces attacked by opponent
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === sideColor) {
        const sq = `${['a','b','c','d','e','f','g','h'][c]}${8 - r}` as Square;
        if (game.isAttacked(sq, enemyColor)) {
          const val = PIECE_VALS[p.type] || 100;
          // Deduct full piece value for undefended hanging piece
          baseScore += isWhite ? -(val * 0.9) : (val * 0.9);
        }
      }
    }
  }

  return baseScore;
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

    const evalBeforeCp = getTacticalEval(gameBefore, isWhite);
    const evalAfterCp = getTacticalEval(gameAfter, isWhite);

    // Centipawn loss from mover's perspective
    let cpl = isWhite ? (evalBeforeCp - evalAfterCp) : (evalAfterCp - evalBeforeCp);
    cpl = Math.max(0, cpl);

    const legalMoves = gameBefore.moves({ verbose: true });
    let bestScore = isWhite ? -Infinity : Infinity;
    let bestMoveObj: Move | null = legalMoves[0] || null;

    for (const m of legalMoves) {
      gameBefore.move(m);
      const score = getTacticalEval(gameBefore, isWhite);
      gameBefore.undo();

      if (isWhite ? (score > bestScore) : (score < bestScore)) {
        bestScore = score;
        bestMoveObj = m;
      }
    }

    // Determine move accuracy % non-linearly
    let moveAccuracy = Math.max(0, 100 - (cpl / 3.0));

    // Classification Rules
    let classification: MoveClassificationType = 'best';
    let symbol = '✓';
    let commentary = `Best move in the position.`;

    // 1. Book Moves (Opening 4 plies)
    if (index < 4 && cpl < 50) {
      classification = 'book';
      symbol = '📖';
      commentary = `Standard opening theory.`;
      moveAccuracy = 100;
    }
    // 2. Blunder (Lost >= 250 centipawns or hung major piece)
    else if (cpl >= 250 || moveAccuracy <= 25) {
      classification = 'blunder';
      symbol = '??';
      commentary = `Blunder! ${bestMoveObj ? `${bestMoveObj.san} was much safer.` : 'Gave away material.'}`;
      moveAccuracy = 0;
    }
    // 3. Mistake (Lost 100 - 250 centipawns)
    else if (cpl >= 100 || moveAccuracy <= 60) {
      classification = 'mistake';
      symbol = '?';
      commentary = `Mistake. ${bestMoveObj ? `${bestMoveObj.san} was stronger.` : 'Position worsened.'}`;
      moveAccuracy = 35;
    }
    // 4. Inaccuracy (Lost 40 - 100 centipawns)
    else if (cpl >= 40 || moveAccuracy <= 82) {
      classification = 'inaccuracy';
      symbol = '?!';
      commentary = `Inaccuracy. ${bestMoveObj ? `${bestMoveObj.san} was slightly better.` : ''}`;
      moveAccuracy = 65;
    }
    // 5. Great Move (!)
    else if (cpl <= 10 && (step.move.san.includes('+') || step.move.san.includes('#'))) {
      classification = 'great';
      symbol = '!';
      commentary = `Great check/pressuring move!`;
      moveAccuracy = 95;
    }
    // 6. Best Move (✓)
    else {
      classification = 'best';
      symbol = '✓';
      commentary = `Best move in the position.`;
      moveAccuracy = 98;
    }

    if (isWhite) {
      totalWhiteAccuracy += moveAccuracy;
      whiteMoveCount++;
      whiteCounts[classification]++;
    } else {
      totalBlackAccuracy += moveAccuracy;
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
      evalBefore: evalBeforeCp / 100.0,
      evalAfter: evalAfterCp / 100.0,
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
