const WebSocket = require("ws");

const WS_PORT = 8080;
const wss = new WebSocket.Server({ port: WS_PORT });

const START_GAP = 15; // in seconds
const LAP_COUNT = 1000;
const COMPETITORS = 2;
// Function to generate a random lap time between min and max seconds
function generateLapTime(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(3);
}

wss.on("connection", (ws) => {
  console.log("New client connected");

  const sendLapTimes = (lap, teamId) => {
    console.log("in sendLapTimes");
    const data = {
      lap,
      driver: teamId,
      lapTime: teamId == 0 ? 5 : 4,
    };
    console.log(data.lapTime);

    setTimeout(() => {
      sendCount++;
      sendData(ws, JSON.stringify(data));

      if (sendCount != 20) {
        sendLapTimes(lap + 1, teamId);
      } else {
        ws.close();
      }
    }, data.lapTime * 1000);
  };

  sendCount = 0;
  for (let index = 0; index < COMPETITORS; index++) {
    sendLapTimes(1, index);
  }
});

// Handle client disconnection
// ws.on("close", () => {
//   console.log("Client disconnected");
//   clearInterval(intervalId);
// });

console.log(`WebSocket server is running on ws://localhost:${WS_PORT}`);

const sendData = (ws, data) => {
  // verboseLog(data);
  ws.send(data);
};
