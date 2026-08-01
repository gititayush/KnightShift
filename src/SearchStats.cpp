#include "SearchStats.h"

#include <iostream>

namespace SearchStats
{

uint64_t nodes = 0;

uint64_t ttProbes = 0;
uint64_t ttHits = 0;

uint64_t betaCutoffs = 0;

uint64_t pvsResearches = 0;

uint64_t lmrReduced = 0;

uint64_t lmrResearches = 0;

uint64_t iidSearches = 0;

uint64_t aspirationFailHigh = 0;

uint64_t aspirationFailLow = 0;

uint64_t killerUpdates = 0;

uint64_t historyUpdates = 0;

void Reset()
{
    nodes = 0;

    ttProbes = 0;
    ttHits = 0;

    betaCutoffs = 0;

    pvsResearches = 0;

    lmrReduced = 0;

    lmrResearches = 0;

    iidSearches = 0;

    aspirationFailHigh = 0;

    aspirationFailLow = 0;

    killerUpdates = 0;

    historyUpdates = 0;
}

void Print()
{
    std::cout << "\n========== SEARCH STATS ==========\n";

    std::cout << "Nodes               : " << nodes << '\n';

    std::cout << "TT Probes           : " << ttProbes << '\n';

    std::cout << "TT Hits             : " << ttHits << '\n';

    if(ttProbes)
    {
        std::cout
            << "TT Hit Rate         : "
            << (100.0 * ttHits / ttProbes)
            << "%\n";
    }

    std::cout << "Beta Cutoffs        : " << betaCutoffs << '\n';

    if(nodes)
    {
        std::cout
            << "Cutoff Rate         : "
            << (100.0 * betaCutoffs / nodes)
            << "%\n";
    }

    std::cout << "PVS Re-searches     : " << pvsResearches << '\n';

    std::cout << "LMR Reduced         : " << lmrReduced << '\n';

    std::cout << "LMR Re-searches     : " << lmrResearches << '\n';

    if(lmrReduced)
    {
        std::cout
            << "LMR Re-search Rate  : "
            << (100.0 * lmrResearches / lmrReduced)
            << "%\n";
    }

    std::cout << "IID Searches        : " << iidSearches << '\n';

    std::cout << "Aspiration High     : " << aspirationFailHigh << '\n';

    std::cout << "Aspiration Low      : " << aspirationFailLow << '\n';

    std::cout << "History Updates     : " << historyUpdates << '\n';

    std::cout << "Killer Updates      : " << killerUpdates << '\n';

    std::cout << "==================================\n";
}

}