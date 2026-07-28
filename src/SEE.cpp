#include "SEE.h"

namespace SEE
{

constexpr int PieceValue[12] =
{
    100,    // White Pawn
    320,    // White Knight
    330,    // White Bishop
    500,    // White Rook
    900,    // White Queen
    20000,  // White King

    100,    // Black Pawn
    320,    // Black Knight
    330,    // Black Bishop
    500,    // Black Rook
    900,    // Black Queen
    20000   // Black King
};

int Evaluate(
    const Board& board,
    Move move)
{
    Piece captured =
        board.pieceOnSquare[
            MoveEncoding::To(move)];

    Piece attacker =
        MoveEncoding::PieceMoved(move);

    return PieceValue[captured]
         - PieceValue[attacker];
}

}