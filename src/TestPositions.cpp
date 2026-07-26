#include "TestPositions.h"
#include "TranspositionTable.h"
#include <fstream>
#include <iostream>
#include <string>
#include <sstream>
#include "Board.h"
#include "Move.h"
#include "Search.h"

static bool ParseEPDLine(const std::string& line, TacticalPosition& pos)
{
    size_t bmPos = line.find(" bm ");
    if (bmPos == std::string::npos)
        return false;

    pos.fen = line.substr(0, bmPos);

    size_t moveStart = bmPos + 4;
    size_t moveEnd = line.find(';', moveStart);

    pos.bestMove = line.substr(moveStart, moveEnd - moveStart);

    size_t idPos = line.find("id", moveEnd);

    if (idPos != std::string::npos)
    {
        size_t firstQuote = line.find('"', idPos);
        size_t secondQuote = line.find('"', firstQuote + 1);

        pos.id =
            line.substr(
                firstQuote + 1,
                secondQuote - firstQuote - 1);
    }
    else
    {
        pos.id = "Unknown";
    }

    return true;
}

void RunTACTests(int depth)
{
    std::ifstream file("Tests/wacnew.epd");

    if(!file)
    {
        std::cout
            << "Couldn't open Tests/wacnew.epd\n";
        return;
    }

    std::string line;

    int total = 0;
    int passed = 0;

    while(std::getline(file, line))
    {
        TacticalPosition test;

        if(!ParseEPDLine(line, test))
            continue;

        total++;

        Board board;

        board.LoadFEN(test.fen);

        Move best =
            Search::FindBestMove(board, depth);

        std::string engineMove =
            MoveEncoding::ToString(best);

  bool ok = false;

std::stringstream ss(test.bestMove);

std::string move;

while (ss >> move)
{
    if (engineMove == move)
    {
        ok = true;
        break;
    }
}

        if(ok)
            passed++;

        std::cout
            << test.id
            << " : ";

        if(ok)
            std::cout << "PASS";
        else
            std::cout << "FAIL";

        std::cout
            << "   Expected: "
            << test.bestMove
            << "   Engine: "
            << engineMove
            << '\n';
    }

    std::cout
        << "\n==============================\n";

    std::cout
        << "Solved "
        << passed
        << " / "
        << total
        << '\n';

    std::cout
        << "==============================\n";

        std::cout
    << "TT Probes : "
    << TT::probes
    << '\n';

std::cout
    << "TT Hits   : "
    << TT::hits
    << '\n';
}