#pragma once

#include "Types.h"

namespace AttackTables
{
    extern U64 pawnAttacks[2][64];
    extern U64 knightAttacks[64];
    extern U64 kingAttacks[64];

    U64 MaskPawnAttacks(Side side, Square square);

    U64 MaskKnightAttacks(Square square);

    U64 MaskKingAttacks(Square square);

U64 BishopAttacks(
    Square square,
    U64 occupancy);

U64 RookAttacks(
    Square square,
    U64 occupancy);

inline U64 QueenAttacks(
    Square square,
    U64 occupancy)
{
    return BishopAttacks(square, occupancy) |
           RookAttacks(square, occupancy);
}

void Initialize();
}