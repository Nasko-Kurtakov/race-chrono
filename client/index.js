
obj = {}

const dynamicSetUp = (badTeams, ourTeam, comparisons) => {
  document.getElementById("theTr").innerHTML = "";

  document.getElementById("currentTeam").innerText = teams[ourTeam];
  document.getElementById("theTr").innerHTML=`<th>Team Name</th>
  <th>Last Lap</th>`

  // All other headers
  comparisons.forEach(c => {
    const td = document.createElement("td");
    td.innerText = `Last ${c} laps`;
    document.getElementById("theTr").appendChild(td);
  })

  // The table body for each team
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = "";
  badTeams.forEach(team => {
    const tr = document.createElement('tr');
    tr.id = team;

    const tdName = document.createElement('td');
    tr.appendChild(tdName);
    tdName.innerText = teams[team];

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

  allTeams.forEach(team => {
    updateTable(team);
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
        updateCell(team, `last_${c}`, time);

        const deltaOnTrack = compareDeltaOnTrack(ourTeam, team);
        updateCell(team, 'delta_on_track', deltaOnTrack);

      })
    })
  } else {
    comparisons.forEach(c => {
      const time = compareLastNLaps(ourTeam, team, c);
      updateCell(team, `last_${c}`, time);

      const deltaOnTrack = compareDeltaOnTrack(ourTeam, team);
      updateCell(team, 'delta_on_track', deltaOnTrack);

    })
  }
}

const updateCell = (team, cellSuffix, time, comparisonTime = time) => {

  if ((typeof(time) == "number" && isNaN(time)) || time == false || time == "NaN") {
    return;
  }

  const cell = document.getElementById(`${team}_${cellSuffix}`);
  if (cell == undefined) {
    return;
  }

  cell.innerText = time;

  colorCellBasedOnTime(comparisonTime, cell);
}


const colorCellBasedOnTime = (time, element) => {
  if ( time > 0) {
    element.classList = "bg-warning";
  } else {
    element.classList = "bg-success";
  }
}

const updateLastLapCell = (team) => {
  const lastLap = obj[team].laps.slice(-1)[0];
  const secondToLastLap = obj[team].laps.slice(-2)[0];
  const timeDifference = lastLap - secondToLastLap;
  if (lastLap) {

    updateCell(team, 'last_lap', floatToTimeString(lastLap), timeDifference);
  }
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

// Parsing from first message
//
const parseTeamsFromMessage = (htmlMessage) => {
    // Create a DOM parser
    const parser = new DOMParser();
    // Parse the HTML message
    const doc = parser.parseFromString(`<table>${htmlMessage}</table>`, 'text/html');

    // Get all rows in the table
    const rows = doc.querySelectorAll('tr');

    // Initialize an empty map to store teamId: Team Name pairs
    const teamMap = {};

    // Iterate over each row
    rows.forEach(row => {

        // Get the team ID from the row's data-id attribute
        const teamId = row.getAttribute('data-id');

        // Get the Team Name from the <td> with data-id="*c4"
        const teamNameCell = row.querySelector('td[data-id$="c4"]');

        // If both teamId and teamNameCell are present, add them to the map
        if (teamId && teamNameCell) {
            const teamName = teamNameCell.textContent.trim();
            teamMap[teamId.replace(mapping["name"])] = teamName;
        }
    });

    // debugger
    function generateCheckboxes(map) {
      const container = document.getElementById('checkbox-container');
      for (const [id, name] of Object.entries(map)) {
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = id;
          checkbox.name = name;

          const label = document.createElement('label');
          label.htmlFor = id;
          label.appendChild(document.createTextNode(name));

          const br = document.createElement('br');

          container.appendChild(checkbox);
          container.appendChild(label);
          container.appendChild(br);
      }
    }

    generateCheckboxes(teamMap);

    return teamMap;
}


let teams;
const comparisons = [1, 3, 5];


function theBadTeams() {
  const checkboxes = document.querySelectorAll('#checkbox-container input[type="checkbox"]');
  const checkedCheckboxes = [];

  checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
          checkedCheckboxes.push(checkbox.id);
      }
  });

  return checkedCheckboxes;
}

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
  if (teams == undefined && event.data.includes("grid||")) {
    const grid = event.data.split("\n").filter( line => line.includes("grid||"))[0].split("|")[2];
    teams = parseTeamsFromMessage(grid);
    dynamicSetUp(theBadTeams(), ourTeam, comparisons);
  }

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