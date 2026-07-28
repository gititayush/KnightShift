#pragma once

#include <string>

#include "Types.h"
#include "Move.h"

struct NullUndo
{
    Square enPassant;

    int castling;

    int halfmoveClock;

    int fullmoveNumber;
};

struct UndoInfo
{
    Piece movedPiece;
    Piece capturedPiece;

    Square capturedSquare;

    int castling;

    Square enPassant;

    int halfmoveClock;

    int fullmoveNumber;
};

class Board
{
public:

    // Piece bitboards
    U64 bitboards[12];

    // White, Black, Both
    U64 occupancies[3];

    // Piece on every square
    Piece pieceOnSquare[64];

    // Side to move
    Side side;

    // En passant square
    Square enPassant;

    // Castling rights
    int castling;

    U64 hashKey;

    // 50 move rule
    int halfmoveClock;

    // Move number
    int fullmoveNumber;

    Board();

    void Reset();

    bool LoadFEN(const std::string& fen);

    bool MakeMove(Move move, UndoInfo& undo);

    void UndoMove(Move move, const UndoInfo& undo);

    void MakeNullMove(NullUndo& undo);

    void UndoNullMove(const NullUndo& undo);

    Square FindKing(Side side) const;

    Move ParseMove(const std::string& moveText) const;

    void Print() const;
};