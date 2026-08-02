#pragma once

#include "Board.h"
#include "Move.h"
#include <string>

namespace OpeningBook
{
    void Initialize();
    Move GetBookMove(const Board& board);
    bool LoadBookFile(const std::string& filePath);
}
