#include "TranspositionTable.h"
#include "SearchStats.h"

constexpr int TABLE_SIZE = 1 << 18;
constexpr int TABLE_MASK = TABLE_SIZE - 1;

TT::Bucket table[TABLE_SIZE];

U64 TT::probes = 0;
U64 TT::hits = 0;

void TT::Initialize()
{
    Clear();
}

void TT::Clear()
{
    probes = 0;
    hits = 0;

    for(int i = 0; i < TABLE_SIZE; i++)
    {
        for(int j = 0; j < 4; j++)
        {
            table[i].entries[j].hash = 0;
            table[i].entries[j].depth = -1;
            table[i].entries[j].score = 0;
            table[i].entries[j].flag = EXACT;
            table[i].entries[j].bestMove = 0;
        }
    }
}

bool TT::Probe(
    U64 hash,
    int depth,
    int alpha,
    int beta,
    int& score,
    int ply)
{
    SearchStats::ttProbes++;
    probes++;

    Bucket& bucket =
        table[hash & TABLE_MASK];

    for(int i = 0; i < 4; i++)
    {
        Entry& entry = bucket.entries[i];

        if(entry.hash != hash)
            continue;

        if(entry.depth < depth)
            continue;

        score = entry.score;

        if(score > 29000)
            score -= ply;
        else if(score < -29000)
            score += ply;

        switch(entry.flag)
        {
        case EXACT:
            SearchStats::ttHits++;
            hits++;
            return true;

        case ALPHA:
            if(score <= alpha)
            {
                SearchStats::ttHits++;
                hits++;
                return true;
            }
            break;

        case BETA:
            if(score >= beta)
            {
                SearchStats::ttHits++;
                hits++;
                return true;
            }
            break;
        }
    }

    return false;
}

void TT::Store(
    U64 hash,
    int depth,
    int score,
    Flag flag,
    Move bestMove,
    int ply)
{
    Bucket& bucket =
        table[hash & TABLE_MASK];

    Entry* replace = &bucket.entries[0];

    // Same hash? overwrite it.
    for(int i = 0; i < 4; i++)
    {
        Entry& entry = bucket.entries[i];

        if(entry.hash == hash)
        {
            replace = &entry;
            break;
        }
    }

    // Empty slot?
    if(replace->hash != hash)
    {
        for(int i = 0; i < 4; i++)
        {
            Entry& entry = bucket.entries[i];

            if(entry.hash == 0)
            {
                replace = &entry;
                break;
            }
        }
    }

    // Otherwise replace the shallowest entry.
    if(replace->hash != hash && replace->hash != 0)
    {
        for(int i = 1; i < 4; i++)
        {
            if(bucket.entries[i].depth < replace->depth)
                replace = &bucket.entries[i];
        }
    }

    replace->hash = hash;
    replace->depth = depth;

    if(score > 29000)
        replace->score = score + ply;
    else if(score < -29000)
        replace->score = score - ply;
    else
        replace->score = score;

    replace->flag = flag;
    replace->bestMove = bestMove;
}

Move TT::GetBestMove(U64 hash)
{
    Bucket& bucket =
        table[hash & TABLE_MASK];

    for(int i = 0; i < 4; i++)
    {
        if(bucket.entries[i].hash == hash)
            return bucket.entries[i].bestMove;
    }

    return 0;
}