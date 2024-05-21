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

// wss.on("connection", (ws) => {
//   console.log("New client connected");

//   let lapIndex = 0;

//   const sendLapTimes = () => {
//     if (lapIndex < LAP_COUNT) {
//       const winnerLapTime = winnerTimes[lapIndex];
//       const loserLapTime = loserTimes[lapIndex];
//       const lap = lapIndex + 1;
//       const gapInSeconds = Math.abs(winnerLapTime - loserLapTime);

//       // Gaidov's lap time
//       const winnerData = {
//         lap,
//         driver: "Gaidov",
//         lapTime: winnerLapTime,
//       };

//       sendData(ws, JSON.stringify(winnerData));

//       // Nasko's lap time after the calculated gap
//       setTimeout(() => {
//         const loserData = {
//           lap,
//           driver: "Nasko",
//           lapTime: loserLapTime,
//         };

//         sendData(ws, JSON.stringify(loserData));
//         verboseLog(`current gap is ${gapInSeconds}`);
//         lapIndex += 1;

//         // Schedule the next lap times to be sent
//         if (lapIndex < LAP_COUNT) {
//           setTimeout(sendLapTimes, 3000); // Wait before starting the next lap for simplicity
//         } else {
//           verboseLog("Race completed");
//           ws.close();
//         }
//       }, (lapIndex == 0 ? START_GAP : gapInSeconds) * 1000); // Delay based on the lap time gap

//       setTimeout(() => {}, (lapIndex == 0 ? START_GAP : gapInSeconds) * 1000);
//     }
//   };

//   // Start sending lap times
//   sendLapTimes();

//   // Handle client disconnection
//   ws.on("close", () => {
//     console.log("Client disconnected");
//   });
// });

wss.on("connection", (ws) => {
  console.log("New client connected");

  const drivers = [
    { name: "Gaidov", lapTimes: createLapTimes(50, 52) },
    { name: "Nasko", lapTimes: createLapTimes(52, 53) },
    { name: "Bosho rosso driver", lapTimes: createLapTimes(53, 54) },
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

const makeALap2 = (drivers, lapIndex, ws, finishLap) => {
  const lap = lapIndex + 1;
  drivers.forEach((driver, index) => {
    let gap;
    let delay;
    if (index == 0) {
      //this is the first driver
      //its gap is 0, as he has noone in front of him
      gap = 0;
      delay = 0;
    } else {
      gap = drivers[index - 1].lapTimes[lapIndex] - driver.lapTimes[lapIndex];
      delay = Math.abs((lapIndex === 0 ? START_GAP : gap) * 1000);
    }

    setTimeout(() => {
      const driverData = {
        lap,
        driver: driver.name,
        lapTime: driver.lapTimes[lapIndex], // Handle missing lap times
      };

      sendData(ws, JSON.stringify(driverData));
      verboseLog(`current gap for ${driver.name} is ${gap}`);

      if (index == drivers.length - 1) {
        //this is the last driver in the pack so this lap is finished
        finishLap();
      }
    }, delay);
  });
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
      driver: driver.name,
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
