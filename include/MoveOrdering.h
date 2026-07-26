#pragma once

#include "Board.h"
#include "Move.h"

namespace MoveOrdering
{
    int ScoreMove(
        const Board& board,
        Move move,
        Move ttMove = 0,
        int ply = 0);
}