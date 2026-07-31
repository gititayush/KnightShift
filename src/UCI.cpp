#include "UCI.h"
#include "Board.h"
#include <iostream>
#include <sstream>
#include <string>
#include "Search.h"
#include <cstring>
#include "TranspositionTable.h"
#include "Evaluation.h"
#include "Perft.h"
namespace UCI
{

Board board;
    
void Loop()
{
    std::string command;

   board.LoadFEN(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");


    while(std::getline(std::cin, command))
    {
        std::stringstream ss(command);

        std::string token;
        ss >> token;

        if(token == "uci")
        {
            std::cout << "id name KnightShift\n";
            std::cout << "id author ayu shhhh\n";
            std::cout << "uciok\n";
        }

        else if(token == "isready")
        {
            std::cout << "readyok\n";
        }

        else if(token == "ucinewgame")
{
    board.LoadFEN(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    TT::Clear();

    std::memset(
        Search::historyTable,
        0,
        sizeof(Search::historyTable));

    std::memset(
        Search::continuationHistory,
        0,
        sizeof(Search::continuationHistory));

    std::memset(
        Search::killerMoves,
        0,
        sizeof(Search::killerMoves));
}

        else if(token == "position")
        {
            std::string type;
            ss >> type;

            if(type == "startpos")
            {
                board.LoadFEN(
                    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
            }
            else if(type == "fen")
            {
                std::string fen;
                std::string part;

                for(int i = 0; i < 6; i++)
                {
                    ss >> part;

                    if(i)
                        fen += " ";

                    fen += part;
                }

                board.LoadFEN(fen);
            }

            std::string word;

            if(ss >> word)
            {
                if(word == "moves")
                {
                    std::string moveText;

                    while(ss >> moveText)
                    {
                        Move move = board.ParseMove(moveText);

                        if(move)
                        {
                            UndoInfo undo;
                            board.MakeMove(move, undo);
                        }
                    }
                }
            }
        }


        else if(token == "eval")
            {
                std::cout
                    << Evaluation::Evaluate(board)
                    << '\n';
            }


            else if(token == "perft")
            {
                int depth;
                ss >> depth;

                Perft::Run(board, depth);
            }

                    else if(token == "d")
        {
            board.Print();
        }


        else if(token == "stop")
            {
                Search::stopSearch = true;
            }


            else if(token == "go")
{
    int depth = 6;

    Search::useTimeControl = false;

    std::string word;

    while(ss >> word)
    {
        if(word == "depth")
        {
            ss >> depth;
        }

        else if(word == "movetime")
        {
            ss >> Search::searchTime;
            Search::useTimeControl = true;
        }

        else if(word == "wtime")
        {
            int time;
            ss >> time;

            if(board.side == WHITE)
            {
                Search::searchTime = time / 30;
                Search::useTimeControl = true;
            }
        }

        else if(word == "btime")
        {
            int time;
            ss >> time;

            if(board.side == BLACK)
            {
                Search::searchTime = time / 30;
                Search::useTimeControl = true;
            }
        }
    }

    Search::stopSearch = false;

    Move bestMove =
        Search::FindBestMove(
            board,
            depth);

    std::cout
        << "bestmove "
        << MoveEncoding::ToString(bestMove)
        << std::endl;
}

        else if(token == "quit")
        {
            break;
        }
    }
}

}