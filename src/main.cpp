#include <iostream>
#include "TestPositions.h"
#include "AttackTables.h"
#include "Board.h"
#include "Move.h"
#include "Search.h"
#include "SearchStats.h"
#include "TranspositionTable.h"
#include "Zobrist.h"
#include "UCI.h"

int main()
{
    AttackTables::Initialize();
    Zobrist::Initialize();
    TT::Initialize();

    UCI::Loop();


    return 0;
}

// int main()
// {
//     AttackTables::Initialize();
//     Zobrist::Initialize();
//     TT::Initialize();

//     Board board;

//     board.LoadFEN(
//         "r2rb1k1/pp1q1p1p/2n1p1p1/2bp4/5P2/PP1BPR1Q/1BPN2PP/R5K1 w - - 0 1");

//     Move best =
//         Search::FindBestMove(board, 5);

//     std::cout
//         << "Best move: "
//         << MoveEncoding::ToString(best)
//         << '\n';

//     SearchStats::Print();

//     return 0;
// }



//============================
// #include <iostream>

// #include "AttackTables.h"
// #include "Board.h"
// #include "Perft.h"
// #include "TranspositionTable.h"
// #include "Zobrist.h"

// struct Test
// {
//     const char* name;
//     const char* fen;
//     U64 expected;
// };

// int main()
// {
//     AttackTables::Initialize();
//     Zobrist::Initialize();
//     TT::Initialize();

//     Test tests[] =
//     {
//         {
//             "Position 1",
//             "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
//             197281ULL
//         },
//         {
//             "Position 2",
//             "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -",
//             4085603ULL
//         },
//         {
//             "Position 3",
//             "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1",
//             43238ULL
//         },
//         {
//             "Position 4",
//             "r2q1rk1/pP1p2pp/Q4n2/bbp1p3/Np6/1B3NBn/pPPP1PPP/R3K2R b KQ - 0 1",
//             422333ULL
//         },
//         {
//             "Position 5",
//             "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8",
//             2103487ULL
//         },
//         {
//             "Position 6",
//             "r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10",
//             3894594ULL
//         }
//     };

//     constexpr int depth = 4;

//     int passed = 0;

//     for(const auto& test : tests)
//     {
//         Board board;
//         board.LoadFEN(test.fen);

//         U64 nodes = Perft::Run(board, depth);

//         bool ok = (nodes == test.expected);

//         if(ok)
//             passed++;

//         std::cout
//             << test.name
//             << " : ";

//         if(ok)
//             std::cout << "PASS";
//         else
//             std::cout << "FAIL";

//         std::cout
//             << "\nExpected : "
//             << test.expected
//             << "\nGot      : "
//             << nodes
//             << "\n\n";
//     }

//     std::cout
//         << "=========================\n";

//     std::cout
//         << "Passed "
//         << passed
//         << " / "
//         << 6
//         << '\n';

//     std::cout
//         << "=========================\n";

//     return 0;
// }

// 
// #include <iostream>

// #include "AttackTables.h"
// #include "Board.h"
// #include "Perft.h"
// #include "TranspositionTable.h"
// #include "Zobrist.h"

// int main()
// {
//     AttackTables::Initialize();
//     Zobrist::Initialize();
//     TT::Initialize();

//     Board board;

//     board.LoadFEN(
//         "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
//     );

//     U64 nodes = Perft::Run(board, 6);

//     std::cout << "\nNodes: " << nodes << '\n';

//     return 0;
// }