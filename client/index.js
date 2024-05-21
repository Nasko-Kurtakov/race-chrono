const ws = new WebSocket("ws://localhost:8080");

let currentLap = null;
let winnerLapTime = null;

const lapTimes = document.getElementById("lapTimes");
const gaps = document.getElementById("gaps");

const friendlyTeamName = "YCT";
const enemyTeams = ["Lacrima", "Bosho Rosso"];

const enemyTeamsData = {};
let ourLatestTime = 0;

ws.onopen = () => {
  console.log("Connected to the WebSocket server");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  const { lap, team, lapTime } = data;

  if (team == friendlyTeamName) {
    ourLatestTime = Date.now();
  } else {
    enemyTeamsData[team] = {
      lap,
      lapTime,
    };
    updateGap(team, enemyTeamsData[team]);
  }

  writeDownLapRecord(lap, lapTime, team);
};

ws.onclose = () => {
  const raceCompletedElement = document.createElement("li");
  raceCompletedElement.textContent = "Race completed";
  lapTimes.appendChild(raceCompletedElement);
  gaps.appendChild(raceCompletedElement.cloneNode(true));

  console.log("Disconnected from the WebSocket server");
  return;
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

const updateGap = (teamName, raceData) => {
  const ellapsedTime = Date.now() - ourLatestTime; //gap between us crossing the finish line and this team crossing the finish line
  console.log(`Gap to team ${teamName} is: ${ellapsedTime / 1000.0} sec`);
};
