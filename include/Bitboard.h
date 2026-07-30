#pragma once

#include "Types.h"

namespace Bitboard
{
    constexpr U64 NOT_A_FILE  = 0xfefefefefefefefeULL;
    constexpr U64 NOT_H_FILE  = 0x7f7f7f7f7f7f7f7fULL;
    constexpr U64 NOT_AB_FILE = 0xfcfcfcfcfcfcfcfcULL;
    constexpr U64 NOT_GH_FILE = 0x3f3f3f3f3f3f3f3fULL;

int CountBits(U64 board);

int LSBIndex(U64 board);

inline void PopBit(U64& board, int square)
{
    board &= ~(1ULL << square);
}

void Print(U64 board);
}