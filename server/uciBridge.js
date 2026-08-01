import { spawn } from 'child_process';
import { WebSocketServer } from 'ws';
import path from 'path';

import fs from 'fs';

const PORT = process.env.PORT || 8080;

let ENGINE_PATH = process.env.KNIGHTSHIFT_PATH || (process.platform === 'win32' ? './KnightShift.exe' : './KnightShift');
if (!fs.existsSync(ENGINE_PATH) && fs.existsSync('../KnightShift')) {
  ENGINE_PATH = '../KnightShift';
}
if (!fs.existsSync(ENGINE_PATH) && fs.existsSync('/app/KnightShift')) {
  ENGINE_PATH = '/app/KnightShift';
}

console.log(`====================================================`);
console.log(`🛡️  KNIGHTSHIFT C++ ENGINE UCI WEB-SOCKET BRIDGE`);
console.log(`====================================================`);
import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*' 
  });
  res.end('KnightShift C++ Engine WebSocket Bridge is Live!');
});

const wss = new WebSocketServer({ server });

server.listen(PORT, () => {
  console.log(`🚀 Bridge listening on port ${PORT}`);
});

wss.on('connection', (ws) => {
  console.log(`[Bridge] React Frontend connected to C++ Engine!`);

  let engineProcess = null;

  try {
    engineProcess = spawn(ENGINE_PATH, [], {
      cwd: path.dirname(path.resolve(ENGINE_PATH)),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    console.log(`[Bridge] Spawned KnightShift.exe process PID: ${engineProcess.pid}`);

    engineProcess.stdin.write('uci\n');
    engineProcess.stdin.write('isready\n');

    engineProcess.stdout.on('data', (data) => {
      const output = data.toString();
      const lines = output.split('\n');

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('info')) {
          const stats = parseUciInfoLine(trimmed);
          ws.send(JSON.stringify({ type: 'telemetry', stats, raw: trimmed }));
        }
        else if (trimmed.startsWith('bestmove')) {
          const parts = trimmed.split(' ');
          const bestMove = parts[1];
          ws.send(JSON.stringify({ type: 'bestmove', bestMove, raw: trimmed }));
        }
      });
    });

    engineProcess.stderr.on('data', (data) => {
      console.error(`[C++ STDERR] ${data.toString()}`);
    });

    engineProcess.on('close', (code) => {
      console.log(`[C++ Engine] Process exited with code ${code}`);
      ws.send(JSON.stringify({ type: 'status', message: 'Engine process exited' }));
    });

  } catch (err) {
    console.error(`[Bridge Error] Could not spawn C++ engine: ${err.message}`);
    ws.send(JSON.stringify({ 
      type: 'error', 
      message: `Failed to spawn ${ENGINE_PATH}: ${err.message}` 
    }));
  }

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message.toString());
      if (!engineProcess) return;

      if (msg.type === 'go') {
        const fenStr = msg.fen || 'startpos';
        const depth = msg.depth || 12;
        
        // Pass clock time if provided for dynamic engine time management
        const wtime = msg.wtime ? Math.round(msg.wtime * 1000) : 300000;
        const btime = msg.btime ? Math.round(msg.btime * 1000) : 300000;
        const winc = msg.winc ? Math.round(msg.winc * 1000) : 3000;
        const binc = msg.binc ? Math.round(msg.binc * 1000) : 3000;

        console.log(`[Sending to C++] position fen ${fenStr}`);
        console.log(`[Sending to C++] go depth ${depth} wtime ${wtime} btime ${btime} winc ${winc} binc ${binc}`);
        engineProcess.stdin.write(`position fen ${fenStr}\n`);
        engineProcess.stdin.write(`go depth ${depth} wtime ${wtime} btime ${btime} winc ${winc} binc ${binc}\n`);
      } 
      else if (msg.type === 'stop') {
        engineProcess.stdin.write('stop\n');
      }
      else if (msg.type === 'ucinewgame') {
        engineProcess.stdin.write('ucinewgame\n');
        engineProcess.stdin.write('isready\n');
      }
    } catch (e) {
      console.error(`[Bridge] Invalid WS message received:`, e);
    }
  });

  ws.on('close', () => {
    console.log(`[Bridge] Frontend disconnected`);
    if (engineProcess) {
      engineProcess.stdin.write('quit\n');
      engineProcess.kill();
    }
  });
});

function parseUciInfoLine(line) {
  const tokens = line.split(' ');
  const result = {};

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === 'depth') result.depth = parseInt(tokens[i + 1]);
    if (tokens[i] === 'seldepth') result.selDepth = parseInt(tokens[i + 1]);
    if (tokens[i] === 'nodes') result.nodes = parseInt(tokens[i + 1]);
    if (tokens[i] === 'nps') result.nps = parseInt(tokens[i + 1]);
    if (tokens[i] === 'time') result.timeMs = parseInt(tokens[i + 1]);
    if (tokens[i] === 'score') {
      if (tokens[i + 1] === 'cp') {
        result.score = parseInt(tokens[i + 2]) / 100.0;
      } else if (tokens[i + 1] === 'mate') {
        result.score = parseInt(tokens[i + 2]);
        result.isMate = true;
      }
    }
    if (tokens[i] === 'pv') {
      result.pv = tokens.slice(i + 1);
      break;
    }
  }

  return result;
}
