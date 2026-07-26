#include "Search.h"
#include "MoveOrdering.h"
#include <utility>
#include "AttackDetector.h"
#include "Evaluation.h"
#include "MoveGenerator.h"
#include "TranspositionTable.h"

namespace Search
{
Move killerMoves[2][MAX_PLY] = {};
constexpr int INF = 1000000;
constexpr int MATE_SCORE = 30000;

int Quiescence(
    Board& board,
    int alpha,
    int beta)
{
    int standPat = Evaluation::Evaluate(board);

    if (standPat >= beta)
        return beta;

    if (standPat > alpha)
        alpha = standPat;

    MoveList moves;
    MoveGenerator::Generate(board, moves);

for(int i = 0; i < moves.count; i++)
{
    int bestIndex = i;
    int bestMoveScore = -1;

    for(int j = i; j < moves.count; j++)
    {
        int score = MoveOrdering::ScoreMove(board, moves.moves[j],0,0);

        if(score > bestMoveScore)
        {
            bestMoveScore = score;
            bestIndex = j;
        }
    }

    std::swap(moves.moves[i], moves.moves[bestIndex]);

    Move move = moves.moves[i];

        if (!MoveEncoding::IsCapture(move))
            continue;

        UndoInfo undo;

        if (!board.MakeMove(move, undo))
            continue;

        Side mover =
            (board.side == WHITE)
            ? BLACK
            : WHITE;

        Square kingSquare =
            board.FindKing(mover);

        if (AttackDetector::IsSquareAttacked(
                board,
                kingSquare,
                board.side))
        {
            board.UndoMove(move, undo);
            continue;
        }

        int score =
            -Quiescence(
                board,
                -beta,
                -alpha);

        board.UndoMove(move, undo);

        if (score >= beta)
            return beta;

        if (score > alpha)
            alpha = score;
    }

    return alpha;
}
///
int Negamax(
    Board& board,
    int depth,
    int ply,
    int alpha,
    int beta)
{

   int ttScore;

int originalAlpha = alpha;

if(TT::Probe(
        board.hashKey,
        depth,
        alpha,
        beta,
        ttScore))
{
    return ttScore;
}

if(depth == 0)
    return Quiescence(
        board,
        alpha,
        beta);

    MoveList moves;
    MoveGenerator::Generate(board, moves);
    Move bestMove = 0;

    int legalMoves = 0;

   for(int i = 0; i < moves.count; i++)
{
    int bestIndex = i;
    int bestMoveScore = -1;

    for(int j = i; j < moves.count; j++)
    {
        int score =
            MoveOrdering::ScoreMove(
                board,
                moves.moves[j],0,ply);

        if(score > bestMoveScore)
        {
            bestMoveScore = score;
            bestIndex = j;
        }
    }

    std::swap(
        moves.moves[i],
        moves.moves[bestIndex]);

    Move move = moves.moves[i];

        UndoInfo undo;

        if(!board.MakeMove(move, undo))
            continue;

        Side mover = (board.side == WHITE) ? BLACK : WHITE;
        Square kingSquare = board.FindKing(mover);

        if(AttackDetector::IsSquareAttacked(board, kingSquare, board.side))
        {
            board.UndoMove(move, undo);
            continue;
        }

        legalMoves++;

        int score =
            -Negamax(
                board,
                depth - 1,
                ply + 1,
                -beta,
                -alpha);

        board.UndoMove(move, undo);

if(score > alpha)
{
    alpha = score;
    bestMove = move;
}

        if(alpha >= beta)
        {
            if(!MoveEncoding::IsCapture(move))
            {
                killerMoves[1][ply] =
                    killerMoves[0][ply];

                killerMoves[0][ply] =
                    move;
            }

            break;
        }
    }

    if(legalMoves == 0)
    {
        Square kingSquare = board.FindKing(board.side);

        if(AttackDetector::IsSquareAttacked(
                board,
                kingSquare,
                board.side == WHITE ? BLACK : WHITE))
        {
            return -MATE_SCORE + ply;
        }

        return 0;
    }

TT::Flag flag;

if(alpha <= originalAlpha)
{
    flag = TT::ALPHA;
}
else if(alpha >= beta)
{
    flag = TT::BETA;
}
else
{
    flag = TT::EXACT;
}

TT::Store(
    board.hashKey,
    depth,
    alpha,
    flag,
    bestMove);

return alpha;

}

Move FindBestMove(Board& board, int depth)
{
    Move bestMove = 0;

    for(int currentDepth = 1;
        currentDepth <= depth;
        currentDepth++)
    {
        Move iterationBestMove = 0;

        MoveList moves;
        MoveGenerator::Generate(board, moves);

        Move ttMove =
            TT::GetBestMove(board.hashKey);

        int bestScore = -INF;

        for(int i = 0; i < moves.count; i++)
        {
            // Search TT move first
            // if(ttMove != 0)
            // {
            //     for(int j = i; j < moves.count; j++)
            //     {
            //         if(moves.moves[j] == ttMove)
            //         {
            //             std::swap(
            //                 moves.moves[i],
            //                 moves.moves[j]);

            //             break;
            //         }
            //     }

            //     ttMove = 0;
            // }

            int bestIndex = i;
            int bestMoveScore = -1;

            for(int j = i; j < moves.count; j++)
            {
                int score =
                    MoveOrdering::ScoreMove(
                        board,
                        moves.moves[j],
                        ttMove,0);

                if(score > bestMoveScore)
                {
                    bestMoveScore = score;
                    bestIndex = j;
                }
            }

            std::swap(
                moves.moves[i],
                moves.moves[bestIndex]);

            Move move = moves.moves[i];

            UndoInfo undo;

            if(!board.MakeMove(move, undo))
                continue;

            Side mover =
                (board.side == WHITE)
                ? BLACK
                : WHITE;

            Square kingSquare =
                board.FindKing(mover);

            if(AttackDetector::IsSquareAttacked(
                    board,
                    kingSquare,
                    board.side))
            {
                board.UndoMove(move, undo);
                continue;
            }

            int score =
                -Negamax(
                    board,
                    currentDepth - 1,
                    1,
                    -INF,
                    INF);

            board.UndoMove(move, undo);

            if(score > bestScore)
            {
                bestScore = score;
                iterationBestMove = move;
            }
        }

        if(iterationBestMove != 0)
        {
            bestMove = iterationBestMove;
        }
    }

    return bestMove;
}
}