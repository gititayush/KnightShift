# Use Node.js 20 on Linux
FROM node:20-slim

# Install C++ compiler (g++) and build tools
RUN apt-get update && apt-get install -y g++ build-essential

WORKDIR /app

# Copy all source files
COPY . .

# Install dependencies
RUN npm install

# Compile KnightShift C++ Engine for Linux with active source files (excludes old Evaluation.cpp)
RUN g++ -O3 -std=c++20 -I include -I src \
    src/main.cpp \
    src/Bitboard.cpp \
    src/AttackTables.cpp \
    src/Board.cpp \
    src/Move.cpp \
    src/FEN.cpp \
    src/Search.cpp \
    src/UCI.cpp \
    src/MoveList.cpp \
    src/MoveGenerator.cpp \
    src/AttackDetector.cpp \
    src/Perft.cpp \
    src/TestPositions.cpp \
    src/MoveOrdering.cpp \
    src/Zobrist.cpp \
    src/TranspositionTable.cpp \
    src/PieceSquareTables.cpp \
    src/SearchStats.cpp \
    src/SEE.cpp \
    src/Evaluation2.cpp \
    -o KnightShift -pthread

EXPOSE 8080

CMD ["node", "server/uciBridge.js"]
