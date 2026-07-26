#pragma once

#include <string>

struct TacticalPosition
{
    std::string id;
    std::string fen;
    std::string bestMove;
};

void RunTACTests(int depth);