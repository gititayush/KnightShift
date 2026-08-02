#pragma once

#include "Board.h"

namespace SEE
{
    int Evaluate(const Board& board, Move move);
    bool IsGoodCapture(const Board& board, Move move, int threshold = 0);
}