const ws = new WebSocket("ws://localhost:8080");

let currentLap = null;
let winnerLapTime = null;

const lapTimes = document.getElementById("lapTimes");
const gaps = document.getElementById("gaps");

ws.onopen = () => {
  console.log("Connected to the WebSocket server");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  const { lap, driver, lapTime } = data;

  if (driver === "Gaidov") {
    currentLap = lap;
    winnerLapTime = lapTime;

    writeDownLapRecord(lap, lapTime, "Gaidov");
  } else if (driver === "Nasko" && currentLap === lap) {
    writeDownLapRecord(lap, lapTime, "Nasko");

    const gap = (winnerLapTime - lapTime).toFixed(3);
    writeDownGap(lap, gap);
  }
};

ws.onclose = () => {
  if (data === "Race completed") {
    const raceCompletedElement = document.createElement("li");
    raceCompletedElement.textContent = "Race completed";
    lapTimes.appendChild(raceCompletedElement);
    gaps.appendChild(raceCompletedElement.cloneNode(true));
    return;
  }
  console.log("Disconnected from the WebSocket server");
};

const writeDownLapRecord = (lapNumber, lapTime, driver) => {
  const lapTimeElement = document.createElement("li");
  lapTimeElement.textContent = `Lap ${lapNumber} - ${driver}: ${lapTime}s`;
  lapTimes.appendChild(lapTimeElement);
};

const writeDownGap = (lap, gap) => {
  const gapElement = document.createElement("li");
  gapElement.textContent = `Lap ${lap} - Gap: ${gap}s`;
  gaps.appendChild(gapElement);
};
