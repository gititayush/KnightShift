#include "TranspositionTable.h"
#include "SearchStats.h"

constexpr int TABLE_SIZE = 1 << 20;

TT::Entry table[TABLE_SIZE];

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
        table[i].hash = 0;
        table[i].depth = -1;
        table[i].score = 0;
        table[i].flag = EXACT;
        table[i].bestMove = 0;
    }
}

bool TT::Probe(
    U64 hash,
    int depth,
    int alpha,
    int beta,
    int& score)
{
    SearchStats::ttProbes++;
    probes++;
    Entry& entry =
        table[hash % TABLE_SIZE];

    if(entry.hash != hash)
        return false;

    if(entry.depth < depth)
        return false;

    switch(entry.flag)
{
    case EXACT:
        SearchStats::ttHits++;
        score = entry.score;
            hits++;
        return true;

    case ALPHA:
        if(entry.score <= alpha)
        {
            SearchStats::ttHits++;
            score = entry.score;
                hits++;
            return true;
        }
        break;

    case BETA:
        if(entry.score >= beta)
        {
            SearchStats::ttHits++;
            score = entry.score;
                hits++;
            return true;
        }
        break;
}

    return false;
}

void TT::Store(
    U64 hash,
    int depth,
    int score,
    Flag flag,
    Move bestMove)
{
    Entry& entry =
        table[hash % TABLE_SIZE];

    // Keep deeper entries
    if(entry.hash == hash &&
       entry.depth > depth)
    {
        return;
    }

    entry.hash = hash;
    entry.depth = depth;
    entry.score = score;
    entry.flag = flag;
    entry.bestMove = bestMove;
}

Move TT::GetBestMove(U64 hash)
{
    Entry& entry =
        table[hash % TABLE_SIZE];

    if(entry.hash != hash)
        return 0;

    return entry.bestMove;
}
