#include "Search.h"
#include "MoveOrdering.h"
#include <utility>
#include "AttackDetector.h"
#include "Evaluation.h"
#include "MoveGenerator.h"
#include "TranspositionTable.h"
#include "SearchStats.h"
#include <cstring>
#include "SEE.h"
#include "OpeningBook.h"
#include <iostream>
#include <chrono>
namespace Search
{

bool stopSearch = false;
int searchTime = 0;
bool useTimeControl = false;

std::chrono::steady_clock::time_point searchStart;

Move killerMoves[2][MAX_PLY] = {};
Move counterMoves[64][64] = {};
int historyTable[12][64] = {};
int continuationHistory
    [12][64]
    [12][64] = {};
Move pvTable[MAX_DEPTH][MAX_DEPTH] = {};

int pvLength[MAX_DEPTH] = {};
constexpr int INF = 1000000;
constexpr int HISTORY_MAX = 16384;
constexpr int MATE_SCORE = 30000;

int Quiescence(
    Board& board,
    int alpha,
    int beta)
{
if(stopSearch)
    return Evaluation::Evaluate(board);

Square kingSquare =
    board.FindKing(board.side);

bool inCheck =
    AttackDetector::IsSquareAttacked(
        board,
        kingSquare,
        board.side == WHITE ? BLACK : WHITE);

int standPat =
    Evaluation::Evaluate(board);

    constexpr int DELTA_MARGIN = 900;

    if (standPat >= beta)
        return beta;

    if (standPat > alpha)
        alpha = standPat;

    MoveList moves;
    if (inCheck)
    {
        MoveGenerator::Generate(board, moves);
    }
    else
    {
        MoveGenerator::GenerateCaptures(board, moves);
    }

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

        bool isPromotion = MoveEncoding::PromotionPiece(move) != NO_PIECE;

        if(!inCheck &&
            !MoveEncoding::IsCapture(move) &&
            !isPromotion)
            {
                continue;
            }

        if(!inCheck &&
            !isPromotion &&
            !SEE::IsGoodCapture(board, move))
        {
            continue;
        }

            Piece captured =
                board.pieceOnSquare[
                    MoveEncoding::To(move)];

            constexpr int PieceValue[12] =
            {
                100,320,330,500,900,20000,
                100,320,330,500,900,20000
            };

            if(!inCheck &&
            standPat +
            PieceValue[captured] +
            DELTA_MARGIN < alpha)
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
    Move previousMove,
    bool allowNullMove)
{

    if(stopSearch)
    return 0;

    SearchStats::nodes++;

    if(useTimeControl &&
   (SearchStats::nodes & 2047) == 0)
{
    auto elapsed =
        std::chrono::duration_cast<
        std::chrono::milliseconds>(
            std::chrono::steady_clock::now()
            - searchStart).count();

    if(elapsed >= searchTime)
    {
        stopSearch = true;
        return 0;
    }
}

    if(ply > 100)
{
    std::cout << "PLY = " << ply
              << " DEPTH = " << depth
              << std::endl;
    std::abort();
}
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

int staticEval =
    Evaluation::Evaluate(board);

// =========================
// Reverse Futility Pruning
// =========================

if(depth <= 3 &&
   !pvNode &&
   !inCheck)
{
    constexpr int FUTILITY_MARGIN = 120;

    if(staticEval - depth * FUTILITY_MARGIN >= beta)
    {
        return staticEval;
    }
}

    Move ttMove =
    TT::GetBestMove(board.hashKey);

bool useIID =
    depth >= 6 &&
    pvNode &&
    ttMove == 0 &&
    allowNullMove;

if(useIID)
{
    SearchStats::iidSearches++;

    Negamax(
        board,
        depth - 3,
        ply,
        -INF,
        INF,
        previousMove,
        allowNullMove);

    ttMove =
        TT::GetBestMove(board.hashKey);
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
   depth >= 4 &&
   !inCheck)
   {
    NullUndo nullUndo;

    board.MakeNullMove(nullUndo);

 int NULL_REDUCTION =
        (depth >= 6) ? 3 : 2;

int score =
    -Negamax(
        board,
        depth - 1 - NULL_REDUCTION,
        ply + 1,
        -beta,
        -beta + 1,
        0,
        false);

    board.UndoNullMove(nullUndo);

    if(score >= beta)
        return beta;
}


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
                moves.moves[j],ttMove,previousMove,ply);

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

if(depth <= 2 &&
   !pvNode &&
   legalMoves >= 14 &&
   (
      !MoveEncoding::IsCapture(move) &&
      !SEE::IsGoodCapture(board, move)
   ) &&
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
// =========================
// Futility Pruning
// =========================

// if(depth == 1 &&
//    !pvNode &&
//    !inCheck &&
//    !MoveEncoding::IsCapture(move))
// {
//     constexpr int FUTILITY_MARGIN = 150;

//     if(staticEval + FUTILITY_MARGIN <= alpha)
//     {
//         board.UndoMove(move, undo);
//         continue;
//     }
// }

int fullDepth = depth - 1;
int searchDepth = fullDepth;
// // Check Extension
// Square enemyKing =
//     board.FindKing(board.side);

// if(depth > 2 &&
//    AttackDetector::IsSquareAttacked(
//         board,
//         enemyKing,
//         mover))
// {
//     searchDepth++;
// }

Square enemyKing =
    board.FindKing(board.side);

bool givesCheck =
    AttackDetector::IsSquareAttacked(
        board,
        enemyKing,
        mover);

bool reduce =
    legalMoves > 1 &&
    depth >= 3 &&
    !pvNode &&
    legalMoves >= 4 &&
    !MoveEncoding::IsCapture(move) &&
    !givesCheck &&
    move != killerMoves[0][ply] &&
    move != killerMoves[1][ply];

if(reduce)
{
    SearchStats::lmrReduced++;

int reduction = 1;

if(depth >= 6)
    reduction++;

if(depth >= 10)
    reduction++;

if(legalMoves >= 10)
    reduction++;

if(reduction > 3)
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
                    -alpha, move);
        }
        else
        {
            score =
                -Negamax(
                    board,
                    searchDepth,
                    ply + 1,
                    -alpha - 1,
                    -alpha,move);

                   if(reduce)
{
    if(score > alpha)
    {
        SearchStats::lmrResearches++;

        score =
            -Negamax(
                board,
                fullDepth,
                ply + 1,
                -beta,
                -alpha,
                move);
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
                -alpha,move);
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
                    if(move != killerMoves[0][ply])
                    {
                        killerMoves[1][ply] =
                            killerMoves[0][ply];

                        killerMoves[0][ply] =
                            move;
                    }
                        SearchStats::killerUpdates++;

                    Piece piece =
                        MoveEncoding::PieceMoved(move);

                    Square to =
                        MoveEncoding::To(move);

int bonus =
    depth * depth +
    depth;
historyTable[piece][to] +=
(
    bonus *
    (HISTORY_MAX - historyTable[piece][to])
) / HISTORY_MAX;

if(historyTable[piece][to] > HISTORY_MAX)
    historyTable[piece][to] = HISTORY_MAX;

if(historyTable[piece][to] < -HISTORY_MAX)
    historyTable[piece][to] = -HISTORY_MAX;


for(int j = 0; j < i; j++)
{
    Move prev = moves.moves[j];

    if(MoveEncoding::IsCapture(prev))
        continue;

    Piece p =
        MoveEncoding::PieceMoved(prev);

    Square sq =
        MoveEncoding::To(prev);

    int malus = depth * depth;

    historyTable[p][sq] -=
    (
        malus *
        (HISTORY_MAX + historyTable[p][sq])
    ) / HISTORY_MAX;

    if(historyTable[p][sq] < -HISTORY_MAX)
        historyTable[p][sq] = -HISTORY_MAX;
}

if(previousMove != 0)
{
    Piece prevPiece =
        MoveEncoding::PieceMoved(previousMove);

    Square prevTo =
        MoveEncoding::To(previousMove);

    continuationHistory
        [prevPiece]
        [prevTo]
        [piece]
        [to] += bonus;

    if(continuationHistory
            [prevPiece]
            [prevTo]
            [piece]
            [to] > HISTORY_MAX)
    {
        continuationHistory
            [prevPiece]
            [prevTo]
            [piece]
            [to] = HISTORY_MAX;
    }
}

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
    stopSearch = false;

    // Check Opening Book first
    Move bookMove = OpeningBook::GetBookMove(board);
    if (bookMove != 0)
    {
        std::cout << "info string Opening Book move played" << std::endl;
        return bookMove;
    }

    searchStart = std::chrono::steady_clock::now();
    SearchStats::Reset();

    Move bestMove = 0;

    int previousScore = 0;
    bool hasPreviousScore = false;

    constexpr int ASPIRATION_WINDOW = 30;

    for(int currentDepth = 1;
        currentDepth <= depth;
        currentDepth++)
    {
        if(stopSearch)
            break;

        Move iterationBestMove = 0;

        MoveList moves;
        MoveGenerator::Generate(board, moves);

        Move ttMove =
            TT::GetBestMove(board.hashKey);

        int alpha;
        int beta;

        if(hasPreviousScore && currentDepth >= 4)
        {
            alpha = previousScore - ASPIRATION_WINDOW;
            beta  = previousScore + ASPIRATION_WINDOW;
        }
        else
        {
            alpha = -INF;
            beta  = INF;
        }

        int bestScore = -INF;
        bool firstMove = true;
        bool aspirationFail = false;

        for(int i = 0; i < moves.count; i++)
        {
            if(stopSearch)
                break;

            int bestIndex = i;
            int bestMoveScore = -1;

            for(int j = i; j < moves.count; j++)
            {
                int score =
                    MoveOrdering::ScoreMove(
                        board,
                        moves.moves[j],
                        ttMove,
                        0,
                        0);

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

            int score;

            if(firstMove)
            {
                score =
    -Negamax(
        board,
        currentDepth - 1,
        1,
        -beta,
        -alpha,
        move);

if(score <= alpha || score >= beta)
{
    aspirationFail = true;

    score =
        -Negamax(
            board,
            currentDepth - 1,
            1,
            -INF,
            INF,
            move);
}

                firstMove = false;
            }
            else
            {
                score =
                    -Negamax(
                        board,
                        currentDepth - 1,
                        1,
                        -bestScore - 1,
                        -bestScore,
                        move);

                if(score > bestScore)
                {
                    score =
                        -Negamax(
                            board,
                            currentDepth - 1,
                            1,
                            -INF,
                            INF,
                            move);
                }
            }

            board.UndoMove(move, undo);

            if(score > bestScore)
            {
                bestScore = score;
                iterationBestMove = move;
            }
        }

        if(!stopSearch && iterationBestMove != 0)
        {
            bestMove = iterationBestMove;
            previousScore = bestScore;
            hasPreviousScore = true;

            auto now = std::chrono::steady_clock::now();
            int timeMs = std::chrono::duration_cast<std::chrono::milliseconds>(now - searchStart).count();
            uint64_t nodes = SearchStats::nodes;
            uint64_t nps = timeMs > 0 ? (nodes * 1000) / timeMs : 0;
            int scoreCp = bestScore;

            std::cout << "info depth " << currentDepth
                      << " score cp " << scoreCp
                      << " nodes " << nodes
                      << " nps " << nps
                      << " time " << timeMs
                      << " pv " << MoveEncoding::ToString(iterationBestMove)
                      << std::endl;
        }
    }

    if (bestMove == 0)
    {
        MoveList moves;
        MoveGenerator::Generate(board, moves);
        if (moves.count > 0)
        {
            bestMove = moves.moves[0];
        }
    }

    return bestMove;
}
}
