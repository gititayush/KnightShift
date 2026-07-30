cmake_minimum_required(VERSION 3.20)

project(KnightShift)

set(CMAKE_CXX_STANDARD 20)

add_executable(
    KnightShift
    src/main.cpp
    src/Bitboard.cpp
    src/AttackTables.cpp
    src/Board.cpp
    src/Move.cpp
    src/FEN.cpp
    src/Search.cpp
    # src/Evaluation.cpp
    src/UCI.cpp
    src/MoveList.cpp
    src/MoveGenerator.cpp
    src/AttackDetector.cpp
    src/Perft.cpp
    src/TestPositions.cpp
    src/MoveOrdering.cpp
    src/Zobrist.cpp
    src/TranspositionTable.cpp
    src/PieceSquareTables.cpp
    src/SearchStats.cpp
    src/SEE.cpp
    src/Evaluation2.cpp
)

target_include_directories(
    KnightShift
    PRIVATE
    include
)