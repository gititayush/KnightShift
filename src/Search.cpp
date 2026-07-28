#include "Search.h"
#include "MoveOrdering.h"
#include <utility>
#include "AttackDetector.h"
#include "Evaluation.h"
#include "MoveGenerator.h"
#include "TranspositionTable.h"
#include "SearchStats.h"
#include <cstring>
namespace Search
{
Move killerMoves[2][MAX_PLY] = {};
int historyTable[12][64] = {};
Move pvTable[MAX_DEPTH][MAX_DEPTH] = {};

int pvLength[MAX_DEPTH] = {};
constexpr int INF = 1000000;
constexpr int MATE_SCORE = 30000;

int Quiescence(
    Board& board,
    int alpha,
    int beta)
{
    int standPat = Evaluation::Evaluate(board);

    constexpr int DELTA_MARGIN = 900;

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

            Piece captured =
                board.pieceOnSquare[
                    MoveEncoding::To(move)];

            constexpr int PieceValue[12] =
            {
                100,320,330,500,900,20000,
                100,320,330,500,900,20000
            };

            if(standPat +
            PieceValue[captured] +
            DELTA_MARGIN
            < alpha)
            {
                continue;
            }

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
    int beta,
    bool allowNullMove)
{
    SearchStats::nodes++;
   int ttScore;

int originalAlpha = alpha;
int originalDepth = depth;

pvLength[ply] = ply;

bool pvNode =
    (beta - alpha) > 1;



Square kingSquare =
    board.FindKing(board.side);

bool inCheck =
    AttackDetector::IsSquareAttacked(
        board,
        kingSquare,
        board.side == WHITE ? BLACK : WHITE);

if(inCheck)
    depth++;

if(depth <= 0)
    return Quiescence(
        board,
        alpha,
        beta);

if(TT::Probe(
        board.hashKey,
        depth,
        alpha,
        beta,
        ttScore))
{
    return ttScore;
}

// =========================
// Mate Distance Pruning
// =========================

alpha = std::max(alpha, -MATE_SCORE + ply);

beta = std::min(beta, MATE_SCORE - ply);

if(alpha >= beta)
    return alpha;


        // =========================
// Null Move Pruning
// =========================


bool hasMajorPiece = false;

for(int piece = WN; piece <= BQ; piece++)
{
    if(board.bitboards[piece])
    {
        hasMajorPiece = true;
        break;
    }
}

if(allowNullMove &&
   hasMajorPiece &&
   depth >= 3 &&
   !inCheck)
   {
    NullUndo nullUndo;

    board.MakeNullMove(nullUndo);

int nullReduction =
    2 + depth / 4;

int score =
    -Negamax(
        board,
        depth - 1 - nullReduction,
        ply + 1,
        -beta,
        -beta + 1,
        false);

    board.UndoNullMove(nullUndo);

    if(score >= beta)
        return beta;
}


    MoveList moves;
    MoveGenerator::Generate(board, moves);

    Move ttMove =
    TT::GetBestMove(board.hashKey);

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
                moves.moves[j],ttMove,ply);

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

    // =========================
// Late Move Pruning
// =========================

if(depth <= 3 &&
   !pvNode &&
   legalMoves >= 8 &&
   !MoveEncoding::IsCapture(move) &&
   move != killerMoves[0][ply] &&
   move != killerMoves[1][ply])
{
    continue;
}

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

        // =========================
// Late Move Pruning
// =========================


int searchDepth = depth - 1;

bool reduce =
    depth >= 3 &&
    !pvNode &&
    legalMoves >= 3 &&
    !MoveEncoding::IsCapture(move) &&
    move != killerMoves[0][ply] &&
    move != killerMoves[1][ply];

if(reduce)
{
    SearchStats::lmrReduced++;

    int reduction = 1;

    if(depth >= 8)
        reduction = 2;

    if(depth >= 12)
        reduction = 3;

    searchDepth -= reduction;

    if(searchDepth < 1)
        searchDepth = 1;
}

int score;

        if(legalMoves == 1)
        {
            score =
                -Negamax(
                    board,
                    searchDepth,
                    ply + 1,
                    -beta,
                    -alpha);
        }
        else
        {
            score =
                -Negamax(
                    board,
                    searchDepth,
                    ply + 1,
                    -alpha - 1,
                    -alpha);

                   if(reduce)
{
    if(score > alpha)
    {
        SearchStats::lmrResearches++;

        score =
            -Negamax(
                board,
                depth - 1,
                ply + 1,
                -beta,
                -alpha);
    }
}
else
{
    if(score > alpha && score < beta)
    {
        SearchStats::pvsResearches++;

        score =
            -Negamax(
                board,
                depth - 1,
                ply + 1,
                -beta,
                -alpha);
    }
}
    }

        board.UndoMove(move, undo);

if(score > alpha)
{
    alpha = score;
    bestMove = move;

    pvTable[ply][ply] = move;

    for(int next = ply + 1;
        next < pvLength[ply + 1];
        next++)
    {
        pvTable[ply][next] =
            pvTable[ply + 1][next];
    }

    pvLength[ply] =
        pvLength[ply + 1];
        pvLength[ply]++;
}

        if(alpha >= beta)
            {
                SearchStats::betaCutoffs++;
                if(!MoveEncoding::IsCapture(move))
                {
                    killerMoves[1][ply] =
                        killerMoves[0][ply];

                    killerMoves[0][ply] =
                        move;
                        SearchStats::killerUpdates++;

                    Piece piece =
                        MoveEncoding::PieceMoved(move);

                    Square to =
                        MoveEncoding::To(move);

                    historyTable[piece][to] += depth * depth;

                    if(historyTable[piece][to] > 500000)
                    historyTable[piece][to] = 500000;

                    SearchStats::historyUpdates++;
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
    originalDepth,
    alpha,
    flag,
    bestMove);

return alpha;

}

Move FindBestMove(Board& board, int depth)
{
    std::memset(
        historyTable,
        0,
        sizeof(historyTable));
        SearchStats::Reset();
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
// SearchStats::Print();
    return bestMove;
}
}
