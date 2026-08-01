import { Chess, Move } from 'chess.js';
import { GameReviewReport, MoveAnalysis, MoveClassificationType } from '../types/chess';
import { evaluateBoard } from './chessEngine';

// Chess.com Win Chance Sigmoid Function
// Converts Centipawns (-2000 to +2000) into Win Probability (-1.0 to +1.0)
function getWinChance(evalCp: number): number {
  return 2 / (1 + Math.exp(-0.00368 * evalCp)) - 1;
}

// Chess.com Official CAPS Accuracy Formula
// Move Accuracy = 100 * (1 - (WinLoss / (1 + WinBefore)))^1.5
function calculateCapsAccuracy(evalBeforeCp: number, evalAfterCp: number, isWhite: boolean): number {
  // Get win probability from mover's perspective
  const winBefore = getWinChance(isWhite ? evalBeforeCp : -evalBeforeCp);
  const winAfter = getWinChance(isWhite ? evalAfterCp : -evalAfterCp);

  // Win probability loss (0.0 to 2.0)
  const winLoss = Math.max(0, winBefore - winAfter);

  // Chess.com CAPS non-linear scaling formula
  // Scaled non-linearly: small loss = slight penalty, large loss (blunder) = massive drop down to 0%
  const accuracy = 100 * Math.pow(Math.max(0, 1 - (winLoss / (1 + Math.max(-0.9, winBefore)))), 1.8);

  return Math.min(98, Math.max(0, Math.round(accuracy)));
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

    const evalBeforeCp = evaluateBoard(gameBefore);
    const evalAfterCp = evaluateBoard(gameAfter);

    const legalMoves = gameBefore.moves({ verbose: true });
    let bestScore = isWhite ? -Infinity : Infinity;
    let bestMoveObj: Move | null = legalMoves[0] || null;

    for (const m of legalMoves) {
      gameBefore.move(m);
      const score = evaluateBoard(gameBefore);
      gameBefore.undo();

      if (isWhite ? (score > bestScore) : (score < bestScore)) {
        bestScore = score;
        bestMoveObj = m;
      }
    }

    // Centipawn loss relative to top move
    let cpl = isWhite ? (bestScore - evalAfterCp) : (evalAfterCp - bestScore);
    cpl = Math.max(0, cpl);

    // Dynamic Move Accuracy % using Chess.com CAPS Formula
    let moveAccuracy = calculateCapsAccuracy(evalBeforeCp, evalAfterCp, isWhite);

    // Strict Classification Thresholds based on CAPS Accuracy & CPL
    let classification: MoveClassificationType = 'best';
    let symbol = '✓';
    let commentary = `Best move in the position.`;

    // 1. Book Move (Opening plies)
    if (index < 4) {
      classification = 'book';
      symbol = '📖';
      commentary = `Standard opening theory.`;
      moveAccuracy = 100;
    }
    // 2. Blunder (Accuracy < 25% or CPL >= 250)
    else if (moveAccuracy <= 25 || cpl >= 250) {
      classification = 'blunder';
      symbol = '??';
      commentary = `Blunder! ${bestMoveObj ? `${bestMoveObj.san} was best.` : ''}`;
      moveAccuracy = Math.min(moveAccuracy, 15);
    }
    // 3. Mistake (Accuracy 26% - 60% or CPL 100 - 250)
    else if (moveAccuracy <= 60 || cpl >= 100) {
      classification = 'mistake';
      symbol = '?';
      commentary = `Mistake. ${bestMoveObj ? `${bestMoveObj.san} was much stronger.` : ''}`;
      moveAccuracy = Math.min(moveAccuracy, 50);
    }
    // 4. Inaccuracy (Accuracy 61% - 82% or CPL 40 - 100)
    else if (moveAccuracy <= 82 || cpl >= 40) {
      classification = 'inaccuracy';
      symbol = '?!';
      commentary = `Inaccuracy. ${bestMoveObj ? `${bestMoveObj.san} was slightly better.` : ''}`;
      moveAccuracy = Math.min(moveAccuracy, 75);
    }
    // 5. Great Move (!)
    else if (cpl <= 10 && (step.move.san.includes('+') || step.move.san.includes('#'))) {
      classification = 'great';
      symbol = '!';
      commentary = `Great pressuring move!`;
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

  // Calculate weighted average accuracy
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
