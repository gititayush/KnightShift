#include "SEE.h"
#include "AttackTables.h"
#include "Bitboard.h"
#include <algorithm>

namespace SEE
{

static constexpr int PieceValue[12] =
{
    100, 320, 330, 500, 900, 20000,
    100, 320, 330, 500, 900, 20000
};

static constexpr U64 NOT_A_FILE = 0xFEFEFEFEFEFEFEFEULL;
static constexpr U64 NOT_H_FILE = 0x7F7F7F7F7F7F7F7FULL;

static U64 GetAttackers(const Board& board, Square sq, U64 occ)
{
    U64 attackers = 0ULL;

    U64 wp = board.bitboards[WP];
    U64 bp = board.bitboards[BP];

    U64 wPawnAttacksOnSq = (((1ULL << sq) >> 7) & NOT_A_FILE) | (((1ULL << sq) >> 9) & NOT_H_FILE);
    U64 bPawnAttacksOnSq = (((1ULL << sq) << 7) & NOT_A_FILE) | (((1ULL << sq) << 9) & NOT_H_FILE);

    attackers |= (wPawnAttacksOnSq & wp);
    attackers |= (bPawnAttacksOnSq & bp);

    attackers |= (AttackTables::knightAttacks[sq] & (board.bitboards[WN] | board.bitboards[BN]));

    U64 bq = board.bitboards[WB] | board.bitboards[WQ] | board.bitboards[BB] | board.bitboards[BQ];
    attackers |= (AttackTables::BishopAttacks(sq, occ) & bq);

    U64 rq = board.bitboards[WR] | board.bitboards[WQ] | board.bitboards[BR] | board.bitboards[BQ];
    attackers |= (AttackTables::RookAttacks(sq, occ) & rq);

    attackers |= (AttackTables::kingAttacks[sq] & (board.bitboards[WK] | board.bitboards[BK]));

    return attackers;
}

static U64 GetLeastValuableAttacker(const Board& board, U64 attackers, Side side, Piece& pieceType)
{
    int pawnPiece = (side == WHITE) ? WP : BP;
    U64 pawns = attackers & board.bitboards[pawnPiece];
    if (pawns)
    {
        pieceType = (Piece)pawnPiece;
        return 1ULL << Bitboard::LSBIndex(pawns);
    }

    int knightPiece = (side == WHITE) ? WN : BN;
    U64 knights = attackers & board.bitboards[knightPiece];
    if (knights)
    {
        pieceType = (Piece)knightPiece;
        return 1ULL << Bitboard::LSBIndex(knights);
    }

    int bishopPiece = (side == WHITE) ? WB : BB;
    U64 bishops = attackers & board.bitboards[bishopPiece];
    if (bishops)
    {
        pieceType = (Piece)bishopPiece;
        return 1ULL << Bitboard::LSBIndex(bishops);
    }

    int rookPiece = (side == WHITE) ? WR : BR;
    U64 rooks = attackers & board.bitboards[rookPiece];
    if (rooks)
    {
        pieceType = (Piece)rookPiece;
        return 1ULL << Bitboard::LSBIndex(rooks);
    }

    int queenPiece = (side == WHITE) ? WQ : BQ;
    U64 queens = attackers & board.bitboards[queenPiece];
    if (queens)
    {
        pieceType = (Piece)queenPiece;
        return 1ULL << Bitboard::LSBIndex(queens);
    }

    int kingPiece = (side == WHITE) ? WK : BK;
    U64 king = attackers & board.bitboards[kingPiece];
    if (king)
    {
        pieceType = (Piece)kingPiece;
        return 1ULL << Bitboard::LSBIndex(king);
    }

    return 0ULL;
}

int Evaluate(const Board& board, Move move)
{
    if (!MoveEncoding::IsCapture(move))
        return 0;

    Square from = MoveEncoding::From(move);
    Square to   = MoveEncoding::To(move);

    Piece attackerPiece = MoveEncoding::PieceMoved(move);
    Piece capturedPiece = board.pieceOnSquare[to];

    int gain[32];
    int d = 0;

    gain[d] = PieceValue[capturedPiece];

    U64 occ = board.occupancies[BOTH];
    U64 attackers = GetAttackers(board, to, occ);

    Bitboard::PopBit(occ, from);
    Bitboard::PopBit(attackers, from);

    Side sideToMove = (board.side == WHITE) ? BLACK : WHITE;

    U64 bq = board.bitboards[WB] | board.bitboards[WQ] | board.bitboards[BB] | board.bitboards[BQ];
    U64 rq = board.bitboards[WR] | board.bitboards[WQ] | board.bitboards[BR] | board.bitboards[BQ];

    attackers |= (AttackTables::BishopAttacks(to, occ) & bq);
    attackers |= (AttackTables::RookAttacks(to, occ) & rq);

    Piece currentAttackerPiece = attackerPiece;

    while (true)
    {
        d++;
        gain[d] = PieceValue[currentAttackerPiece] - gain[d - 1];

        if (std::max(-gain[d - 1], gain[d]) < 0)
            break;

        Piece nextPiece;
        U64 lva = GetLeastValuableAttacker(board, attackers, sideToMove, nextPiece);
        if (!lva)
            break;

        Square lvaSq = (Square)Bitboard::LSBIndex(lva);
        Bitboard::PopBit(occ, lvaSq);
        Bitboard::PopBit(attackers, lvaSq);

        currentAttackerPiece = nextPiece;
        sideToMove = (sideToMove == WHITE) ? BLACK : WHITE;

        attackers |= (AttackTables::BishopAttacks(to, occ) & bq);
        attackers |= (AttackTables::RookAttacks(to, occ) & rq);
    }

    while (--d > 0)
    {
        gain[d - 1] = -std::max(-gain[d - 1], gain[d]);
    }

    return gain[0];
}

bool IsGoodCapture(const Board& board, Move move, int threshold)
{
    if (!MoveEncoding::IsCapture(move))
        return true;

    return Evaluate(board, move) >= threshold;
}

}