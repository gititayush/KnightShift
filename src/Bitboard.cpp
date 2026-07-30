#include "Bitboard.h"
#include <bit>
#include <iostream>

namespace Bitboard
{

void Print(U64 board)
{
    std::cout << '\n';

    for (int rank = 7; rank >= 0; rank--)
    {
        std::cout << rank + 1 << "  ";

        for (int file = 0; file < 8; file++)
        {
            int square = rank * 8 + file;

            if (board & (1ULL << square))
                std::cout << "1 ";
            else
                std::cout << ". ";
        }

        std::cout << '\n';
    }

    std::cout << "\n   A B C D E F G H\n\n";
}

int CountBits(U64 board)
{
    return std::popcount(board);
}

int LSBIndex(U64 board)
{
    return std::countr_zero(board);
}

}