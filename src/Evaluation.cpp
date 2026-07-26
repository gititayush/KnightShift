#include "Evaluation.h"
#include "Bitboard.h"
#include "PieceSquareTables.h"
#include "AttackTables.h"
namespace Evaluation
{
    constexpr int PieceValues[] =
    {
        100, // Pawn
        320, // Knight
        330, // Bishop
        500, // Rook
        900, // Queen
        0    // King
    };

    constexpr int PIECE_TYPES = sizeof(PieceValues) / sizeof(PieceValues[0]);
    constexpr int KNIGHT_MOBILITY = 4;
constexpr int BISHOP_MOBILITY = 5;
constexpr int ROOK_MOBILITY   = 2;
constexpr int QUEEN_MOBILITY  = 1;

constexpr int PASSED_PAWN_BONUS[8] =
{
     0,
    10,
    20,
    35,
    55,
    80,
   120,
     0
};

constexpr int ISOLATED_PAWN_PENALTY = 15;

constexpr int DOUBLED_PAWN_PENALTY = 12;

inline int Mirror(int square)
{
    return square ^ 56;
}

inline bool IsPassedPawn(
    const Board& board,
    Square square,
    Side side)
{
    int file = square % 8;
    int rank = square / 8;

    U64 enemyPawns =
        board.bitboards[
            side == WHITE ? BP : WP];

    if(side == WHITE)
    {
        for(int r = rank + 1; r < 8; r++)
        {
            for(int f = file - 1;
                f <= file + 1;
                f++)
            {
                if(f < 0 || f > 7)
                    continue;

                int sq = r * 8 + f;

                if(enemyPawns & (1ULL << sq))
                    return false;
            }
        }
    }
    else
    {
        for(int r = rank - 1; r >= 0; r--)
        {
            for(int f = file - 1;
                f <= file + 1;
                f++)
            {
                if(f < 0 || f > 7)
                    continue;

                int sq = r * 8 + f;

                if(enemyPawns & (1ULL << sq))
                    return false;
            }
        }
    }

    return true;
}

inline bool IsIsolatedPawn(
    const Board& board,
    Square square,
    Side side)
{
    int file = square % 8;

    U64 friendlyPawns =
        board.bitboards[
            side == WHITE ? WP : BP];

    // Left adjacent file
    if(file > 0)
    {
        for(int r = 0; r < 8; r++)
        {
            int sq = r * 8 + (file - 1);

            if(friendlyPawns & (1ULL << sq))
                return false;
        }
    }

    // Right adjacent file
    if(file < 7)
    {
        for(int r = 0; r < 8; r++)
        {
            int sq = r * 8 + (file + 1);

            if(friendlyPawns & (1ULL << sq))
                return false;
        }
    }

    return true;
}

inline bool IsDoubledPawn(
    const Board& board,
    Square square,
    Side side)
{
    int file = square % 8;

    U64 friendlyPawns =
        board.bitboards[
            side == WHITE ? WP : BP];

    int count = 0;

    for(int rank = 0; rank < 8; rank++)
    {
        int sq = rank * 8 + file;

        if(friendlyPawns & (1ULL << sq))
            count++;
    }

    return count > 1;
}

inline int CountBits(U64 bb)
{
    return Bitboard::CountBits(bb);
}

int Evaluate(const Board& board)
{
    int score = 0;

    for(int square = 0; square < 64; square++)
    {
        Piece piece = board.pieceOnSquare[square];

        if(piece == NO_PIECE)
            continue;

        switch(piece)
        {
            // ================= WHITE =================

            case WP:
                score += PieceValues[0];
                score += PST::Pawn[square];

                if(IsPassedPawn(board, (Square)square, WHITE))
                {
                    int rank = square / 8;

                    score += PASSED_PAWN_BONUS[rank];
                }

                if(IsIsolatedPawn(board, (Square)square, WHITE))
                {
                    score -= ISOLATED_PAWN_PENALTY;
                }

                if(IsDoubledPawn(board, (Square)square, WHITE))
                {
                    score -= DOUBLED_PAWN_PENALTY;
                }

                break;

            case WN:
    score += PieceValues[1];
    score += PST::Knight[square];

    score +=
        CountBits(
            AttackTables::knightAttacks[square]
            &
            ~board.occupancies[WHITE]
        ) * KNIGHT_MOBILITY;

    break;

           case WB:
{
    score += PieceValues[2];
    score += PST::Bishop[square];

    U64 attacks =
        AttackTables::BishopAttacks(
            (Square)square,
            board.occupancies[BOTH]);

    attacks &= ~board.occupancies[WHITE];

    score +=
        CountBits(attacks) * BISHOP_MOBILITY;

    break;
}

            case WR:
{
    score += PieceValues[3];
    score += PST::Rook[square];

    U64 attacks =
        AttackTables::RookAttacks(
            (Square)square,
            board.occupancies[BOTH]);

    attacks &= ~board.occupancies[WHITE];

    score +=
        CountBits(attacks) * ROOK_MOBILITY;

    break;
}

           case WQ:
{
    score += PieceValues[4];
    score += PST::Queen[square];

    U64 attacks =
        AttackTables::QueenAttacks(
            (Square)square,
            board.occupancies[BOTH]);

    attacks &= ~board.occupancies[WHITE];

    score +=
        CountBits(attacks) * QUEEN_MOBILITY;

    break;
}

            case WK:
                score += PST::KingMiddleGame[square];
                break;

            // ================= BLACK =================

            case BP:
                score -= PieceValues[0];
                score -= PST::Pawn[Mirror(square)];
                
                if(IsPassedPawn(board, (Square)square, BLACK))
                {
                    int rank = 7 - (square / 8);

                    score -= PASSED_PAWN_BONUS[rank];
                }

                if(IsIsolatedPawn(board, (Square)square, BLACK))
                {
                    score += ISOLATED_PAWN_PENALTY;
                }

                if(IsDoubledPawn(board, (Square)square, BLACK))
                {
                    score += DOUBLED_PAWN_PENALTY;
                }

                break;

            case BN:
    score -= PieceValues[1];
    score -= PST::Knight[Mirror(square)];

    score -=
        CountBits(
            AttackTables::knightAttacks[square]
            &
            ~board.occupancies[BLACK]
        ) * KNIGHT_MOBILITY;

    break;

           case BB:
{
    score -= PieceValues[2];
    score -= PST::Bishop[Mirror(square)];

    U64 attacks =
        AttackTables::BishopAttacks(
            (Square)square,
            board.occupancies[BOTH]);

    attacks &= ~board.occupancies[BLACK];

    score -=
        CountBits(attacks) * BISHOP_MOBILITY;

    break;
}

            case BR:
{
    score -= PieceValues[3];
    score -= PST::Rook[Mirror(square)];

    U64 attacks =
        AttackTables::RookAttacks(
            (Square)square,
            board.occupancies[BOTH]);

    attacks &= ~board.occupancies[BLACK];

    score -=
        CountBits(attacks) * ROOK_MOBILITY;

    break;
}

            case BQ:
{
    score -= PieceValues[4];
    score -= PST::Queen[Mirror(square)];

    U64 attacks =
        AttackTables::QueenAttacks(
            (Square)square,
            board.occupancies[BOTH]);

    attacks &= ~board.occupancies[BLACK];

    score -=
        CountBits(attacks) * QUEEN_MOBILITY;

    break;
}

            case BK:
                score -= PST::KingMiddleGame[Mirror(square)];
                break;

            default:
                break;
        }
    }

    return (board.side == WHITE) ? score : -score;
}
}