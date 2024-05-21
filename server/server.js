const WebSocket = require("ws");

const WS_PORT = 8080;
const wss = new WebSocket.Server({ port: WS_PORT });

const START_GAP = 5; // in seconds
const LAP_COUNT = 10;

// Function to generate a random lap time between min and max seconds
function generateLapTime(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(3);
}

const createLapTimes = (min, max) =>
  Array.from({ length: LAP_COUNT }, () => generateLapTime(min, max));

wss.on("connection", (ws) => {
  console.log("New client connected");

  const drivers = [
    { name: "Lacrima", lapTimes: createLapTimes(50, 52) },
    { name: "YCT", lapTimes: createLapTimes(52, 53) },
    { name: "Bosho Rosso", lapTimes: createLapTimes(53, 54) },
  ];

  let lapIndex = 0;

  const sendLapTimes = (i) => {
    makeALap(drivers, i, ws, 0, () => {
      if (i + 1 == LAP_COUNT) {
        verboseLog("Race completed");
        ws.close();
      } else {
        sendLapTimes(i + 1);
      }
    });
  };

  // Start sending lap times
  sendLapTimes(lapIndex);

  // Handle client disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server is running on ws://localhost:${WS_PORT}`);

const verboseLog = (data) => console.log(data);

const sendData = (ws, data) => {
  verboseLog(data);
  ws.send(data);
};

const makeALap = (drivers, lapIndex, ws, driverIndex, finishLap) => {
  const lap = lapIndex + 1;

  let gap;
  let delay;
  let driver = drivers[driverIndex];
  if (driverIndex == 0) {
    //this is the first driver
    //its gap is 0, as he has noone in front of him
    gap = 0;
    delay = 0;
  } else {
    // gap =
    // drivers[driverIndex - 1].lapTimes[lapIndex] - driver.lapTimes[lapIndex];
    delay = Math.abs((lapIndex === 0 ? START_GAP : gap) * 1000);
  }

  setTimeout(() => {
    const driverData = {
      lap,
      team: driver.name,
      lapTime: driver.lapTimes[lapIndex], // Handle missing lap times
    };

    sendData(ws, JSON.stringify(driverData));
    // verboseLog(`current gap for ${driver.name} is ${gap}`);

    if (driverIndex == drivers.length - 1) {
      //this is the last driver in the pack so this lap is finished
      finishLap();
      return;
    }

    makeALap(drivers, lapIndex, ws, driverIndex + 1, finishLap);
  }, delay);
};
