obj = {}

const dynamicSetUp = (badTeams, ourTeam, comparisons) => {
  document.getElementById("theTr").innerHTML = "";

  document.getElementById("currentTeam").innerText = teams[ourTeam];
  document.getElementById("theTr").innerHTML=`<th style='width:500px'>Team Name</th>
  <th>Last Lap</th>`

  // All other headers
  comparisons.forEach(c => {
    const td = document.createElement("td");
    td.innerText = `Last ${c} laps`;
    document.getElementById("theTr").appendChild(td);
  })

  const tdDelta = document.createElement("td");
  tdDelta.innerText = `Delta On Track*`;
  document.getElementById("theTr").appendChild(tdDelta);

  const td = document.createElement("td");
  td.innerText = `On Track`;
  document.getElementById("theTr").appendChild(td);

  const tdLaps = document.createElement("td");
  tdLaps.innerText = `Laps`;
  document.getElementById("theTr").appendChild(tdLaps);

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

    const tdtimeOnTrack = document.createElement('td');
    tr.appendChild(tdtimeOnTrack);
    tdtimeOnTrack.id = `${team}_time_on_track`;

    const tdLaps = document.createElement('td');
    tr.appendChild(tdLaps);
    tdLaps.id = `${team}_laps_count`;

    tableBody.appendChild(tr);
  });

  allTeams().forEach(team => {
    updateTable(team);
  });
}

const timeStringToFloat = (timeString) => {
  const [left, right] = timeString.split(':');

  if (right){
    return parseFloat(left) * 60 + parseFloat(right);
  } else {
    return parseFloat(left);
  }
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
    console.log("Recording for ", team, " = ", lastLapLine, timeStringToFloat(lastLapLine[2]));
    return timeStringToFloat(lastLapLine[2]);
  }
}

const getLastOnTrackForTeam = (team, arrayOfData) => {
  const currentTeamLastLapKey = `${team}${mapping['timeOnTrack']}`;
  lastLapLine = arrayOfData.map(line => line.split("|")).filter(lineArr => lineArr[0] == currentTeamLastLapKey)[0];
  if (lastLapLine) {
    console.log("Recording for ", team, " = ", lastLapLine);
    return lastLapLine[2];
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
  const update = (team) => {
    comparisons.forEach(c => {
      const time = compareLastNLaps(ourTeam, team, c);
      updateCell(team, `last_${c}`, time);
    })
  }

  const deltaOnTrack = compareDeltaOnTrack(ourTeam, team);
  updateCell(team, 'delta_on_track', deltaOnTrack);

  updateCell(team, 'time_on_track', obj[team].timeOnTrack, false);
  updateCell(team, 'laps_count', obj[team].numberOfLaps, false);

  updateLastLapCell(team);


  if (team == ourTeam) {
    theBadTeams().forEach(team => {
      update(team)
    })
  } else {
    update(team)
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

  const oldValue = cell.innerHTML;
  cell.innerText = time;
  const newValue = cell.innerHTML;

  colorCellBasedOnTime(comparisonTime, cell);

  if (oldValue != newValue){
    cell.style.fontWeight = '900';
    document.getElementById(team).children[0].style.fontWeight = '900';
    setTimeout(() => {
        cell.style.fontWeight = 'normal';
        document.getElementById(team).children[0].style.fontWeight = 'normal';
    }, 5000);
  }


}


const colorCellBasedOnTime = (time, element) => {
  if (time == false){
  } else if(time > 0) {
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
  // "unknown": "c1",
  // "position": "c2",
  "name": "c6",
  // "nationality": "c5",

  "sector1": "c7",
  "sector2": "c8",
  // "sector3": "c9",
  // "interval": "c10",
  "lastLap": "c9",
  "fastestLap": "c10",
  "gap": "c11",
  "numberOfLaps": "c12",
  "timeOnTrack": "c13",
  "numberOfPits": "c14",
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
        const teamNameCell = row.querySelector(`td[data-id$="${mapping["name"]}"]`);
        const lastLapCell = row.querySelector(`td[data-id$="${mapping["lastLap"]}"]`);
        const timeOnTrackCell = row.querySelector(`td[data-id$="${mapping["timeOnTrack"]}"]`);
        const numberOfLapsCell = row.querySelector(`td[data-id$="${mapping["numberOfLaps"]}"]`);
        const gapCell = row.querySelector(`td[data-id$="${mapping["gap"]}"]`);



        // If both teamId and teamNameCell are present, add them to the map
        if (teamId) {
          obj[teamId] ||= { laps: [], crossings: [] }

          if (teamNameCell) {
            const teamName = teamNameCell.textContent.trim();
            teamMap[teamId.replace(mapping["name"])] = teamName;
          }

          if (lastLapCell) {
            obj[teamId].laps.push(timeStringToFloat(lastLapCell.innerText));
          }

          if (timeOnTrackCell) {
            obj[teamId].timeOnTrack = timeOnTrackCell.innerText;
          }

          if (numberOfLapsCell) {
            obj[teamId].numberOfLaps = numberOfLapsCell.innerText;
          }

        }
    });

    function generateCheckboxes(map) {
      const container = document.getElementById('checkbox-container');
      for (const [id, name] of Object.entries(map)) {
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = id;
          checkbox.name = name;
          checkbox.checked = true;

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
  const selectedTeamId = [];

  checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
          selectedTeamId.push(checkbox.id);
      }
  });

  return selectedTeamId;
}

function allTeams() {
  const checkboxes = document.querySelectorAll('#checkbox-container input[type="checkbox"]');
  const teamId = [];

  checkboxes.forEach(checkbox => {
    teamId.push(checkbox.id);
  });

  return teamId;
}

let ourTeam = "r125";

const ws = new WebSocket("ws://www.apex-timing.com:8912")

ws.onopen = () => {
  console.log("Connected to the WebSocket server");
};


ws.onmessage = (event) => {

  if (teams == undefined && event.data.includes("grid||")) {
    const grid = event.data.split("\n").filter( line => line.includes("grid||"))[0].split("|")[2];
    teams = parseTeamsFromMessage(grid);
    dynamicSetUp(theBadTeams(), ourTeam, comparisons);

  }

  if(event.data.includes(mapping["lastLap"])) {
    allTeams().forEach(team => {
      teamLastLap = getLastLapForTeam(team, event.data.split("\n"));
      if (teamLastLap){
        obj[team].laps.push(teamLastLap)
        obj[team].crossings.push(new Date())
        updateTable(team);
      }
    })
  }else if(event.data.includes(mapping["timeOnTrack"])) {
    allTeams().forEach(team => {
      teamTimeOnTrack = getLastOnTrackForTeam(team, event.data.split("\n"));
      if (teamTimeOnTrack) {
        obj[team].timeOnTrack = teamTimeOnTrack;
        updateTable(team);
      }
    })
  }


}