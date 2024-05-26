
obj = {}

const dynamicSetUp = (badTeams, ourTeam, comparisons,) => {
  const teamToName = {
    "r60365": "EURORACING ASD",
    "r60364": "SUNLIFE RACING TEAM",
    "r60357": "PAGG ASPOCK",
    "r60370": "ANTHER RACING",

    "r60363": "K R T",
    "r60375": "PFV",


    "r60372": "RACING PRODUCT ZETA",
    "r60362": "CARRSERVICE EURORACING",
    "r60373": "HOBIE KART",
    "r60351": "RACING GIRLS",
    "r60355": "MARMITTE BOLLENTI",
    "r60368": "CARLONI RACING 3",
    "r60359": "TM KART RACING 2",
    "r60369": "KEEPING ASPHALT RACING",
    "r60371": "J-TEAM",
    "r60361": "MSV RACING",
    "r60374": "TEAM TOSCANO RACING TRIVENETO",
    "r60376": "THE LOST TEAM",

    "r60367": "CARLONI RACING 2",
    "r60356": "KEC MOTORSPORT",

    "r60366": "CARLONI RACING",
    "r60353": "RACING PRODUCT",
    "r60360": "MENEGHINO RACING TEAM",

    "r60352": "VSANTOS TEAM",
    "r60358": "TM KART RACING",
    "r60354": "RP ERBA PIU' ACADEMY",
  }

  document.getElementById("currentTeam").innerText = teamToName[ourTeam];

  // All other headers
  comparisons.forEach(c => {
    const td = document.createElement("td");
    td.innerText = `Last ${c} laps`;
    document.getElementById("theTr").appendChild(td);
  })

  // The table body for each team
  const tableBody = document.getElementById('tableBody');
  badTeams.forEach(team => {
    const tr = document.createElement('tr');
    tr.id = team;

    const tdName = document.createElement('td');
    tr.appendChild(tdName);
    tdName.innerText = teamToName[team];

    const tdLastLap = document.createElement('td');
    tr.appendChild(tdLastLap);
    tdLastLap.id = `${team}_last_lap`;

    comparisons.forEach(c => {
      const td = document.createElement('td');
      tr.appendChild(td);
      td.id = `${team}_last_${c}`;
    })

    const tdDelta = document.createElement('td');
    tr.appendChild(tdDelta);
    tdDelta.id = `${team}_delta_on_track`;

    tableBody.appendChild(tr);
  });
}

const timeStringToFloat = (timeString) => {
  const [minutes, seconds] = timeString.split(':');
  return parseFloat(minutes) * 60 + parseFloat(seconds);
}

function floatToTimeString(floatSeconds) {
  // Calculate minutes and remaining seconds
  const minutes = Math.floor(floatSeconds / 60);
  const seconds = (floatSeconds % 60).toFixed(3);

  // Format the minutes and seconds to always have two digits for minutes and at least two for seconds
  const formattedMinutes = String(minutes).padStart(1, '0');
  const formattedSeconds = String(seconds).padStart(6, '0'); // This ensures the decimal part is properly aligned

  return `${formattedMinutes}:${formattedSeconds}`;
}

const getLastLapForTeam = (team, arrayOfData) => {
  const currentTeamLastLapKey = `${team}${mapping['lastLap']}`;
  lastLapLine = arrayOfData.map(line => line.split("|")).filter(lineArr => lineArr[0] == currentTeamLastLapKey)[0];
  if (lastLapLine) {
    console.log("Recording for ", team, " = ", lastLapLine);
    return timeStringToFloat(lastLapLine[2]);
  }
}

const compareLastNLaps = (ourTeam, theirTeam, n) => {
  sum = (acc, curr) => { return acc + curr }

  ourAvg = obj[ourTeam].laps.slice(-n).reduce(sum, 0) / obj[ourTeam].laps.slice(-n).length;
  theirAvg = obj[theirTeam].laps.slice(-n).reduce(sum, 0) / obj[theirTeam].laps.slice(-n).length;
  return (ourAvg - theirAvg).toFixed(3);
}

let compareDeltaOnTrack = (ourTeam, theirTeam) => {
  theirAvg = obj[theirTeam].crossings.slice(-1)[0] / 1;
  ourAvg = obj[ourTeam].crossings.slice(-1)[0] / 1;
  let delta = ((ourAvg - theirAvg) / 1000).toFixed(3);

  if (Math.abs(delta) > obj[ourTeam].laps.slice(-1)[0]/2) {
    return false;
  }

  delta = ((ourAvg - theirAvg) / 1000).toFixed(3);

  return delta;
}

let updateTable = (team) => {

  updateLastLapCell(team);
  if (team == ourTeam) {
    badTeams.forEach(team => {
      comparisons.forEach(c => {
        const time = compareLastNLaps(ourTeam, team, c);
        updateComparisonsCell(team, c, time);
        const deltaOnTrack = compareDeltaOnTrack(ourTeam, team);
        if (deltaOnTrack !== false) {

          updateDelta(team, deltaOnTrack);
        }
      })
    })
  } else {
    comparisons.forEach(c => {
      const time = compareLastNLaps(ourTeam, team, c);
      updateComparisonsCell(team, c, time);
      const deltaOnTrack = compareDeltaOnTrack(ourTeam, team);
      if (deltaOnTrack !== false) {
        updateDelta(team, deltaOnTrack);
      }
    })
  }
}

const updateComparisonsCell = (team, c, time) => {
  if (isNaN(time)) {
    return;
  }
  const comparisonCell = document.getElementById(`${team}_last_${c}`);
  comparisonCell.innerText = time;

  colorCellBasedOnTime(time, comparisonCell)
}

const colorCellBasedOnTime = (time, element) => {
  if ( time > 0) {
    element.classList = "bg-warning";
  } else {
    element.classList = "bg-success";
  }
}

const updateLastLapCell = (team) => {
  const lastLapCell = document.getElementById(`${team}_last_lap`);
  // Name

  const lastLap = obj[team].laps.slice(-1)[0];
  const secondToLastLap = obj[team].laps.slice(-2)[0];

  lastLapCell.innerText = floatToTimeString(lastLap);

  colorCellBasedOnTime(lastLap - secondToLastLap, lastLapCell);
}

const updateDelta = (team, time) => {
  if (isNaN(time)) {
    return;
  }
  const deltaCell = document.getElementById(`${team}_delta_on_track`);
  deltaCell.innerText = time;

  colorCellBasedOnTime(time, deltaCell)
}

// Config


const mapping = {
  "unknown": "c1",
  "position": "c2",
  "name": "c4",
  "nationality": "c5",

  "sector1": "c7",
  "sector2": "c8",
  "sector3": "c9",
  "interval": "c10",
  "lastLap": "c11",
  "gap": "c12",
  "fastestLap": "c13",
  "drivenTime": "c14"
};


const comparisons = [1, 3, 5];

let ourTeam = "r60359";
let badTeams = ["r60352"];
if (window.location.href.includes("s1")) {
  badTeams = ["r60359"];
  ourTeam = "r60352";
}

badTeams = [
"r60365",
"r60364",
"r60357",
"r60370",
"r60363",
"r60375",
"r60372",
"r60362",
"r60373",
"r60351",
"r60355",
"r60368",
"r60359",
"r60369",
"r60371",
"r60361",
"r60374",
"r60376",
"r60367",
"r60356",
"r60366",
"r60353",
"r60360",
"r60352",
"r60358",
"r60354",
]
badTeams.push(ourTeam);
const allTeams = Array.from(new Set([ourTeam, ...badTeams]));

// MAIN
//

const ws = new WebSocket("ws://www.apex-timing.com:8182")

ws.onopen = () => {
  console.log("Connected to the WebSocket server");
};

allTeams.forEach(team => {
  obj[team] = { laps: [], crossings: [] }
})

ws.onmessage = (event) => {
  if(event.data.includes(mapping["lastLap"]) && allTeams.some(team => event.data.includes(team))) {
    allTeams.forEach(team => {
      teamLastLap = getLastLapForTeam(team, event.data.split("\n"));
      if (teamLastLap){
        obj[team].laps.push(teamLastLap)
        obj[team].crossings.push(new Date())
        updateTable(team);
      }
    })
  }
}

dynamicSetUp(badTeams, ourTeam, comparisons);