#pragma once

#include "Board.h"
#include "Move.h"

namespace Search
{

    constexpr int MAX_PLY = 64;

    extern Move killerMoves[2][MAX_PLY];

    extern int historyTable[12][64];

    Move FindBestMove(Board& board, int depth);

    int Negamax(
        Board& board,
        int depth,
        int ply,
        int alpha,
        int beta
    );

    int Quiescence(
        Board& board,
        int alpha,
        int beta
    );
}