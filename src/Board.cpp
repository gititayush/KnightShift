#include "Board.h"
#include "MoveGenerator.h"
#include "AttackDetector.h"
#include <iostream>
#include <sstream>
#include "Zobrist.h"

Board::Board()
{
    Reset();
}

void Board::Reset()
{
    for (int piece = WP; piece <= BK; piece++)
        bitboards[piece] = 0ULL;

    occupancies[WHITE] = 0ULL;
    occupancies[BLACK] = 0ULL;
    occupancies[BOTH] = 0ULL;

    for (int square = A1; square <= H8; square++)
        pieceOnSquare[square] = NO_PIECE;

    side = WHITE;
    enPassant = NO_SQUARE;
    castling = 0;
    halfmoveClock = 0;
    fullmoveNumber = 1;
}

bool Board::LoadFEN(const std::string& fen)
{
    Reset();

    std::stringstream ss(fen);

    std::string boardPart;
    std::string sidePart;
    std::string castlePart;
    std::string epPart;

    ss >> boardPart;
    ss >> sidePart;
    ss >> castlePart;
    ss >> epPart;
    ss >> halfmoveClock;
    ss >> fullmoveNumber;

    int rank = 7;
    int file = 0;

    for(char c : boardPart)
    {
        if(c == '/')
        {
            rank--;
            file = 0;
            continue;
        }

        if(c >= '1' && c <= '8')
        {
            file += c - '0';
            continue;
        }

        Piece piece = NO_PIECE;

        switch(c)
        {
            case 'P': piece = WP; break;
            case 'N': piece = WN; break;
            case 'B': piece = WB; break;
            case 'R': piece = WR; break;
            case 'Q': piece = WQ; break;
            case 'K': piece = WK; break;

            case 'p': piece = BP; break;
            case 'n': piece = BN; break;
            case 'b': piece = BB; break;
            case 'r': piece = BR; break;
            case 'q': piece = BQ; break;
            case 'k': piece = BK; break;
        }

        if(piece != NO_PIECE)
        {
            int square = rank * 8 + file;

            pieceOnSquare[square] = piece;
            bitboards[piece] |= (1ULL << square);

            file++;
        }
    }

    side = (sidePart == "w") ? WHITE : BLACK;

    if(castlePart.find('K') != std::string::npos)
        castling |= WK_CASTLE;

    if(castlePart.find('Q') != std::string::npos)
        castling |= WQ_CASTLE;

    if(castlePart.find('k') != std::string::npos)
        castling |= BK_CASTLE;

    if(castlePart.find('q') != std::string::npos)
        castling |= BQ_CASTLE;

    if(epPart != "-")
    {
        int file = epPart[0] - 'a';
        int rank = epPart[1] - '1';

        enPassant = static_cast<Square>(rank * 8 + file);
    }

    for(int piece = WP; piece <= WK; piece++)
        occupancies[WHITE] |= bitboards[piece];

    for(int piece = BP; piece <= BK; piece++)
        occupancies[BLACK] |= bitboards[piece];

    occupancies[BOTH] =
        occupancies[WHITE] |
        occupancies[BLACK];

hashKey = Zobrist::GenerateHash(*this);
    return true;
}

bool Board::MakeMove(Move move, UndoInfo& undo){
    Square from = MoveEncoding::From(move);
    Square to   = MoveEncoding::To(move);

    Piece piece = MoveEncoding::PieceMoved(move);
        undo.movedPiece = piece;


    Piece captured = pieceOnSquare[to];

    if (captured == WK || captured == BK)
    return false;

    undo.capturedPiece = captured;

    undo.capturedSquare = to;

    undo.castling = castling;

    undo.enPassant = enPassant;

    undo.halfmoveClock = halfmoveClock;

    undo.fullmoveNumber = fullmoveNumber;

    // =======================
// Update Castling Rights
// =======================

// King moved
if (piece == WK)
    castling &= ~(WK_CASTLE | WQ_CASTLE);

if (piece == BK)
    castling &= ~(BK_CASTLE | BQ_CASTLE);

// White rooks moved
if (piece == WR)
{
    if (from == A1)
        castling &= ~WQ_CASTLE;

    if (from == H1)
        castling &= ~WK_CASTLE;
}

// Black rooks moved
if (piece == BR)
{
    if (from == A8)
        castling &= ~BQ_CASTLE;

    if (from == H8)
        castling &= ~BK_CASTLE;
}

// White rook captured
if (captured == WR)
{
    if (to == A1)
        castling &= ~WQ_CASTLE;

    if (to == H1)
        castling &= ~WK_CASTLE;
}

// Black rook captured
if (captured == BR)
{
    if (to == A8)
        castling &= ~BQ_CASTLE;

    if (to == H8)
        castling &= ~BK_CASTLE;
}

Piece promotion = MoveEncoding::PromotionPiece(move);

bitboards[piece] &= ~(1ULL << from);

if(promotion != NO_PIECE)
{
    bitboards[promotion] |= (1ULL << to);
    pieceOnSquare[to] = promotion;
}
else
{
    bitboards[piece] |= (1ULL << to);
    pieceOnSquare[to] = piece;
}

pieceOnSquare[from] = NO_PIECE;

    // =======================
// Handle Castling
// =======================

if (MoveEncoding::IsCastling(move))
{
    switch (to)
    {
        // White kingside
        case G1:
            bitboards[WR] &= ~(1ULL << H1);
            bitboards[WR] |=  (1ULL << F1);

            pieceOnSquare[H1] = NO_PIECE;
            pieceOnSquare[F1] = WR;
            break;

        // White queenside
        case C1:
            bitboards[WR] &= ~(1ULL << A1);
            bitboards[WR] |=  (1ULL << D1);

            pieceOnSquare[A1] = NO_PIECE;
            pieceOnSquare[D1] = WR;
            break;

        // Black kingside
        case G8:
            bitboards[BR] &= ~(1ULL << H8);
            bitboards[BR] |=  (1ULL << F8);

            pieceOnSquare[H8] = NO_PIECE;
            pieceOnSquare[F8] = BR;
            break;

        // Black queenside
        case C8:
            bitboards[BR] &= ~(1ULL << A8);
            bitboards[BR] |=  (1ULL << D8);

            pieceOnSquare[A8] = NO_PIECE;
            pieceOnSquare[D8] = BR;
            break;
    }
}

   if(captured != NO_PIECE)
{
    bitboards[captured] &= ~(1ULL << to);
}

// =======================
// En Passant Capture
// =======================

if(MoveEncoding::IsEnPassant(move))
{
    if(piece == WP)
    {
        Square capturedSquare = (Square)(to - 8);

        undo.capturedPiece = BP;
        undo.capturedSquare = capturedSquare;

        bitboards[BP] &= ~(1ULL << capturedSquare);
        pieceOnSquare[capturedSquare] = NO_PIECE;
    }
    else if(piece == BP)
    {
        Square capturedSquare = (Square)(to + 8);

        undo.capturedPiece = WP;
        undo.capturedSquare = capturedSquare;

        bitboards[WP] &= ~(1ULL << capturedSquare);
        pieceOnSquare[capturedSquare] = NO_PIECE;
    }
}

    occupancies[WHITE] = 0ULL;
    occupancies[BLACK] = 0ULL;

    for(int p = WP; p <= WK; p++)
        occupancies[WHITE] |= bitboards[p];

    for(int p = BP; p <= BK; p++)
        occupancies[BLACK] |= bitboards[p];

    occupancies[BOTH] =
        occupancies[WHITE] |
        occupancies[BLACK];

    // =======================
// Update En Passant Square
// =======================

enPassant = NO_SQUARE;

if(MoveEncoding::IsDoublePush(move))
{
    if(piece == WP)
        enPassant = (Square)(to - 8);

    else if(piece == BP)
        enPassant = (Square)(to + 8);
}

    side =
        side == WHITE ?
        BLACK :
        WHITE;
hashKey = Zobrist::GenerateHash(*this);
    return true;
}

void Board::UndoMove(Move move, const UndoInfo& undo)
{
    Square from = MoveEncoding::From(move);
    Square to   = MoveEncoding::To(move);
  Piece piece = undo.movedPiece;
Piece promotion = MoveEncoding::PromotionPiece(move);    
    side =
        side == WHITE ?
        BLACK :
        WHITE;

if(promotion != NO_PIECE)
{
    bitboards[promotion] &= ~(1ULL << to);

    bitboards[piece] |= (1ULL << from);

    pieceOnSquare[from] = piece;
    pieceOnSquare[to] = NO_PIECE;
}
else
{
    bitboards[piece] &= ~(1ULL << to);

    bitboards[piece] |= (1ULL << from);

    pieceOnSquare[from] = piece;
    pieceOnSquare[to] = NO_PIECE;
}

    // =======================
// Undo Castling
// =======================

if (MoveEncoding::IsCastling(move))
{
    switch (to)
    {
        // White kingside
        case G1:
            bitboards[WR] &= ~(1ULL << F1);
            bitboards[WR] |=  (1ULL << H1);

            pieceOnSquare[F1] = NO_PIECE;
            pieceOnSquare[H1] = WR;
            break;

        // White queenside
        case C1:
            bitboards[WR] &= ~(1ULL << D1);
            bitboards[WR] |=  (1ULL << A1);

            pieceOnSquare[D1] = NO_PIECE;
            pieceOnSquare[A1] = WR;
            break;

        // Black kingside
        case G8:
            bitboards[BR] &= ~(1ULL << F8);
            bitboards[BR] |=  (1ULL << H8);

            pieceOnSquare[F8] = NO_PIECE;
            pieceOnSquare[H8] = BR;
            break;

        // Black queenside
        case C8:
            bitboards[BR] &= ~(1ULL << D8);
            bitboards[BR] |=  (1ULL << A8);

            pieceOnSquare[D8] = NO_PIECE;
            pieceOnSquare[A8] = BR;
            break;
    }
}

   if(undo.capturedPiece != NO_PIECE)
{
    bitboards[undo.capturedPiece] |=
        (1ULL << undo.capturedSquare);

    pieceOnSquare[undo.capturedSquare] =
        undo.capturedPiece;

    // For normal captures, destination square contains the captured piece.
    // For en passant, capturedSquare is different from 'to'.
    if(undo.capturedSquare != to)
        pieceOnSquare[to] = NO_PIECE;
}
    occupancies[WHITE] = 0ULL;
    occupancies[BLACK] = 0ULL;

    for(int p = WP; p <= WK; p++)
        occupancies[WHITE] |= bitboards[p];

    for(int p = BP; p <= BK; p++)
        occupancies[BLACK] |= bitboards[p];

    occupancies[BOTH] =
        occupancies[WHITE] |
        occupancies[BLACK];

    castling = undo.castling;
    enPassant = undo.enPassant;
    halfmoveClock = undo.halfmoveClock;
    fullmoveNumber = undo.fullmoveNumber;
    hashKey = Zobrist::GenerateHash(*this);
}

Square Board::FindKing(Side side) const
{
    U64 kings =
        (side == WHITE)
        ? bitboards[WK]
        : bitboards[BK];

    if(kings == 0)
        return NO_SQUARE;

    return (Square)__builtin_ctzll(kings);
}

Move Board::ParseMove(const std::string& moveText) const
{
    if(moveText.length() != 4 &&
   moveText.length() != 5)
{
    return 0;
}

    int fromFile = moveText[0] - 'a';
    int fromRank = moveText[1] - '1';

    int toFile = moveText[2] - 'a';
    int toRank = moveText[3] - '1';

    if(fromFile < 0 || fromFile > 7 ||
       toFile < 0 || toFile > 7 ||
       fromRank < 0 || fromRank > 7 ||
       toRank < 0 || toRank > 7)
    {
        return 0;
    }

    Square from = (Square)(fromRank * 8 + fromFile);
    Square to   = (Square)(toRank * 8 + toFile);

    Piece promotion = NO_PIECE;

if(moveText.length() == 5)
{
    switch(moveText[4])
    {
        case 'q':
            promotion = (side == WHITE) ? WQ : BQ;
            break;

        case 'r':
            promotion = (side == WHITE) ? WR : BR;
            break;

        case 'b':
            promotion = (side == WHITE) ? WB : BB;
            break;

        case 'n':
            promotion = (side == WHITE) ? WN : BN;
            break;

        default:
            return 0;
    }
}

    MoveList list;
    MoveGenerator::Generate(*this, list);

    for(int i = 0; i < list.count; i++)
{
    Move move = list.moves[i];

   if(MoveEncoding::From(move) == from &&
   MoveEncoding::To(move) == to)
{
    if(moveText.length() == 5)
    {
        if(MoveEncoding::PromotionPiece(move) != promotion)
            continue;
    }
    else
    {
        if(MoveEncoding::PromotionPiece(move) != NO_PIECE)
            continue;
    }

    if(MoveGenerator::IsMoveLegal(*this, move))
        return move;
}
}

    return 0;
}
void Board::Print() const
{
const char pieceChar[] =
{
    'P','N','B','R','Q','K',
    'p','n','b','r','q','k'
};

// const char* RESET = "\033[0m";

// const char* WHITE_PIECE = "\033[1;97m"; // bright white
// const char* BLACK_PIECE = "\033[1;30m"; // black

// const char* LIGHT_SQUARE = "\033[48;5;255m"; // almost white
// const char* DARK_SQUARE  = "\033[48;5;238m"; // dark gray

    std::cout << '\n';

    for(int rank = 7; rank >= 0; rank--)
    {
        std::cout << rank + 1 << " ";

        for(int file = 0; file < 8; file++)
        {
            int square = rank * 8 + file;

            // bool lightSquare =
//     (rank + file) % 2 == 0;

// std::cout << (lightSquare ? LIGHT_SQUARE : DARK_SQUARE);
if(pieceOnSquare[square] == NO_PIECE)
{
    std::cout << " . ";
}
else
{
    Piece piece = pieceOnSquare[square];
    std::cout << " " << pieceChar[piece] << " ";
}
        }

        std::cout << '\n';
    }

    std::cout << "\n  A B C D E F G H\n\n";

    std::cout << "Side: "
              << (side == WHITE ? "White" : "Black")
              << '\n';

    std::cout << "Castling: ";

    if(castling == 0)
        std::cout << "-";

    if(castling & WK_CASTLE) std::cout << "K";
    if(castling & WQ_CASTLE) std::cout << "Q";
    if(castling & BK_CASTLE) std::cout << "k";
    if(castling & BQ_CASTLE) std::cout << "q";

    std::cout << '\n';

    std::cout << "En Passant: ";

    if(enPassant == NO_SQUARE)
        std::cout << "-";
    else
        std::cout << enPassant;

    std::cout << '\n';

    std::cout << "Halfmove: "
              << halfmoveClock
              << '\n';

    std::cout << "Fullmove: "
              << fullmoveNumber
              << "\n\n";
}