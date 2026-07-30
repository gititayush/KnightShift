#include "Evaluation.h"

#include "AttackTables.h"
#include "Bitboard.h"
#include "PieceSquareTables.h"

namespace Evaluation
{

constexpr int MGValue[6] =
{
    82,
    337,
    365,
    477,
    1025,
    0
};

constexpr int EGValue[6] =
{
    94,
    281,
    297,
    512,
    936,
    0
};

constexpr int PhaseValue[6] =
{
    0,
    1,
    1,
    2,
    4,
    0
};

constexpr int BISHOP_PAIR_MG = 35;
constexpr int BISHOP_PAIR_EG = 55;

constexpr int KNIGHT_OUTPOST_MG = 18;
constexpr int KNIGHT_OUTPOST_EG = 10;

constexpr int BISHOP_OUTPOST_MG = 10;
constexpr int BISHOP_OUTPOST_EG = 6;

constexpr int PAWN_SHIELD_BONUS = 18;

constexpr int OPEN_FILE_KING_PENALTY = 25;

constexpr int SEMI_OPEN_FILE_KING_PENALTY = 12;

constexpr int KNIGHT_ATTACK_UNIT = 2;
constexpr int BISHOP_ATTACK_UNIT = 2;
constexpr int ROOK_ATTACK_UNIT = 3;
constexpr int QUEEN_ATTACK_UNIT = 5;

constexpr int KingAttackTable[32] =
{
     0,  0,  2,  5,
     9, 14, 20, 27,
    35, 44, 54, 65,
    77, 90,104,119,
   135,152,170,189,
   209,230,252,275,
   299,324,350,377,
   405,434,464,495
};
constexpr int KING_CENTER_EG = 8;

constexpr int BLOCKED_PASSER_MG = 20;
constexpr int BLOCKED_PASSER_EG = 35;

constexpr int ROOK_OPEN_FILE_MG = 28;
constexpr int ROOK_OPEN_FILE_EG = 18;

constexpr int ROOK_SEMIOPEN_FILE_MG = 16;
constexpr int ROOK_SEMIOPEN_FILE_EG = 10;

constexpr int ROOK_SEVENTH_MG = 18;
constexpr int ROOK_SEVENTH_EG = 32;

constexpr int CONNECTED_ROOKS_MG = 15;
constexpr int CONNECTED_ROOKS_EG = 18;

constexpr int QUEEN_CENTER_MG = 12;
constexpr int QUEEN_CENTER_EG = 8;

constexpr int QUEEN_ON_7TH_MG = 14;
constexpr int QUEEN_ON_7TH_EG = 20;

constexpr int MAX_PHASE = 24;

constexpr int PassedPawnMG[8] =
{
     0,
    10,
    20,
    35,
    60,
    90,
   140,
     0
};

constexpr int PassedPawnEG[8] =
{
      0,
     20,
     40,
     70,
    110,
    170,
    260,
      0
};

constexpr int ISOLATED_MG = 15;
constexpr int ISOLATED_EG = 10;

constexpr int DOUBLED_MG = 12;
constexpr int DOUBLED_EG = 8;

constexpr int CONNECTED_MG = 8;
constexpr int CONNECTED_EG = 12;

inline int Mirror(int sq)
{
    return sq ^ 56;
}

inline int FileOf(Square sq)
{
    return static_cast<int>(sq) & 7;
}

inline int RankOf(Square sq)
{
    return static_cast<int>(sq) >> 3;
}

bool IsPassedPawn(
    const Board& board,
    Square square,
    Side side)
{
    int file = FileOf(square);
    int rank = RankOf(square);

    U64 enemyPawns =
        board.bitboards[
            side == WHITE ? BP : WP];

    if(side == WHITE)
    {
        for(int r = rank + 1; r < 8; r++)
        {
            for(int f = file - 1;
                f <= file + 1;
                f++)
            {
                if(f < 0 || f > 7)
                    continue;

                int sq = r * 8 + f;

                if(enemyPawns & (1ULL << sq))
                    return false;
            }
        }
    }
    else
    {
        for(int r = rank - 1;
            r >= 0;
            r--)
        {
            for(int f = file - 1;
                f <= file + 1;
                f++)
            {
                if(f < 0 || f > 7)
                    continue;

                int sq = r * 8 + f;

                if(enemyPawns & (1ULL << sq))
                    return false;
            }
        }
    }

    return true;
}

bool IsIsolatedPawn(
    const Board& board,
    Square square,
    Side side)
{
    int file = FileOf(square);

    U64 pawns =
        board.bitboards[
            side == WHITE ? WP : BP];

    if(file > 0)
    {
        for(int r = 0; r < 8; r++)
        {
            if(pawns &
               (1ULL << (r * 8 + file - 1)))
            {
                return false;
            }
        }
    }

    if(file < 7)
    {
        for(int r = 0; r < 8; r++)
        {
            if(pawns &
               (1ULL << (r * 8 + file + 1)))
            {
                return false;
            }
        }
    }

    return true;
}

bool IsDoubledPawn(
    const Board& board,
    Square square,
    Side side)
{
    int file = FileOf(square);

    U64 pawns =
        board.bitboards[
            side == WHITE ? WP : BP];

    int count = 0;

    for(int r = 0; r < 8; r++)
    {
        if(pawns &
           (1ULL << (r * 8 + file)))
        {
            count++;
        }
    }

    return count > 1;
}

bool HasPawnOnFile(
    const Board& board,
    Side side,
    int file)
{
    U64 pawns =
        board.bitboards[
            side == WHITE ? WP : BP];

    for(int rank = 0; rank < 8; rank++)
    {
        if(pawns &
           (1ULL << (rank * 8 + file)))
        {
            return true;
        }
    }

    return false;
}

bool SupportedByPawn(
    const Board& board,
    Square square,
    Side side)
{
    if(side == WHITE)
    {
        int left = square - 9;
        int right = square - 7;

        if(left >= 0 &&
           (board.bitboards[WP] &
            (1ULL << left)))
            return true;

        if(right >= 0 &&
           (board.bitboards[WP] &
            (1ULL << right)))
            return true;
    }
    else
    {
        int left = square + 7;
        int right = square + 9;

        if(left < 64 &&
           (board.bitboards[BP] &
            (1ULL << left)))
            return true;

        if(right < 64 &&
           (board.bitboards[BP] &
            (1ULL << right)))
            return true;
    }

    return false;
}

bool IsPawnChain(
    const Board& board,
    Square square,
    Side side)
{
    if(side == WHITE)
    {
        if(square >= 9 &&
           (board.bitboards[WP] &
            (1ULL << (square - 9))))
            return true;

        if(square >= 7 &&
           (board.bitboards[WP] &
            (1ULL << (square - 7))))
            return true;
    }
    else
    {
        if(square <= 54 &&
           (board.bitboards[BP] &
            (1ULL << (square + 7))))
            return true;

        if(square <= 55 &&
           (board.bitboards[BP] &
            (1ULL << (square + 9))))
            return true;
    }

    return false;
}

bool EnemyPawnCanAttack(
    const Board& board,
    Square square,
    Side side)
{
    int file = FileOf(square);
    int rank = RankOf(square);

    U64 enemyPawns =
        board.bitboards[
            side == WHITE ? BP : WP];

    if(side == WHITE)
    {
        for(int r = rank + 1; r < 8; r++)
        {
            if(file > 0)
            {
                int sq = r * 8 + file - 1;

                if(enemyPawns &
                   (1ULL << sq))
                {
                    return true;
                }
            }

            if(file < 7)
            {
                int sq = r * 8 + file + 1;

                if(enemyPawns &
                   (1ULL << sq))
                {
                    return true;
                }
            }
        }
    }
    else
    {
        for(int r = rank - 1; r >= 0; r--)
        {
            if(file > 0)
            {
                int sq = r * 8 + file - 1;

                if(enemyPawns &
                   (1ULL << sq))
                {
                    return true;
                }
            }

            if(file < 7)
            {
                int sq = r * 8 + file + 1;

                if(enemyPawns &
                   (1ULL << sq))
                {
                    return true;
                }
            }
        }
    }

    return false;
}

bool IsCandidatePassedPawn(
    const Board& board,
    Square square,
    Side side)
{
    if(IsPassedPawn(
            board,
            square,
            side))
    {
        return false;
    }

    int file = FileOf(square);
    int rank = RankOf(square);

    U64 enemy =
        board.bitboards[
            side == WHITE ? BP : WP];

    int enemyCount = 0;

    if(side == WHITE)
    {
        for(int r = rank + 1; r < 8; r++)
        {
            for(int f = file - 1;
                f <= file + 1;
                f++)
            {
                if(f < 0 || f > 7)
                    continue;

                if(enemy &
                   (1ULL << (r * 8 + f)))
                {
                    enemyCount++;
                }
            }
        }
    }
    else
    {
        for(int r = rank - 1; r >= 0; r--)
        {
            for(int f = file - 1;
                f <= file + 1;
                f++)
            {
                if(f < 0 || f > 7)
                    continue;

                if(enemy &
                   (1ULL << (r * 8 + f)))
                {
                    enemyCount++;
                }
            }
        }
    }

    return enemyCount <= 1;
}

bool IsPassedPawnBlocked(
    const Board& board,
    Square square,
    Side side)
{
    Square front;

    if(side == WHITE)
    {
        if(square >= 56)
            return false;

        front = (Square)(square + 8);
    }
    else
    {
        if(square <= 7)
            return false;

        front = (Square)(square - 8);
    }

    return board.pieceOnSquare[front] != NO_PIECE;
}

int CountKingAttackUnits(
    const Board& board,
    Side attacker,
    Square kingSquare)
{
    int units = 0;

    U64 kingZone =
        AttackTables::kingAttacks[kingSquare]
        |
        (1ULL << kingSquare);

    // Knights

    U64 knights =
        board.bitboards[
            attacker == WHITE
            ? WN
            : BN];

    while(knights)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(knights);

        Bitboard::PopBit(
            knights,
            sq);

        if(AttackTables::knightAttacks[sq]
            & kingZone)
        {
            units += KNIGHT_ATTACK_UNIT;
        }
    }

    // Bishops

    U64 bishops =
        board.bitboards[
            attacker == WHITE
            ? WB
            : BB];

    while(bishops)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(bishops);

        Bitboard::PopBit(
            bishops,
            sq);

        if(AttackTables::BishopAttacks(
                sq,
                board.occupancies[BOTH])
            &
            kingZone)
        {
            units += BISHOP_ATTACK_UNIT;
        }
    }

    // Rooks

    U64 rooks =
        board.bitboards[
            attacker == WHITE
            ? WR
            : BR];

    while(rooks)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(rooks);

        Bitboard::PopBit(
            rooks,
            sq);

        if(AttackTables::RookAttacks(
                sq,
                board.occupancies[BOTH])
            &
            kingZone)
        {
            units += ROOK_ATTACK_UNIT;
        }
    }

    // Queens

    U64 queens =
        board.bitboards[
            attacker == WHITE
            ? WQ
            : BQ];

    while(queens)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(queens);

        Bitboard::PopBit(
            queens,
            sq);

        if(AttackTables::QueenAttacks(
                sq,
                board.occupancies[BOTH])
            &
            kingZone)
        {
            units += QUEEN_ATTACK_UNIT;
        }
    }

    return units;
}

void EvaluateMaterial(
    const Board& board,
    Score& score,
    int& phase)
{
    for(int sq = 0; sq < 64; sq++)
    {
        Piece piece = board.pieceOnSquare[sq];

        if(piece == NO_PIECE)
            continue;

        int type = static_cast<int>(piece) % 6;

        switch(piece)
        {
            case WP:
            case WN:
            case WB:
            case WR:
            case WQ:

                score.Add(
                    MGValue[type],
                    EGValue[type]);

                phase += PhaseValue[type];
                break;

            case BP:
            case BN:
            case BB:
            case BR:
            case BQ:

                score.Sub(
                    MGValue[type],
                    EGValue[type]);

                phase += PhaseValue[type];
                break;

            default:
                break;
        }
    }
}

void EvaluatePawns(
    const Board& board,
    Score& score)
{
    // =========================
    // White Pawns
    // =========================

    U64 whitePawns = board.bitboards[WP];

    while(whitePawns)
    {
        Square square =
            (Square)Bitboard::LSBIndex(
                whitePawns);

        Bitboard::PopBit(
            whitePawns,
            square);

        int rank = RankOf(square);

            if(IsPassedPawn(
                board,
                square,
                WHITE))
            {
                score.Add(
                    PassedPawnMG[rank],
                    PassedPawnEG[rank]);

                if(SupportedByPawn(
                        board,
                        square,
                        WHITE))
                {
                    score.Add(
                        15,
                        25);
                }

                if(IsPassedPawnBlocked(
                            board,
                            square,
                            WHITE))
                    {
                        score.Sub(
                            BLOCKED_PASSER_MG,
                            BLOCKED_PASSER_EG);
                    }
            }

            if(IsCandidatePassedPawn(
                        board,
                        square,
                        WHITE))
                {
                    score.Add(
                        10,
                        18);
                }

        if(IsIsolatedPawn(
            board,
            square,
            WHITE))
        {
            score.Sub(
                ISOLATED_MG,
                ISOLATED_EG);
        }

        if(IsDoubledPawn(
            board,
            square,
            WHITE))
        {
            score.Sub(
                DOUBLED_MG,
                DOUBLED_EG);
        }

        // Connected pawn

        if(IsPawnChain(
        board,
        square,
        WHITE))
{
    score.Add(
        CONNECTED_MG + 4,
        CONNECTED_EG + 6);
}
    }

    // =========================
    // Black Pawns
    // =========================

    U64 blackPawns = board.bitboards[BP];

    while(blackPawns)
    {
        Square square =
            (Square)Bitboard::LSBIndex(
                blackPawns);

        Bitboard::PopBit(
            blackPawns,
            square);

        int rank =
            7 - RankOf(square);

            if(IsPassedPawn(
                board,
                square,
                BLACK))
            {
                score.Sub(
                    PassedPawnMG[rank],
                    PassedPawnEG[rank]);

                if(SupportedByPawn(
                        board,
                        square,
                        BLACK))
                {
                    score.Sub(
                        15,
                        25);
                }

                if(IsPassedPawnBlocked(
                        board,
                        square,
                        BLACK))
                {
                    score.Add(
                        BLOCKED_PASSER_MG,
                        BLOCKED_PASSER_EG);
                }
            }

                if(IsCandidatePassedPawn(
                        board,
                        square,
                        BLACK))
                {
                    score.Sub(
                        10,
                        18);
                }


        if(IsIsolatedPawn(
            board,
            square,
            BLACK))
        {
            score.Add(
                ISOLATED_MG,
                ISOLATED_EG);
        }

        if(IsDoubledPawn(
            board,
            square,
            BLACK))
        {
            score.Add(
                DOUBLED_MG,
                DOUBLED_EG);
        }

        if(IsPawnChain(
        board,
        square,
        BLACK))
{
    score.Sub(
        CONNECTED_MG + 4,
        CONNECTED_EG + 6);
}
    }
}

void EvaluatePieces(
    const Board& board,
    Score& score,
    int&)
{
    int whiteBishops = 0;
    int blackBishops = 0;

    for(int sq = 0; sq < 64; sq++)
    {
        Piece piece =
            board.pieceOnSquare[sq];

        switch(piece)
        {
            case WN:

                score.Add(
                    PST::Knight[sq],
                    PST::Knight[sq]);

                    if(RankOf((Square)sq) >= 3 &&
                        SupportedByPawn(
                                board,
                                (Square)sq,
                                WHITE)
                        &&
                        !EnemyPawnCanAttack(
                                board,
                                (Square)sq,
                                WHITE))
                        {
                            score.Add(
                                KNIGHT_OUTPOST_MG,
                                KNIGHT_OUTPOST_EG);
                        }

                break;

            case WB:

                whiteBishops++;

                score.Add(
                    PST::Bishop[sq],
                    PST::Bishop[sq]);

                    if(RankOf((Square)sq) >= 3 &&
                        SupportedByPawn(
                                board,
                                (Square)sq,
                                WHITE)
                        &&
                        !EnemyPawnCanAttack(
                                board,
                                (Square)sq,
                                WHITE))
                        {
                            score.Add(
                                BISHOP_OUTPOST_MG,
                                BISHOP_OUTPOST_EG);
                        }

                break;

            case WQ:

                score.Add(
                    PST::Queen[sq],
                    PST::Queen[sq]);

                break;

            case BN:

                score.Sub(
                    PST::Knight[
                        Mirror(sq)],
                    PST::Knight[
                        Mirror(sq)]);

                        if(RankOf((Square)sq) <= 4 &&
                            SupportedByPawn(
                                    board,
                                    (Square)sq,
                                    BLACK)
                            &&
                            !EnemyPawnCanAttack(
                                    board,
                                    (Square)sq,
                                    BLACK))
                            {
                                score.Sub(
                                    KNIGHT_OUTPOST_MG,
                                    KNIGHT_OUTPOST_EG);
                            }

                break;

            case BB:

                blackBishops++;

                score.Sub(
                    PST::Bishop[
                        Mirror(sq)],
                    PST::Bishop[
                        Mirror(sq)]);

                        if(RankOf((Square)sq) <= 4 &&
                                SupportedByPawn(
                                        board,
                                        (Square)sq,
                                        BLACK)
                                &&
                                !EnemyPawnCanAttack(
                                        board,
                                        (Square)sq,
                                        BLACK))
                                {
                                    score.Sub(
                                        BISHOP_OUTPOST_MG,
                                        BISHOP_OUTPOST_EG);
                                }

                break;

            case BQ:

                score.Sub(
                    PST::Queen[
                        Mirror(sq)],
                    PST::Queen[
                        Mirror(sq)]);

                break;

            default:
                break;
        }
    }

    if(whiteBishops >= 2)
    {
        score.Add(
            BISHOP_PAIR_MG,
            BISHOP_PAIR_EG);
    }

    if(blackBishops >= 2)
    {
        score.Sub(
            BISHOP_PAIR_MG,
            BISHOP_PAIR_EG);
    }
}

void EvaluateRooks(
    const Board& board,
    Score& score)
{
    // ==========================
    // WHITE ROOKS
    // ==========================

    U64 rooks = board.bitboards[WR];

    while(rooks)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(rooks);

        Bitboard::PopBit(rooks, sq);

        int file = FileOf(sq);
        int rank = RankOf(sq);

        bool ownPawn =
            HasPawnOnFile(
                board,
                WHITE,
                file);

        bool enemyPawn =
            HasPawnOnFile(
                board,
                BLACK,
                file);

        if(!ownPawn && !enemyPawn)
        {
            score.Add(
                ROOK_OPEN_FILE_MG,
                ROOK_OPEN_FILE_EG);
        }
        else if(!ownPawn)
        {
            score.Add(
                ROOK_SEMIOPEN_FILE_MG,
                ROOK_SEMIOPEN_FILE_EG);
        }

        if(rank == 6)
        {
            score.Add(
                ROOK_SEVENTH_MG,
                ROOK_SEVENTH_EG);
        }
    }

    // ==========================
    // BLACK ROOKS
    // ==========================

    rooks = board.bitboards[BR];

    while(rooks)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(rooks);

        Bitboard::PopBit(rooks, sq);

        int file = FileOf(sq);
        int rank = RankOf(sq);

        bool ownPawn =
            HasPawnOnFile(
                board,
                BLACK,
                file);

        bool enemyPawn =
            HasPawnOnFile(
                board,
                WHITE,
                file);

        if(!ownPawn && !enemyPawn)
        {
            score.Sub(
                ROOK_OPEN_FILE_MG,
                ROOK_OPEN_FILE_EG);
        }
        else if(!ownPawn)
        {
            score.Sub(
                ROOK_SEMIOPEN_FILE_MG,
                ROOK_SEMIOPEN_FILE_EG);
        }

        if(rank == 1)
        {
            score.Sub(
                ROOK_SEVENTH_MG,
                ROOK_SEVENTH_EG);
        }
    }

    // ==========================
    // CONNECTED ROOKS
    // ==========================

    if(Bitboard::CountBits(board.bitboards[WR]) == 2)
    {
        U64 white = board.bitboards[WR];

        Square r1 =
            (Square)Bitboard::LSBIndex(white);

        Bitboard::PopBit(white, r1);

        Square r2 =
            (Square)Bitboard::LSBIndex(white);

        if(AttackTables::RookAttacks(
                r1,
                board.occupancies[BOTH])
            &
            (1ULL << r2))
        {
            score.Add(
                CONNECTED_ROOKS_MG,
                CONNECTED_ROOKS_EG);
        }
    }

    if(Bitboard::CountBits(board.bitboards[BR]) == 2)
    {
        U64 black = board.bitboards[BR];

        Square r1 =
            (Square)Bitboard::LSBIndex(black);

        Bitboard::PopBit(black, r1);

        Square r2 =
            (Square)Bitboard::LSBIndex(black);

        if(AttackTables::RookAttacks(
                r1,
                board.occupancies[BOTH])
            &
            (1ULL << r2))
        {
            score.Sub(
                CONNECTED_ROOKS_MG,
                CONNECTED_ROOKS_EG);
        }
    }
}

void EvaluateQueens(
    const Board& board,
    Score& score)
{
    U64 queens = board.bitboards[WQ];

    while(queens)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(queens);

        Bitboard::PopBit(
            queens,
            sq);

        int file = FileOf(sq);
        int rank = RankOf(sq);

        // Centralization
        if(file >= 2 && file <= 5 &&
           rank >= 2 && rank <= 5)
        {
            score.Add(
                QUEEN_CENTER_MG,
                QUEEN_CENTER_EG);
        }

        // 7th rank
        if(rank == 6)
        {
            score.Add(
                QUEEN_ON_7TH_MG,
                QUEEN_ON_7TH_EG);
        }
    }

    queens = board.bitboards[BQ];

    while(queens)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(queens);

        Bitboard::PopBit(
            queens,
            sq);

        int file = FileOf(sq);
        int rank = RankOf(sq);

        if(file >= 2 && file <= 5 &&
           rank >= 2 && rank <= 5)
        {
            score.Sub(
                QUEEN_CENTER_MG,
                QUEEN_CENTER_EG);
        }

        if(rank == 1)
        {
            score.Sub(
                QUEEN_ON_7TH_MG,
                QUEEN_ON_7TH_EG);
        }
    }
}

void EvaluateKings(
    const Board& board,
    Score& score)
{
    // ==========================
    // WHITE KING
    // ==========================

    Square whiteKing =
        board.FindKing(WHITE);

    int whiteFile =
        FileOf(whiteKing);

    int whiteRank =
        RankOf(whiteKing);

    // Pawn shield

    if(whiteRank <= 1)
    {
        for(int f = whiteFile - 1;
            f <= whiteFile + 1;
            f++)
        {
            if(f < 0 || f > 7)
                continue;

            int sq =
                (whiteRank + 1) * 8 + f;

            if(board.bitboards[WP] &
               (1ULL << sq))
            {
                score.Add(
                    PAWN_SHIELD_BONUS,
                    0);
            }
        }
    }

    // Endgame king activity

    int whiteDistance =
        abs(whiteFile - 3) +
        abs(whiteRank - 3);

    int whiteBonus =
    std::max(
        0,
        6 - whiteDistance);

score.Add(
    0,
    whiteBonus * KING_CENTER_EG);


    // File penalties

    int blackAttackUnits =
    CountKingAttackUnits(
        board,
        BLACK,
        whiteKing);

        score.Sub(
    0,
    KingAttackTable[
        std::min(
            blackAttackUnits,
            31)]);

    bool own =
        HasPawnOnFile(
            board,
            WHITE,
            whiteFile);

    bool enemy =
        HasPawnOnFile(
            board,
            BLACK,
            whiteFile);

    if(!own && !enemy)
    {
        score.Sub(
            OPEN_FILE_KING_PENALTY,
            0);
    }
    else if(!own)
    {
        score.Sub(
            SEMI_OPEN_FILE_KING_PENALTY,
            0);
    }

    // ==========================
    // BLACK KING
    // ==========================

    Square blackKing =
        board.FindKing(BLACK);

    int blackFile =
        FileOf(blackKing);

    int blackRank =
        RankOf(blackKing);

    if(blackRank >= 6)
    {
        for(int f = blackFile - 1;
            f <= blackFile + 1;
            f++)
        {
            if(f < 0 || f > 7)
                continue;

            int sq =
                (blackRank - 1) * 8 + f;

            if(board.bitboards[BP] &
               (1ULL << sq))
            {
                score.Sub(
                    PAWN_SHIELD_BONUS,
                    0);
            }
        }
    }

        int blackDistance =
        abs(blackFile - 3) +
        abs(blackRank - 3);

    int blackBonus =
    std::max(
        0,
        6 - blackDistance);

score.Sub(
    0,
    blackBonus * KING_CENTER_EG);

        int whiteAttackUnits =
            CountKingAttackUnits(
                board,
                WHITE,
                blackKing);

        score.Add(
    0,
    KingAttackTable[
        std::min(
            whiteAttackUnits,
            31)]);


    own =
        HasPawnOnFile(
            board,
            BLACK,
            blackFile);

    enemy =
        HasPawnOnFile(
            board,
            WHITE,
            blackFile);

    if(!own && !enemy)
    {
        score.Add(
            OPEN_FILE_KING_PENALTY,
            0);
    }
    else if(!own)
    {
        score.Add(
            SEMI_OPEN_FILE_KING_PENALTY,
            0);
    }
}

void EvaluateMobility(
    const Board& board,
    Score& score)
{
    // =========================
    // White Knights
    // =========================

    U64 knights = board.bitboards[WN];

    while(knights)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(knights);

        Bitboard::PopBit(
            knights,
            sq);

        int mobility =
            Bitboard::CountBits(
                AttackTables::knightAttacks[sq]
                &
                ~board.occupancies[WHITE]);

        score.Add(
            mobility * 4,
            mobility * 3);
    }

    // =========================
    // White Bishops
    // =========================

    U64 bishops = board.bitboards[WB];

    while(bishops)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(bishops);

        Bitboard::PopBit(
            bishops,
            sq);

        U64 attacks =
            AttackTables::BishopAttacks(
                sq,
                board.occupancies[BOTH]);

        attacks &=
            ~board.occupancies[WHITE];

        int mobility =
            Bitboard::CountBits(attacks);

        score.Add(
            mobility * 5,
            mobility * 5);
    }

    // =========================
    // White Rooks
    // =========================

    U64 rooks = board.bitboards[WR];

    while(rooks)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(rooks);

        Bitboard::PopBit(
            rooks,
            sq);

        U64 attacks =
            AttackTables::RookAttacks(
                sq,
                board.occupancies[BOTH]);

        attacks &=
            ~board.occupancies[WHITE];

        int mobility =
            Bitboard::CountBits(attacks);

        score.Add(
            mobility * 2,
            mobility * 3);
    }

    // =========================
    // White Queens
    // =========================

    U64 queens = board.bitboards[WQ];

    while(queens)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(queens);

        Bitboard::PopBit(
            queens,
            sq);

        U64 attacks =
            AttackTables::QueenAttacks(
                sq,
                board.occupancies[BOTH]);

        attacks &=
            ~board.occupancies[WHITE];

        int mobility =
            Bitboard::CountBits(attacks);

        score.Add(
            mobility,
            mobility * 2);
    }

    // =========================
    // Black Knights
    // =========================

    knights = board.bitboards[BN];

    while(knights)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(knights);

        Bitboard::PopBit(
            knights,
            sq);

        int mobility =
            Bitboard::CountBits(
                AttackTables::knightAttacks[sq]
                &
                ~board.occupancies[BLACK]);

        score.Sub(
            mobility * 4,
            mobility * 3);
    }

    // =========================
    // Black Bishops
    // =========================

    bishops = board.bitboards[BB];

    while(bishops)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(bishops);

        Bitboard::PopBit(
            bishops,
            sq);

        U64 attacks =
            AttackTables::BishopAttacks(
                sq,
                board.occupancies[BOTH]);

        attacks &=
            ~board.occupancies[BLACK];

        int mobility =
            Bitboard::CountBits(attacks);

        score.Sub(
            mobility * 5,
            mobility * 5);
    }

    // =========================
    // Black Rooks
    // =========================

    rooks = board.bitboards[BR];

    while(rooks)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(rooks);

        Bitboard::PopBit(
            rooks,
            sq);

        U64 attacks =
            AttackTables::RookAttacks(
                sq,
                board.occupancies[BOTH]);

        attacks &=
            ~board.occupancies[BLACK];

        int mobility =
            Bitboard::CountBits(attacks);

        score.Sub(
            mobility * 2,
            mobility * 3);
    }

    // =========================
    // Black Queens
    // =========================

    queens = board.bitboards[BQ];

    while(queens)
    {
        Square sq =
            (Square)Bitboard::LSBIndex(queens);

        Bitboard::PopBit(
            queens,
            sq);

        U64 attacks =
            AttackTables::QueenAttacks(
                sq,
                board.occupancies[BOTH]);

        attacks &=
            ~board.occupancies[BLACK];

        int mobility =
            Bitboard::CountBits(attacks);

        score.Sub(
            mobility,
            mobility * 2);
    }
}

int Evaluate(
    const Board& board)
{
    Score score;

    int phase = 0;

    EvaluateMaterial(
        board,
        score,
        phase);

    EvaluatePawns(
        board,
        score);

    EvaluatePieces(
        board,
        score,
        phase);

    EvaluateRooks(
        board,
        score);

    EvaluateQueens(
        board,
        score);

    EvaluateKings(
        board,
        score);

    EvaluateMobility(
        board,
        score);

    if(phase > MAX_PHASE)
        phase = MAX_PHASE;

    int finalScore =
        (score.mg * phase +
         score.eg * (MAX_PHASE - phase))
        / MAX_PHASE;

    return board.side == WHITE
        ? finalScore
        : -finalScore;
}

}