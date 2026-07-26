# KnightShift ♞

KnightShift is a chess engine written completely from scratch in modern C++. The project focuses on implementing classical chess engine algorithms from the ground up, with an emphasis on correctness, search techniques, and performance optimization.

---

## Features

### Board Representation
- Bitboard-based board representation
- FEN parsing
- MakeMove / UndoMove

### Move Generation
- Legal move generation
- Check detection
- Castling
- En Passant
- Pawn Promotion
- Promotion captures

### Search
- Negamax Search
- Alpha-Beta Pruning
- Basic Material Evaluation

### Testing
- Official Perft Suite
- Win At Chess (WAC) Tactical Test Suite

---

# Perft Validation

KnightShift passes all six official Perft positions from the Chess Programming Wiki.

### Initial Position

| Depth | Nodes |
|------:|-------------:|
| 1 | 20 |
| 2 | 400 |
| 3 | 8,902 |
| 4 | 197,281 |
| 5 | 4,865,609 |
| 6 | 119,060,324 |

**Status**

✅ Passed all 6 official Perft positions.

---

# Tactical Strength

Current benchmark:

**Win At Chess (WAC)**

Search Depth: **6**

Official Score:

```
132 / 300
```

Accounting for positions with multiple accepted best moves:

```
151 / 300
```

---

# Tech Stack

- C++20
- CMake
- Bitboards
- VS Code

---

# Roadmap

## Engine Core

- [x] Bitboards
- [x] FEN Parsing
- [x] Move Encoding
- [x] Legal Move Generation
- [x] MakeMove / UndoMove
- [x] Attack Detection
- [x] Castling
- [x] En Passant
- [x] Pawn Promotions

## Search

- [x] Negamax
- [x] Alpha-Beta Pruning
- [x] Material Evaluation
- [x] Automated Perft Testing
- [x] Automated WAC Tactical Testing

## Planned

- [ ] Quiescence Search
- [ ] MVV-LVA Move Ordering
- [ ] Piece-Square Tables
- [ ] Killer Heuristic
- [ ] History Heuristic
- [ ] Iterative Deepening
- [ ] Transposition Table
- [ ] UCI Protocol
- [ ] Web Interface

---

# Author

Built by **Ayush**.
