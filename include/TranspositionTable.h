#pragma once

#include "Board.h"
#include "Move.h"

namespace TT
{
    extern U64 probes;
    extern U64 hits;

    enum Flag
    {
        EXACT,
        ALPHA,
        BETA
    };

    struct Entry
    {
        U64 hash;

        int depth;

        int score;

        Flag flag;

        Move bestMove;
    };

    struct Bucket
    {
        Entry entries[4];
    };

    void Initialize();

    void Clear();

    bool Probe(
        U64 hash,
        int depth,
        int alpha,
        int beta,
        int& score);

    Move GetBestMove(U64 hash);

    void Store(
        U64 hash,
        int depth,
        int score,
        Flag flag,
        Move bestMove);
}