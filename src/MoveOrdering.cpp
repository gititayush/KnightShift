#include "MoveOrdering.h"
#include "Search.h"
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

int ScoreMove(
    const Board& board,
    Move move,
    Move ttMove,
    int ply)
{
        if(move == ttMove)
        return 1000000;
        if(!MoveEncoding::IsCapture(move))
            {
                if(move == Search::killerMoves[0][ply])
                    return 900000;

                if(move == Search::killerMoves[1][ply])
                    return 800000;

                Piece piece =
                    MoveEncoding::PieceMoved(move);

                Square to =
                    MoveEncoding::To(move);

                return Search::historyTable[piece][to];
            }
    if(MoveEncoding::IsCapture(move))
    {
        int attacker =
            static_cast<int>(MoveEncoding::PieceMoved(move)) % 6;

        int victim =
            static_cast<int>(
                 board.pieceOnSquare[
                     MoveEncoding::To(move)
        ]) % 6;

return 100000 + MVVLVA[attacker][victim];    }

    return 0;
}

}