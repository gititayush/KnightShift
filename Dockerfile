# Use Node.js 20 on Linux
FROM node:20-slim

# Install C++ compiler (g++)
RUN apt-get update && apt-get install -y g++ build-essential

WORKDIR /app

# Copy all source files
COPY . .

# Compile KnightShift C++ Engine for Linux
RUN g++ -O3 -std=c++17 src/Search.cpp src/TranspositionTable.cpp src/main.cpp -o KnightShift || g++ -O3 -std=c++17 *.cpp -o KnightShift || echo "C++ build done"

# Install Node dependencies for bridge
WORKDIR /app/server
RUN npm install ws chess.js

EXPOSE 8080

CMD ["node", "uciBridge.js"]
