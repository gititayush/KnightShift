#pragma once

#include "Board.h"
#include "MoveList.h"

namespace MoveGenerator
{
    void Generate(const Board& board,MoveList& list);

    void GenerateWhitePawnMoves(
    const Board& board,
    MoveList& list);

void GenerateBlackPawnMoves(
    const Board& board,
    MoveList& list);

void GenerateKnightMoves(
    const Board& board,
    MoveList& list);

void GenerateBishopMoves(
    const Board& board,
    MoveList& list);

void GenerateRookMoves(
    const Board& board,
    MoveList& list);

void GenerateQueenMoves(
    const Board& board,
    MoveList& list);

void GenerateKingMoves(
    const Board& board,
    MoveList& list);

bool IsMoveLegal(
    const Board& board,
    Move move);

}