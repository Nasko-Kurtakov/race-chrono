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

  writeDownLapRecord(lap, lapTime, driver);
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
  lapTimeElement.textContent = `Lap ${lapNumber} - ${driver}: ${lapTime}`;
  lapTimes.appendChild(lapTimeElement);
};

const writeDownGap = (lap, gap) => {
  const gapElement = document.createElement("li");
  gapElement.textContent = `Lap ${lap} - Gap: ${gap}s`;
  gaps.appendChild(gapElement);
};
