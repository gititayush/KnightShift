#pragma once

#include "Board.h"

namespace Evaluation
{

struct Score
{
    int mg = 0;
    int eg = 0;

    inline void Add(int mgScore,
                    int egScore)
    {
        mg += mgScore;
        eg += egScore;
    }

    inline void Sub(int mgScore,
                    int egScore)
    {
        mg -= mgScore;
        eg -= egScore;
    }
};

int Evaluate(const Board& board);

void EvaluateMaterial(
    const Board& board,
    Score& score,
    int& phase);

void EvaluatePawns(
    const Board& board,
    Score& score);

void EvaluatePieces(
    const Board& board,
    Score& score,
    int& phase);

void EvaluateRooks(
    const Board& board,
    Score& score);

void EvaluateQueens(
    const Board& board,
    Score& score);

void EvaluateKings(
    const Board& board,
    Score& score);

void EvaluateMobility(
    const Board& board,
    Score& score);

}