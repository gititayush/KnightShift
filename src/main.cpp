#include <iostream>
#include <vector>
#include <string>

#include "AttackTables.h"
#include "Board.h"
#include "Perft.h"

struct PerftTest
{
    std::string name;
    std::string fen;
    std::vector<U64> expected;
};

int main()
{
    AttackTables::Initialize();

    std::vector<PerftTest> tests =
    {
        {
            "Kiwipete",
            "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - ",
            {48ULL, 2039ULL, 97862ULL, 4085603ULL}
        },

        {
            "Position 6",
            "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8 ",
            {46ULL, 2079ULL, 89890ULL, 3894594ULL}
        }
    };

    for (const auto& test : tests)
    {
        Board board;
        board.LoadFEN(test.fen);

        std::cout << "\n=========================================\n";
        std::cout << test.name << '\n';
        std::cout << "=========================================\n";

        bool passed = true;

        for (int depth = 1; depth <= 4; depth++)
        {
            U64 nodes = Perft::Run(board, depth);

            std::cout << "Depth "
                      << depth
                      << " : "
                      << nodes;

            if (nodes == test.expected[depth - 1])
            {
                std::cout << "   PASS";
            }
            else
            {
                passed = false;

                std::cout << "   FAIL (Expected "
                          << test.expected[depth - 1]
                          << ")";
            }

            std::cout << '\n';
        }

        std::cout << "\nResult : "
                  << (passed ? "PASS" : "FAIL")
                  << "\n";
    }

    return 0;
}