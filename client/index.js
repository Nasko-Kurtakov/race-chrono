const ws = new WebSocket("ws://localhost:8080");

let currentLap = null;
let winnerLapTime = null;

const lapTimes = document.getElementById("lapTimes");
const gaps = document.getElementById("gaps");

ws.onopen = () => {
  console.log("Connected to the WebSocket server");
};

obj = {}
delta = {}

ourTeam = "0";
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const { lap, driver, lapTime } = data;

  obj[driver] ||= { laps: [], avg: undefined, crossings: []}

  obj[driver].laps.push(lapTime)
  obj[driver].crossings.push(new Date() / 1)
  obj[driver].lastLap = lap;
  if (obj[driver].laps.length > 3){
    obj[driver].laps.shift()
    obj[driver].crossings.shift()
  }

  // console.log(obj);
  teams = Object.keys(obj);
  teams.forEach(team => {
    teamLaps = obj[team].laps;

    if (teamLaps) {
      obj[team].avg = teamLaps.reduce((total, num) => total + num, 0) / teamLaps.length;
    }
    if (team !== ourTeam) {
      delta[team] ||= {}

      teamCrossing = obj[team].crossings[obj[team].crossings.length - 1]
      ourTeamCrossing = obj[ourTeam].crossings[obj[team].crossings.length - 1]
      delta[team]["last"] =  teamCrossing - ourTeamCrossing
      gosho(team, delta[team]["last"], obj[team].laps[obj[team].laps.length - 1] - obj[ourTeam].laps[obj[ourTeam].laps.length - 1], 0);
    }

  })
  console.log(data);


  debugger;
  // console.log(delta)
  // console.log(teams)

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

const gosho = (teamId, delta, lastLap, lastThreeLaps) => {
  const teamRow = document.getElementById(`${teamId}`);
  // Name
  teamRow.children[0].innerText = teamId;

  teamRow.children[1].innerText = lastLap;
  teamRow.children[2].innerText = lastThreeLaps;
  teamRow.children[3].innerText = delta;

}
