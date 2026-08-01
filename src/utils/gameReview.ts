import { Chess, Move, Square } from 'chess.js';
import { GameReviewReport, MoveAnalysis, MoveClassificationType } from '../types/chess';
import { evaluateBoard } from './chessEngine';

// Check if a piece move is a genuine sacrifice (piece moved into enemy attack without sufficient defense)
function isGenuineSacrifice(gameBefore: Chess, move: Move, isWhite: boolean): boolean {
  if (move.piece === 'p' || move.piece === 'k') return false; // Pawns and Kings are not piece sacrifices

  const targetSq = move.to;
  const enemyColor = isWhite ? 'b' : 'w';

  // Make move to test target square safety
  gameBefore.move(move);

  // Check if target square is attacked by enemy
  const isAttackedByEnemy = gameBefore.isAttacked(targetSq, enemyColor);
  gameBefore.undo();

  if (!isAttackedByEnemy) return false;

  // It's attacked by enemy and not a simple trade -> Genuine sacrifice
  return true;
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

    // Find absolute top move in the position for comparison
    const legalMoves = gameBefore.moves({ verbose: true });
    let topScore = isWhite ? -Infinity : Infinity;
    let bestMoveObj = legalMoves[0] || null;

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

    // Centipawn loss = difference between played move score and position's best move score
    let cpl = 0;
    if (isWhite) {
      cpl = Math.max(0, topScore - evalAfterCp);
    } else {
      cpl = Math.max(0, evalAfterCp - topScore);
    }

    // Realistic Move Accuracy % (100 * e^(-0.006 * cpl))
    const moveAccuracy = Math.min(100, Math.max(0, 100 * Math.exp(-0.006 * cpl)));

    if (isWhite) {
      totalWhiteAccuracy += moveAccuracy;
      whiteMoveCount++;
    } else {
      totalBlackAccuracy += moveAccuracy;
      blackMoveCount++;
    }

    const evalDelta = cpl / 100.0;

    // Strict Classification Logic
    let classification: MoveClassificationType = 'best';
    let symbol = '✓';
    let commentary = `Best move.`;

    // 1. Opening Book (First 4 plies)
    if (index < 4) {
      classification = 'book';
      symbol = '📖';
      commentary = `Standard opening move.`;
    }
    // 2. Blunder (Eval drop >= 2.0 pawns / 200 centipawns)
    else if (cpl >= 200) {
      classification = 'blunder';
      symbol = '??';
      commentary = `Blunder! ${bestMoveObj ? `${bestMoveObj.san} was best.` : ''}`;
    }
    // 3. Mistake (Eval drop 80 - 200 centipawns)
    else if (cpl >= 80) {
      classification = 'mistake';
      symbol = '?';
      commentary = `Mistake. ${bestMoveObj ? `${bestMoveObj.san} was much better.` : ''}`;
    }
    // 4. Inaccuracy (Eval drop 30 - 80 centipawns)
    else if (cpl >= 30) {
      classification = 'inaccuracy';
      symbol = '?!';
      commentary = `Inaccuracy. ${bestMoveObj ? `${bestMoveObj.san} was slightly better.` : ''}`;
    }
    // 5. Genuine Piece Sacrifice (Brilliant !!)
    else if (
      cpl <= 15 &&
      isGenuineSacrifice(new Chess(fenBefore), step.move, isWhite) &&
      (isWhite ? evalAfterCp >= 100 : evalAfterCp <= -100)
    ) {
      classification = 'brilliant';
      symbol = '!!';
      commentary = `Brilliant piece sacrifice!`;
    }
    // 6. Great Move (!)
    else if (cpl <= 10 && (step.move.san.includes('+') || step.move.san.includes('#'))) {
      classification = 'great';
      symbol = '!';
      commentary = `Great check/pressuring move!`;
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
