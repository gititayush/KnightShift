#pragma once

#include "Board.h"
#include "Move.h"

namespace Search
{

    constexpr int MAX_PLY = 64;

    extern Move killerMoves[2][MAX_PLY];

    constexpr int MAX_DEPTH = 64;

    extern Move pvTable[MAX_DEPTH][MAX_DEPTH];

    extern int pvLength[MAX_DEPTH];

    extern int historyTable[12][64];

    extern int continuationHistory
        [12][64]
        [12][64];

    Move FindBestMove(Board& board, int depth);

int Negamax(
    Board& board,
    int depth,
    int ply,
    int alpha,
    int beta,
    Move previousMove,
    bool allowNullMove = true);

    int Quiescence(
        Board& board,
        int alpha,
        int beta
    );
}