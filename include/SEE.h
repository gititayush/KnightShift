#pragma once

#include "Board.h"
#include "Move.h"

namespace SEE
{
    int Evaluate(
        const Board& board,
        Move move);
}