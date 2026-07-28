#pragma once

#include <cstdint>

namespace SearchStats
{
    extern uint64_t nodes;

    extern uint64_t ttProbes;
    extern uint64_t ttHits;

    extern uint64_t betaCutoffs;

    extern uint64_t pvsResearches;

    extern uint64_t lmrReduced;

    extern uint64_t lmrResearches;

    extern uint64_t aspirationFailHigh;

    extern uint64_t aspirationFailLow;

    extern uint64_t killerUpdates;

    extern uint64_t historyUpdates;

    void Reset();

    void Print();
}