#include "AttackDetector.h"

#include "AttackTables.h"
#include "Bitboard.h"

namespace AttackDetector
{

bool IsSquareAttacked(
    const Board& board,
    Square square,
    Side attacker
)
{
    if(attacker == WHITE)
    {
        if(AttackTables::pawnAttacks[BLACK][square] &
           board.bitboards[WP])
        {
            return true;
        }
    }
    else
    {
        if(AttackTables::pawnAttacks[WHITE][square] &
           board.bitboards[BP])
        {
            return true;
        }
    }
if(attacker == WHITE)
{
    if(AttackTables::knightAttacks[square] &
       board.bitboards[WN])
    {
        return true;
    }
}
else
{
    if(AttackTables::knightAttacks[square] &
       board.bitboards[BN])
    {
        return true;
    }
}

U64 bishopAttacks =
    AttackTables::BishopAttacks(
        square,
        board.occupancies[BOTH]);

U64 rookAttacks =
    AttackTables::RookAttacks(
        square,
        board.occupancies[BOTH]);

U64 queenAttacks =
    bishopAttacks | rookAttacks;

if(attacker == WHITE)
{
    if(bishopAttacks & board.bitboards[WB])
        return true;

    if(rookAttacks & board.bitboards[WR])
        return true;

    if(queenAttacks & board.bitboards[WQ])
        return true;
}
else
{
    if(bishopAttacks & board.bitboards[BB])
        return true;

    if(rookAttacks & board.bitboards[BR])
        return true;

    if(queenAttacks & board.bitboards[BQ])
        return true;
}

if(attacker == WHITE)
{
    if(AttackTables::kingAttacks[square] &
       board.bitboards[WK])
    {
        return true;
    }
}
else
{
    if(AttackTables::kingAttacks[square] &
       board.bitboards[BK])
    {
        return true;
    }
}

    return false;
}
}