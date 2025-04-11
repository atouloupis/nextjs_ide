import { WebSocketServer } from 'ws';
import { spawn } from 'node-pty';

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', (ws) => {
  const shell = spawn('/bin/bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env,
  });

  shell.onData((data) => {
    ws.send(data);
  });

  ws.on('message', (msg) => {
    shell.write(msg.toString());
  });

  ws.on('close', () => {
    shell.kill();
  });
});

console.log('Terminal WebSocket server running on ws://localhost:3001');
