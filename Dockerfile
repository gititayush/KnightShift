# Use Node.js 20 on Linux
FROM node:20-slim

# Install C++ compiler (g++) and build tools
RUN apt-get update && apt-get install -y g++ build-essential

WORKDIR /app

# Copy all source files
COPY . .

# Install dependencies
RUN npm install

# Compile KnightShift C++ Engine for Linux with -I include -I src flags
RUN g++ -O3 -std=c++20 -I include -I src src/*.cpp -o KnightShift -pthread

EXPOSE 8080

CMD ["node", "server/uciBridge.js"]
