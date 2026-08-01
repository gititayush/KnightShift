const WebSocket = require('ws');

const ws = new WebSocket('wss://knightshift.onrender.com');

ws.on('open', () => {
  console.log('✅ Connected to wss://knightshift.onrender.com');
  ws.send(JSON.stringify({ 
    type: 'go', 
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', 
    depth: 6, 
    wtime: 300000, 
    btime: 300000 
  }));
});

ws.on('message', (d) => {
  console.log('RECV:', d.toString());
  const parsed = JSON.parse(d.toString());
  if (parsed.type === 'bestmove') {
    console.log('🎯 BEST MOVE RECEIVED FROM C++ ENGINE:', parsed.bestMove);
    process.exit(0);
  }
});

ws.on('error', (err) => {
  console.error('❌ WS Error:', err);
});

setTimeout(() => {
  console.log('⏰ Timeout waiting for bestmove');
  process.exit(1);
}, 15000);
