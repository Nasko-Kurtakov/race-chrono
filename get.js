const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Configuration
const WEBSOCKET_URL = "ws://www.apex-timing.com:8182";
const OUTPUT_FILE = path.join(__dirname, 'websocket_output.txt');

// Create a write stream for the output file
const fileStream = fs.createWriteStream(OUTPUT_FILE, { flags: 'a' });

// Create a WebSocket client
const ws = new WebSocket(WEBSOCKET_URL);

// Handle WebSocket connection open
ws.on('open', () => {
  console.log(`Connected to ${WEBSOCKET_URL}`);
});

// Handle incoming messages
ws.on('message', (data) => {
  console.log('Received message:', data);
  fileStream.write(data + '\nEndMessage\n');
});

// Handle WebSocket errors
ws.on('error', (err) => {
  console.error(`WebSocket error: ${err.message}`);
});

// Handle WebSocket closure
ws.on('close', () => {
  console.log('WebSocket connection closed.');
  fileStream.end();
});