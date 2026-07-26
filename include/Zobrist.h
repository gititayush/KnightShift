#pragma once

#include "Board.h"

namespace Zobrist
{
    extern U64 PieceKeys[12][64];

    extern U64 EnPassantKeys[64];

    extern U64 CastlingKeys[16];

    extern U64 SideKey;

    void Initialize();

    U64 GenerateHash(const Board& board);
}