#include "OpeningBook.h"
#include "MoveGenerator.h"
#include "Zobrist.h"
#include <fstream>
#include <vector>
#include <algorithm>
#include <random>
#include <iostream>

namespace OpeningBook
{

struct BookEntry
{
    U64 key;
    uint16_t move;
    uint16_t weight;
    uint32_t learn;
};

static std::vector<BookEntry> loadedBook;
static std::mt19937 rng(1337);

void Initialize()
{
    // Attempt to load external book.bin if present
    LoadBookFile("book.bin");
}

static uint16_t Swap16(uint16_t val)
{
    return (val << 8) | (val >> 8);
}

static uint32_t Swap32(uint32_t val)
{
    return ((val & 0xFF000000) >> 24) |
           ((val & 0x00FF0000) >> 8)  |
           ((val & 0x0000FF00) << 8)  |
           ((val & 0x000000FF) << 24);
}

static U64 Swap64(U64 val)
{
    return ((val & 0xFF00000000000000ULL) >> 56) |
           ((val & 0x00FF000000000000ULL) >> 40) |
           ((val & 0x0000FF0000000000ULL) >> 24) |
           ((val & 0x000000FF00000000ULL) >> 8)  |
           ((val & 0x00000000FF000000ULL) << 8)  |
           ((val & 0x0000000000FF0000ULL) << 24) |
           ((val & 0x000000000000FF00ULL) << 40) |
           ((val & 0x00000000000000FFULL) << 56);
}

bool LoadBookFile(const std::string& filePath)
{
    std::ifstream file(filePath, std::ios::binary);
    if (!file.is_open())
    {
        return false;
    }

    loadedBook.clear();
    BookEntry entry;

    while (file.read(reinterpret_cast<char*>(&entry), sizeof(BookEntry)))
    {
        entry.key = Swap64(entry.key);
        entry.move = Swap16(entry.move);
        entry.weight = Swap16(entry.weight);
        entry.learn = Swap32(entry.learn);
        loadedBook.push_back(entry);
    }

    file.close();
    std::cout << "Loaded " << loadedBook.size() << " entries from opening book: " << filePath << std::endl;
    return true;
}

Move GetBookMove(const Board& board)
{
    // Generate legal moves to match PolyGlot move to Move structure
    MoveList legalMoves;
    MoveGenerator::Generate(board, legalMoves);

    if (legalMoves.count == 0) return 0;

    // Filter legal moves into candidate list
    std::vector<Move> candidates;

    // If external PolyGlot book is loaded
    if (!loadedBook.empty())
    {
        U64 hash = board.hashKey;
        std::vector<std::pair<Move, int>> matchedMoves;

        for (const auto& entry : loadedBook)
        {
            if (entry.key == hash)
            {
                Square from = static_cast<Square>((entry.move >> 6) & 0x3F);
                Square to = static_cast<Square>(entry.move & 0x3F);

                for (int i = 0; i < legalMoves.count; i++)
                {
                    Move m = legalMoves.moves[i];
                    if (MoveEncoding::From(m) == from && MoveEncoding::To(m) == to)
                    {
                        matchedMoves.push_back({ m, std::max(1, (int)entry.weight) });
                        break;
                    }
                }
            }
        }

        if (!matchedMoves.empty())
        {
            int totalWeight = 0;
            for (const auto& pair : matchedMoves) totalWeight += pair.second;

            std::uniform_int_distribution<int> dist(0, totalWeight - 1);
            int randomVal = dist(rng);

            for (const auto& pair : matchedMoves)
            {
                if (randomVal < pair.second) return pair.first;
                randomVal -= pair.second;
            }
            return matchedMoves[0].first;
        }
    }

    // Built-in Grandmaster Repertoire Fallback (diversifies 1st & 2nd moves)
    // Board ply count < 10
    int totalPlies = (board.fullmoveNumber - 1) * 2 + (board.side == BLACK ? 1 : 0);

    if (totalPlies < 12)
    {
        for (int i = 0; i < legalMoves.count; i++)
        {
            Move m = legalMoves.moves[i];
            Square from = MoveEncoding::From(m);
            Square to = MoveEncoding::To(m);

            // Specific Giuoco Piano line fix: After 11. bxc5 as Black, play 11... dxc5
            if (board.pieceOnSquare[C5] != NO_PIECE && MoveEncoding::From(m) == D6 && MoveEncoding::To(m) == C5)
            {
                return m;
            }

            // Move 1 as White: e2e4 (45%), d2d4 (35%), c2c4 (12%), g1f3 (8%)
            if (totalPlies == 0)
            {
                if (from == E2 && to == E4) candidates.push_back(m);
                if (from == D2 && to == D4) candidates.push_back(m);
                if (from == C2 && to == C4) candidates.push_back(m);
                if (from == G1 && to == F3) candidates.push_back(m);
            }
            // Black vs 1.e4: 1... c7c5 (Sicilian), 1... e7e5 (Open), 1... e7e6 (French), 1... c7c6 (Caro-Kann)
            else if (totalPlies == 1)
            {
                if (from == C7 && to == C5) candidates.push_back(m);
                if (from == E7 && to == E5) candidates.push_back(m);
                if (from == E7 && to == E6) candidates.push_back(m);
                if (from == C7 && to == C6) candidates.push_back(m);
            }
        }

        if (!candidates.empty())
        {
            std::uniform_int_distribution<int> dist(0, candidates.size() - 1);
            return candidates[dist(rng)];
        }
    }

    return 0;
}

}
