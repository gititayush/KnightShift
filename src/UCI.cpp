#include "UCI.h"
#include "Board.h"
#include <iostream>
#include <sstream>
#include <string>
#include "Search.h"
#include <cstring>
#include "TranspositionTable.h"
#include "Evaluation2.h"
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
                    << Evaluation2::Evaluate(board)
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
    int depth = 64;

    Search::useTimeControl = false;
    Search::searchTime = 0;

    int wtime = -1;
    int btime = -1;
    int winc = 0;
    int binc = 0;
    int movetime = -1;
    int movestogo = 30;

    std::string word;

    while(ss >> word)
    {
        if(word == "depth")
        {
            ss >> depth;
        }
        else if(word == "movetime")
        {
            ss >> movetime;
        }
        else if(word == "wtime")
        {
            ss >> wtime;
        }
        else if(word == "btime")
        {
            ss >> btime;
        }
        else if(word == "winc")
        {
            ss >> winc;
        }
        else if(word == "binc")
        {
            ss >> binc;
        }
        else if(word == "movestogo")
        {
            ss >> movestogo;

            if(movestogo <= 0)
                movestogo = 30;
        }
    }

    if(movetime != -1)
    {
        Search::searchTime = movetime;
        Search::useTimeControl = true;
    }
    else
    {
        int remaining =
            (board.side == WHITE) ? wtime : btime;

        int increment =
            (board.side == WHITE) ? winc : binc;

        if(remaining > 0)
        {
            Search::searchTime =
                remaining / movestogo
                + increment / 2;

            if(Search::searchTime < 20)
                Search::searchTime = 20;

            if(Search::searchTime > remaining / 2)
                Search::searchTime = remaining / 2;

            Search::useTimeControl = true;
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