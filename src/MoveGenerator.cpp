#include <iostream>
#include "MoveGenerator.h"
#include "AttackDetector.h"
#include "AttackTables.h"
#include "Bitboard.h"

namespace MoveGenerator
{

void Generate(const Board& board, MoveList& list)
{
    list.Clear();

    if(board.side == WHITE)
    {
        GenerateWhitePawnMoves(board, list);
    }
    else
    {
        GenerateBlackPawnMoves(board, list);
    }

GenerateKnightMoves(board, list);
GenerateBishopMoves(board, list);
GenerateRookMoves(board, list);
GenerateQueenMoves(board, list);
GenerateKingMoves(board, list);
}

// void Generate(const Board& board, MoveList& list)
// {
//     list.Clear();

//     if(board.side == WHITE)
//     {
//         GenerateWhitePawnMoves(board, list);
//     }
//     else
//     {
//         GenerateBlackPawnMoves(board, list);
//     }

//     std::cout << "After pawns   : " << list.count << '\n';

//     GenerateKnightMoves(board, list);
//     std::cout << "After knights : " << list.count << '\n';

//     GenerateBishopMoves(board, list);
//     std::cout << "After bishops : " << list.count << '\n';

//     GenerateRookMoves(board, list);
//     std::cout << "After rooks   : " << list.count << '\n';

//     GenerateQueenMoves(board, list);
//     std::cout << "After queens  : " << list.count << '\n';

//     GenerateKingMoves(board, list);
//     std::cout << "After king    : " << list.count << '\n';
// }


void GenerateWhitePawnMoves(const Board& board, MoveList& list)
{
    U64 pawns = board.bitboards[WP];

    while(pawns)
    {
        int from = __builtin_ctzll(pawns);

        pawns &= pawns - 1;

        int to = from + 8;

if(to <= H8 &&
   !(board.occupancies[BOTH] & (1ULL << to)))
{
    // Promotion
    if(to >= A8)
    {
        list.Add(MoveEncoding::Encode((Square)from, (Square)to, WP, WQ));
        list.Add(MoveEncoding::Encode((Square)from, (Square)to, WP, WR));
        list.Add(MoveEncoding::Encode((Square)from, (Square)to, WP, WB));
        list.Add(MoveEncoding::Encode((Square)from, (Square)to, WP, WN));
    }
    else
    {
        list.Add(
            MoveEncoding::Encode(
                (Square)from,
                (Square)to,
                WP
            )
        );

        if(from >= A2 &&
           from <= H2)
        {
            int doublePush = from + 16;

            if(!(board.occupancies[BOTH] &
                 (1ULL << doublePush)))
            {
                list.Add(
                    MoveEncoding::Encode(
                        (Square)from,
                        (Square)doublePush,
                        WP,
                        NO_PIECE,
                        false,
                        true
                    )
                );
            }
        }
    }

        }

        U64 attacks =
            AttackTables::pawnAttacks[WHITE][from]
            &
            board.occupancies[BLACK];

      while(attacks)
{
    int target = __builtin_ctzll(attacks);

    attacks &= attacks - 1;

    // Promotion capture
    if(target >= A8)
    {
        list.Add(MoveEncoding::Encode((Square)from, (Square)target, WP, WQ, true));
        list.Add(MoveEncoding::Encode((Square)from, (Square)target, WP, WR, true));
        list.Add(MoveEncoding::Encode((Square)from, (Square)target, WP, WB, true));
        list.Add(MoveEncoding::Encode((Square)from, (Square)target, WP, WN, true));
    }
    else
    {
        list.Add(
            MoveEncoding::Encode(
                (Square)from,
                (Square)target,
                WP,
                NO_PIECE,
                true
            )
        );
    }
}

        // =======================
// En Passant
// =======================

if(board.enPassant != NO_SQUARE)
{
    U64 epAttack =
        AttackTables::pawnAttacks[WHITE][from] &
        (1ULL << board.enPassant);

    if(epAttack)
    {
        list.Add(
            MoveEncoding::Encode(
                (Square)from,
                board.enPassant,
                WP,
                NO_PIECE,
                true,   // capture
                false,  // double push
                true    // en passant
            )
        );
    }
}

    }
}

void GenerateBlackPawnMoves(const Board& board, MoveList& list)
{
    U64 pawns = board.bitboards[BP];

    while(pawns)
    {
        int from = __builtin_ctzll(pawns);

        pawns &= pawns - 1;

        int to = from - 8;

if(to >= A1 &&
   !(board.occupancies[BOTH] & (1ULL << to)))
{
    // Promotion
    if(to <= H1)
    {
        list.Add(
            MoveEncoding::Encode(
                (Square)from,
                (Square)to,
                BP,
                BQ
            )
        );

        list.Add(
            MoveEncoding::Encode(
                (Square)from,
                (Square)to,
                BP,
                BR
            )
        );

        list.Add(
            MoveEncoding::Encode(
                (Square)from,
                (Square)to,
                BP,
                BB
            )
        );

        list.Add(
            MoveEncoding::Encode(
                (Square)from,
                (Square)to,
                BP,
                BN
            )
        );
    }
    else
    {
        list.Add(
            MoveEncoding::Encode(
                (Square)from,
                (Square)to,
                BP
            )
        );

        if(from >= A7 &&
           from <= H7)
        {
            int doublePush = from - 16;

            if(!(board.occupancies[BOTH] &
                 (1ULL << doublePush)))
            {
                list.Add(
                    MoveEncoding::Encode(
                        (Square)from,
                        (Square)doublePush,
                        BP,
                        NO_PIECE,
                        false,
                        true
                    )
                );
            }
        }
    }
}

        U64 attacks =
            AttackTables::pawnAttacks[BLACK][from]
            &
            board.occupancies[WHITE];

        while(attacks)
{
    int target = __builtin_ctzll(attacks);

    attacks &= attacks - 1;

    // Promotion capture
    if(target <= H1)
    {
        list.Add(
            MoveEncoding::Encode(
                (Square)from,
                (Square)target,
                BP,
                BQ,
                true
            )
        );

        list.Add(
            MoveEncoding::Encode(
                (Square)from,
                (Square)target,
                BP,
                BR,
                true
            )
        );

        list.Add(
            MoveEncoding::Encode(
                (Square)from,
                (Square)target,
                BP,
                BB,
                true
            )
        );

        list.Add(
            MoveEncoding::Encode(
                (Square)from,
                (Square)target,
                BP,
                BN,
                true
            )
        );
    }
    else
    {
        list.Add(
            MoveEncoding::Encode(
                (Square)from,
                (Square)target,
                BP,
                NO_PIECE,
                true
            )
        );
    }
}

        // =======================
// En Passant
// =======================

if(board.enPassant != NO_SQUARE)
{
    U64 epAttack =
        AttackTables::pawnAttacks[BLACK][from] &
        (1ULL << board.enPassant);

    if(epAttack)
    {
        list.Add(
            MoveEncoding::Encode(
                (Square)from,
                board.enPassant,
                BP,
                NO_PIECE,
                true,
                false,
                true
            )
        );
    }
}

    }
}

void GenerateKnightMoves(const Board& board, MoveList& list)
{
    U64 knights =
        board.side == WHITE ?
        board.bitboards[WN] :
        board.bitboards[BN];

    U64 friendly =
        board.side == WHITE ?
        board.occupancies[WHITE] :
        board.occupancies[BLACK];

    while(knights)
    {
        int from = __builtin_ctzll(knights);

        knights &= knights - 1;

        U64 attacks =
            AttackTables::knightAttacks[from]
            &
            ~friendly;

        while(attacks)
        {
            int to = __builtin_ctzll(attacks);

            attacks &= attacks - 1;

            bool capture =
                board.occupancies[
                    board.side == WHITE ?
                    BLACK :
                    WHITE
                ] &
                (1ULL << to);

            list.Add(
                MoveEncoding::Encode(
                    (Square)from,
                    (Square)to,
                    board.side == WHITE ? WN : BN,
                    NO_PIECE,
                    capture
                )
            );
        }
    }
}

void GenerateBishopMoves(const Board& board, MoveList& list)
{
    U64 bishops =
        board.side == WHITE ?
        board.bitboards[WB] :
        board.bitboards[BB];

    U64 friendly =
        board.side == WHITE ?
        board.occupancies[WHITE] :
        board.occupancies[BLACK];

    U64 enemy =
        board.side == WHITE ?
        board.occupancies[BLACK] :
        board.occupancies[WHITE];

    while(bishops)
    {
        int from = __builtin_ctzll(bishops);
        bishops &= bishops - 1;

        int startRank = from / 8;
        int startFile = from % 8;

        const int dr[4] = {1, 1, -1, -1};
        const int df[4] = {1, -1, 1, -1};

        for(int dir = 0; dir < 4; dir++)
        {
            int r = startRank + dr[dir];
            int f = startFile + df[dir];

            while(r >= 0 && r < 8 &&
                  f >= 0 && f < 8)
            {
                int to = r * 8 + f;

                U64 square = 1ULL << to;

                if(friendly & square)
                    break;

                bool capture = enemy & square;

                list.Add(
                    MoveEncoding::Encode(
                        (Square)from,
                        (Square)to,
                        board.side == WHITE ? WB : BB,
                        NO_PIECE,
                        capture
                    )
                );

                if(capture)
                    break;

                r += dr[dir];
                f += df[dir];
            }
        }
    }
}

void GenerateRookMoves(const Board& board, MoveList& list)
{
    U64 rooks =
        board.side == WHITE ?
        board.bitboards[WR] :
        board.bitboards[BR];

    U64 friendly =
        board.side == WHITE ?
        board.occupancies[WHITE] :
        board.occupancies[BLACK];


    U64 enemy =
        board.side == WHITE ?
        board.occupancies[BLACK] :
        board.occupancies[WHITE];

    while(rooks)
    {
        int from = __builtin_ctzll(rooks);
        rooks &= rooks - 1;

        int startRank = from / 8;
        int startFile = from % 8;

        const int dr[4] = {1, -1, 0, 0};
        const int df[4] = {0, 0, 1, -1};

        for(int dir = 0; dir < 4; dir++)
        {
            int r = startRank + dr[dir];
            int f = startFile + df[dir];

            while(r >= 0 && r < 8 &&
                  f >= 0 && f < 8)
            {
                int to = r * 8 + f;

                U64 square = 1ULL << to;
                if(friendly & square)
{
    break;
}

                bool capture = enemy & square;

                list.Add(
                    MoveEncoding::Encode(
                        (Square)from,
                        (Square)to,
                        board.side == WHITE ? WR : BR,
                        NO_PIECE,
                        capture
                    )
                );

                if(capture)
                    break;

                r += dr[dir];
                f += df[dir];
            }
        }
    }
}
void GenerateQueenMoves(const Board& board, MoveList& list)
{
    U64 queens =
        board.side == WHITE ?
        board.bitboards[WQ] :
        board.bitboards[BQ];

    U64 friendly =
        board.side == WHITE ?
        board.occupancies[WHITE] :
        board.occupancies[BLACK];

    U64 enemy =
        board.side == WHITE ?
        board.occupancies[BLACK] :
        board.occupancies[WHITE];

    const int dr[8] = {1, 1, -1, -1, 1, -1, 0, 0};
    const int df[8] = {1, -1, 1, -1, 0, 0, 1, -1};

    while(queens)
    {
        int from = __builtin_ctzll(queens);
        queens &= queens - 1;

        int startRank = from / 8;
        int startFile = from % 8;

        for(int dir = 0; dir < 8; dir++)
        {
            int r = startRank + dr[dir];
            int f = startFile + df[dir];

            while(r >= 0 && r < 8 &&
                  f >= 0 && f < 8)
            {
                int to = r * 8 + f;

                U64 square = 1ULL << to;

                if(friendly & square)
                    break;

                bool capture = (enemy & square);

                list.Add(
                    MoveEncoding::Encode(
                        (Square)from,
                        (Square)to,
                        board.side == WHITE ? WQ : BQ,
                        NO_PIECE,
                        capture
                    )
                );

                if(capture)
                    break;

                r += dr[dir];
                f += df[dir];
            }
        }
    }
}

void GenerateKingMoves(const Board& board, MoveList& list)
{
    U64 kings =
        board.side == WHITE ?
        board.bitboards[WK] :
        board.bitboards[BK];

    U64 friendly =
        board.side == WHITE ?
        board.occupancies[WHITE] :
        board.occupancies[BLACK];

    U64 enemy =
        board.side == WHITE ?
        board.occupancies[BLACK] :
        board.occupancies[WHITE];

    while(kings)
    {
        int from = __builtin_ctzll(kings);
        kings &= kings - 1;

        U64 attacks =
            AttackTables::kingAttacks[from] &
            ~friendly;

        while(attacks)
        {
            int to = __builtin_ctzll(attacks);

            attacks &= attacks - 1;

            bool capture =
                (enemy & (1ULL << to));

            list.Add(
                MoveEncoding::Encode(
                    (Square)from,
                    (Square)to,
                    board.side == WHITE ? WK : BK,
                    NO_PIECE,
                    capture
                )
            );
        }
    }
    // =======================
// Castling
// =======================

if(board.side == WHITE)
{
    // Kingside
    if(board.castling & WK_CASTLE)
    {
        if(!(board.occupancies[BOTH] & (1ULL << F1)) &&
           !(board.occupancies[BOTH] & (1ULL << G1)))
        {
            if(!AttackDetector::IsSquareAttacked(board, E1, BLACK) &&
               !AttackDetector::IsSquareAttacked(board, F1, BLACK) &&
               !AttackDetector::IsSquareAttacked(board, G1, BLACK))
            {
                list.Add(
                    MoveEncoding::Encode(
                        E1,
                        G1,
                        WK,
                        NO_PIECE,
                        false,
                        false,
                        false,
                        true
                    )
                );
            }
        }
    }

    // Queenside
    if(board.castling & WQ_CASTLE)
    {
        if(!(board.occupancies[BOTH] & (1ULL << B1)) &&
           !(board.occupancies[BOTH] & (1ULL << C1)) &&
           !(board.occupancies[BOTH] & (1ULL << D1)))
        {
            if(!AttackDetector::IsSquareAttacked(board, E1, BLACK) &&
               !AttackDetector::IsSquareAttacked(board, D1, BLACK) &&
               !AttackDetector::IsSquareAttacked(board, C1, BLACK))
            {
                list.Add(
                    MoveEncoding::Encode(
                        E1,
                        C1,
                        WK,
                        NO_PIECE,
                        false,
                        false,
                        false,
                        true
                    )
                );
            }
        }
    }
}
else
{
    // Kingside
    if(board.castling & BK_CASTLE)
    {
        if(!(board.occupancies[BOTH] & (1ULL << F8)) &&
           !(board.occupancies[BOTH] & (1ULL << G8)))
        {
            if(!AttackDetector::IsSquareAttacked(board, E8, WHITE) &&
               !AttackDetector::IsSquareAttacked(board, F8, WHITE) &&
               !AttackDetector::IsSquareAttacked(board, G8, WHITE))
            {
                list.Add(
                    MoveEncoding::Encode(
                        E8,
                        G8,
                        BK,
                        NO_PIECE,
                        false,
                        false,
                        false,
                        true
                    )
                );
            }
        }
    }

    // Queenside
    if(board.castling & BQ_CASTLE)
    {
        if(!(board.occupancies[BOTH] & (1ULL << B8)) &&
           !(board.occupancies[BOTH] & (1ULL << C8)) &&
           !(board.occupancies[BOTH] & (1ULL << D8)))
        {
            if(!AttackDetector::IsSquareAttacked(board, E8, WHITE) &&
               !AttackDetector::IsSquareAttacked(board, D8, WHITE) &&
               !AttackDetector::IsSquareAttacked(board, C8, WHITE))
            {
                list.Add(
                    MoveEncoding::Encode(
                        E8,
                        C8,
                        BK,
                        NO_PIECE,
                        false,
                        false,
                        false,
                        true
                    )
                );
            }
        }
    }
}
}

bool IsMoveLegal(const Board& board, Move move)
{
    Board temp = board;

    UndoInfo undo;

    temp.MakeMove(move, undo);

    Side mover =
        (temp.side == WHITE)
        ? BLACK
        : WHITE;

    Square king =
        temp.FindKing(mover);

    bool inCheck =
        AttackDetector::IsSquareAttacked(
            temp,
            king,
            temp.side
        );

    temp.UndoMove(move, undo);

    return !inCheck;
}
}