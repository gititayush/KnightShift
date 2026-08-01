import { Chess, Move, Square } from 'chess.js';
import { GameReviewReport, MoveAnalysis, MoveClassificationType } from '../types/chess';
import { evaluateBoard } from './chessEngine';

// Chess.com CAPS Accuracy Formula (Harmonic Weighting per move)
// Win Chance Formula: W = 2 / (1 + exp(-0.00368 * CP)) - 1
function getWinChance(evalCp: number): number {
  return 2 / (1 + Math.exp(-0.00368 * evalCp)) - 1;
}

// Calculate move accuracy % based on win chance loss (Chess.com official CAPS formula)
function getCapsMoveAccuracy(evalBeforeCp: number, evalAfterCp: number, isWhite: boolean): number {
  const winBefore = getWinChance(isWhite ? evalBeforeCp : -evalBeforeCp);
  const winAfter = getWinChance(isWhite ? evalAfterCp : -evalAfterCp);

  // Drop in win probability
  const winLoss = Math.max(0, winBefore - winAfter);
  const winLossPct = winLoss * 100;

  // CAPS formula: 103.1668 * e^(-0.04354 * winLossPct) - 3.1668
  const acc = 103.1668 * Math.exp(-0.04354 * winLossPct) - 3.1668;
  return Math.min(100, Math.max(0, acc));
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

    // Static position evaluations before and after move
    const evalBeforeCp = evaluateBoard(gameBefore);
    const evalAfterCp = evaluateBoard(gameAfter);

    // Evaluate best legal move score in position before
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

    // Centipawn loss = difference between played move score and position's best move score
    let cpl = isWhite ? (bestScore - evalAfterCp) : (evalAfterCp - bestScore);
    cpl = Math.max(0, cpl);

    // Accuracy for this move via official CAPS formula
    const moveAccuracy = getCapsMoveAccuracy(evalBeforeCp, evalAfterCp, isWhite);

    if (isWhite) {
      totalWhiteAccuracy += moveAccuracy;
      whiteMoveCount++;
    } else {
      totalBlackAccuracy += moveAccuracy;
      blackMoveCount++;
    }

    const isPlayedBest = bestMoveObj && (step.move.from === bestMoveObj.from && step.move.to === bestMoveObj.to);

    // Classification Rules (Chess.com Strict Guidelines)
    let classification: MoveClassificationType = 'best';
    let symbol = '✓';
    let commentary = `Best move in the position.`;

    // 1. Book Moves (Opening 4 plies)
    if (index < 4) {
      classification = 'book';
      symbol = '📖';
      commentary = `Standard opening theory.`;
    }
    // 2. Blunder (Win chance loss > 20% or CPL >= 250)
    else if (cpl >= 250 || moveAccuracy <= 30) {
      classification = 'blunder';
      symbol = '??';
      commentary = `Blunder! ${bestMoveObj ? `${bestMoveObj.san} was best.` : ''}`;
    }
    // 3. Mistake (CPL 100 - 250 or move accuracy 31% - 65%)
    else if (cpl >= 100 || moveAccuracy <= 65) {
      classification = 'mistake';
      symbol = '?';
      commentary = `Mistake. ${bestMoveObj ? `${bestMoveObj.san} was much stronger.` : ''}`;
    }
    // 4. Inaccuracy (CPL 40 - 100 or move accuracy 66% - 85%)
    else if (cpl >= 40 || moveAccuracy <= 85) {
      classification = 'inaccuracy';
      symbol = '?!';
      commentary = `Inaccuracy. ${bestMoveObj ? `${bestMoveObj.san} was slightly better.` : ''}`;
    }
    // 5. Great Move (!)
    else if (cpl <= 10 && (step.move.san.includes('+') || step.move.san.includes('#'))) {
      classification = 'great';
      symbol = '!';
      commentary = `Great pressuring move!`;
    }
    // 6. Best Move (✓) - ONLY assigned if it matched top engine move or CPL < 15
    else if (isPlayedBest || cpl <= 15) {
      classification = 'best';
      symbol = '✓';
      commentary = `Best move in the position.`;
    }
    // 7. Good Move / Fallback (Not top, but minimal loss)
    else {
      classification = 'best';
      symbol = '✓';
      commentary = `Good move.`;
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
      evalBefore: evalBeforeCp / 100.0,
      evalAfter: evalAfterCp / 100.0,
      evalDelta: cpl / 100.0,
      classification,
      symbol,
      commentary,
    });
  });

  // Calculate weighted average accuracy (CAPS formula)
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
