#include "MoveOrdering.h"
#include "Search.h"
#include "SEE.h"
namespace MoveOrdering
{

constexpr int MVVLVA[6][6] =
{
    // Victim:
    //   P    N    B    R    Q    K
    {105,205,305,405,505,605}, // Pawn attacker
    {104,204,304,404,504,604}, // Knight attacker
    {103,203,303,403,503,603}, // Bishop attacker
    {102,202,302,402,502,602}, // Rook attacker
    {101,201,301,401,501,601}, // Queen attacker
    {100,200,300,400,500,600}  // King attacker
};

constexpr int PieceValue[6] =
{
    100,
    320,
    330,
    500,
    900,
    20000
};

int ScoreMove(
    const Board& board,
    Move move,
    Move ttMove,
    Move previousMove,
    int ply)
{
if(move == ttMove && ttMove != 0)
{
    return 2000000;
}
if(MoveEncoding::IsPromotion(move))
{
    return 1450000;
}
if(!MoveEncoding::IsCapture(move))
{
    if(move == Search::killerMoves[0][ply])
        return 900000;

    if(move == Search::killerMoves[1][ply])
        return 800000;

        if(previousMove != 0)
{
    Square prevFrom =
        MoveEncoding::From(previousMove);

    Square prevTo =
        MoveEncoding::To(previousMove);

    if(move == Search::counterMoves[prevFrom][prevTo])
        return 850000;
}

    Piece piece =
        MoveEncoding::PieceMoved(move);

    Square to =
        MoveEncoding::To(move);

    int score =
        Search::historyTable[piece][to];

    if(previousMove != 0)
    {
        Piece prevPiece =
            MoveEncoding::PieceMoved(previousMove);

        Square prevTo =
            MoveEncoding::To(previousMove);

        score +=
            Search::continuationHistory
            [prevPiece]
            [prevTo]
            [piece]
            [to];
    }

    return 700000 + score;
}
    if(MoveEncoding::IsCapture(move))
{
    int attacker =
        static_cast<int>(
            MoveEncoding::PieceMoved(move)) % 6;

    int victim =
        static_cast<int>(
            board.pieceOnSquare[
                MoveEncoding::To(move)]) % 6;

    int score =
        MVVLVA[attacker][victim];

    bool goodCapture =
        SEE::IsGoodCapture(
            board,
            move);

   if(goodCapture)
{
    if(PieceValue[victim] > PieceValue[attacker])
    {
        return 1300000 + score;
    }

    return 1200000 + score;
}

if(PieceValue[victim] >= PieceValue[attacker])
{
    return 600000 + score;
}

return 10000 + score;
}
    return 0;
}

}