import { Chess, Move, Square } from 'chess.js';
import { GameReviewReport, MoveAnalysis, MoveClassificationType } from '../types/chess';
import { evaluateBoard } from './chessEngine';

// Chess.com Win Chance Formula (Sigmoidal conversion from centipawns)
function getWinChance(evalCp: number): number {
  return 2 / (1 + Math.exp(-0.00368 * evalCp)) - 1;
}

// Chess.com CAPS Move Accuracy Formula
function calculateMoveAccuracy(evalBeforeCp: number, evalAfterCp: number, isWhite: boolean): number {
  const winBefore = getWinChance(isWhite ? evalBeforeCp : -evalBeforeCp);
  const winAfter = getWinChance(isWhite ? evalAfterCp : -evalAfterCp);
  const winLoss = Math.max(0, winBefore - winAfter);
  
  // CAPS formula: 103.1668 * e^(-0.04354 * winLoss * 100) - 3.1668
  const winLossPct = winLoss * 100;
  const rawAcc = 103.1668 * Math.exp(-0.04354 * winLossPct) - 3.1668;
  return Math.min(100, Math.max(0, rawAcc));
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

    const evalBefore = evalBeforeCp / 100.0;
    const evalAfter = evalAfterCp / 100.0;

    // Centipawn loss from mover's perspective
    let cpl = 0;
    if (isWhite) {
      cpl = Math.max(0, evalBeforeCp - evalAfterCp);
    } else {
      cpl = Math.max(0, evalAfterCp - evalBeforeCp);
    }
    const evalDelta = cpl / 100.0;

    // Calculate move accuracy using CAPS formula
    const moveAccuracy = calculateMoveAccuracy(evalBeforeCp, evalAfterCp, isWhite);
    if (isWhite) {
      totalWhiteAccuracy += moveAccuracy;
      whiteMoveCount++;
    } else {
      totalBlackAccuracy += moveAccuracy;
      blackMoveCount++;
    }

    // Determine Best Move Arrow
    const legalMoves = gameBefore.moves({ verbose: true });
    let bestMoveObj = legalMoves[0] || null;
    let topScore = isWhite ? -Infinity : Infinity;

    for (const m of legalMoves) {
      gameBefore.move(m);
      const score = evaluateBoard(gameBefore);
      gameBefore.undo();

      if (isWhite && score > topScore) {
        topScore = score;
        bestMoveObj = m;
      } else if (!isWhite && score < topScore) {
        topScore = score;
        bestMoveObj = m;
      }
    }

    // Strict Chess.com Classification Rules
    let classification: MoveClassificationType = 'best';
    let symbol = '✓';
    let commentary = `Best move.`;

    // 1. Opening Book (First 4 plies)
    if (index < 4) {
      classification = 'book';
      symbol = '📖';
      commentary = `Standard opening theory.`;
    }
    // 2. Blunder (Eval drop > 1.8 pawns)
    else if (evalDelta > 1.8) {
      classification = 'blunder';
      symbol = '??';
      commentary = `Blunder! ${bestMoveObj ? `${bestMoveObj.san} was best.` : ''}`;
    }
    // 3. Mistake (Eval drop 0.8 - 1.8 pawns)
    else if (evalDelta > 0.8) {
      classification = 'mistake';
      symbol = '?';
      commentary = `Mistake. ${bestMoveObj ? `${bestMoveObj.san} was much stronger.` : ''}`;
    }
    // 4. Inaccuracy (Eval drop 0.3 - 0.8 pawns)
    else if (evalDelta > 0.3) {
      classification = 'inaccuracy';
      symbol = '?!';
      commentary = `Inaccuracy. ${bestMoveObj ? `${bestMoveObj.san} was slightly better.` : ''}`;
    }
    // 5. Check for Genuine Sacrifice (Brilliant !!)
    // Must leave a piece hanging (Queen/Rook/Bishop/Knight) AND maintain winning position (cpl == 0)
    else if (
      cpl <= 10 &&
      step.move.piece !== 'p' &&
      !step.move.captured &&
      (isWhite ? evalAfterCp >= 150 : evalAfterCp <= -150)
    ) {
      classification = 'brilliant';
      symbol = '!!';
      commentary = `Brilliant piece sacrifice!`;
    }
    // 6. Great Move (!)
    else if (cpl <= 5 && (step.move.san.includes('+') || step.move.san.includes('#'))) {
      classification = 'great';
      symbol = '!';
      commentary = `Great move, maintaining strong pressure.`;
    }
    // 7. Best Move (✓)
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
      evalBefore,
      evalAfter,
      evalDelta,
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
