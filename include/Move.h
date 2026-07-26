#pragma once

#include "Types.h"
#include <string>

using Move = U32;

namespace MoveEncoding
{
    Move Encode(
        Square from,
        Square to,
        Piece piece,
        Piece promotion = NO_PIECE,
        bool capture = false,
        bool doublePush = false,
        bool enPassant = false,
        bool castling = false
    );

    Square From(Move move);

    Square To(Move move);

    Piece PieceMoved(Move move);

    Piece PromotionPiece(Move move);

    bool IsCapture(Move move);

    bool IsDoublePush(Move move);

    bool IsEnPassant(Move move);

    bool IsCastling(Move move);

    // ADD THIS
    std::string SquareToString(Square square);

    void Print(Move move);

    std::string ToString(Move move);
}