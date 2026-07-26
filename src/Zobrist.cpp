#include "Zobrist.h"

#include <random>

namespace Zobrist
{

U64 PieceKeys[12][64];

U64 EnPassantKeys[64];

U64 CastlingKeys[16];

U64 SideKey;

static std::mt19937_64 rng(0xCAFEBABE);

static U64 RandomU64()
{
    return rng();
}

void Initialize()
{
    for(int piece = 0; piece < 12; piece++)
    {
        for(int square = 0; square < 64; square++)
        {
            PieceKeys[piece][square] = RandomU64();
        }
    }

    for(int square = 0; square < 64; square++)
    {
        EnPassantKeys[square] = RandomU64();
    }

    for(int i = 0; i < 16; i++)
    {
        CastlingKeys[i] = RandomU64();
    }

    SideKey = RandomU64();
}

U64 GenerateHash(const Board& board)
{
    U64 hash = 0ULL;

    // Pieces
    for(int square = 0; square < 64; square++)
    {
        Piece piece = board.pieceOnSquare[square];

        if(piece != NO_PIECE)
        {
            hash ^= PieceKeys[piece][square];
        }
    }

    // Side to move
    if(board.side == BLACK)
    {
        hash ^= SideKey;
    }

    // En passant
    if(board.enPassant != NO_SQUARE)
    {
        hash ^= EnPassantKeys[board.enPassant];
    }

    // Castling rights
    hash ^= CastlingKeys[board.castling];

    return hash;
}

}