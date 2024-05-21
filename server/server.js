const WebSocket = require("ws");

const WS_PORT = 8080;
const wss = new WebSocket.Server({ port: WS_PORT });

const START_GAP = 15; // in seconds
const LAP_COUNT = 10;

// Function to generate a random lap time between min and max seconds
function generateLapTime(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(3);
}

const winnerTimes = Array.from({ length: LAP_COUNT }, () =>
  generateLapTime(50, 52)
);
const loserTimes = Array.from({ length: LAP_COUNT }, () =>
  generateLapTime(51, 53)
);

wss.on("connection", (ws) => {
  console.log("New client connected");

  let lapIndex = 0;

  const sendLapTimes = () => {
    if (lapIndex < LAP_COUNT) {
      const winnerLapTime = winnerTimes[lapIndex];
      const loserLapTime = loserTimes[lapIndex];
      const lap = lapIndex + 1;
      const gapInSeconds = Math.abs(winnerLapTime - loserLapTime);

      // Gaidov's lap time
      const winnerData = {
        lap,
        driver: "Gaidov",
        lapTime: winnerLapTime,
      };

      sendData(ws, JSON.stringify(winnerData));

      // Nasko's lap time after the calculated gap
      setTimeout(() => {
        const loserData = {
          lap,
          driver: "Nasko",
          lapTime: loserLapTime,
        };

        sendData(ws, JSON.stringify(loserData));
        verboseLog(gapInSeconds);
        lapIndex += 1;

        // Schedule the next lap times to be sent
        if (lapIndex < LAP_COUNT) {
          setTimeout(sendLapTimes, 3000); // Wait before starting the next lap for simplicity
        } else {
          verboseLog("Race completed");
          ws.close();
        }
      }, gapInSeconds * 1000 + (lapIndex == 0 ? START_GAP * 1000 : 0)); // Delay based on the lap time gap
    }
  };

  // Start sending lap times
  sendLapTimes();

  // Handle client disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(intervalId);
  });
});

console.log(`WebSocket server is running on ws://localhost:${WS_PORT}`);

const verboseLog = () => console.log(...arguments);

const sendData = (ws, data) => {
  verboseLog(data);
  ws.send(data);
};
