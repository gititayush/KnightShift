#include "SEE.h"

#include "Move.h"
static constexpr int PieceValue[6] =
{
    100,
    320,
    330,
    500,
    900,
    20000
};

bool SEE::IsGoodCapture(
    const Board& board,
    Move move)
{
    if(!MoveEncoding::IsCapture(move))
        return true;

    Piece attacker =
        MoveEncoding::PieceMoved(move);

    Piece victim =
        board.pieceOnSquare[
            MoveEncoding::To(move)];

    int attackerValue =
        PieceValue[
            static_cast<int>(attacker) % 6];

    int victimValue =
        PieceValue[
            static_cast<int>(victim) % 6];

    return victimValue >= attackerValue;
}