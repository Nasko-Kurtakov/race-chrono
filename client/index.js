
obj = {}

const dynamicSetUpTable = (badTeams, comparisons) => {
  const teamToName = {
    "r60365": "EURORACING ASD",
    "r60364": "SUNLIFE RACING TEAM",
    "r60363": "K R T",
    "r60366": "CARLONI RACING",
    "r60357": "PAGG ASPOCK",
    "r60353": "RACING PRODUCT",
    "r60370": "ANTHER RACING",
    "r60375": "PFV",
    "r60372": "RACING PRODUCT ZETA",
    "r60362": "CARRSERVICE EURORACING",
    "r60360": "MENEGHINO RACING TEAM",
    "r60373": "HOBIE KART",
    "r60351": "RACING GIRLS",
    "r60358": "TM KART RACING",
    "r60355": "MARMITTE BOLLENTI",
    "r60352": "VSANTOS TEAM",
    "r60368": "CARLONI RACING 3",
    "r60367": "CARLONI RACING 2",
    "r60359": "TM KART RACING 2",
    "r60369": "KEEPING ASPHALT RACING",
    "r60356": "KEC MOTORSPORT",
    "r60371": "J-TEAM",
    "r60361": "MSV RACING",
    "r60354": "RP ERBA PIU' ACADEMY",
    "r60374": "TEAM TOSCANO RACING TRIVENETO",
    "r60376": "THE LOST TEAM"
  }

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

    const td = document.createElement('td');
    tr.appendChild(td);
    td.innerText = teamToName[team];

    comparisons.forEach(c => {
      const td = document.createElement('td');
      tr.appendChild(td);
      td.id = `${team}_last_${c}`
    })
    tableBody.appendChild(tr);
  });
}

const timeStringToFloat = (timeString) => {
  const [minutes, seconds] = timeString.split(':');
  return parseFloat(minutes) * 60 + parseFloat(seconds);
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

  ourAvg = ourTeam.laps.slice(-n).reduce(sum, 0) / ourTeam.laps.slice(-n).length;
  theirAvg = theirTeam.laps.slice(-n).reduce(sum, 0) / theirTeam.laps.slice(-n).length;
  return (ourAvg - theirAvg).toFixed(3);
}

const updateTable = (team) => {
  if (team == ourTeam) {
    badTeams.forEach(team => {
      comparisons.forEach(c => {
        const time = compareLastNLaps(obj[ourTeam], obj[team], c);
        updateCell(team, c, time)
      })
    })
  } else {
    comparisons.forEach(c => {
      const time = compareLastNLaps(obj[ourTeam], obj[team], c);
      updateCell(team, c, time)
    })
  }
}

const updateCell = (team, c, time) => {
  if (isNaN(time)) {
    return;
  }
  const comparisonCell = document.getElementById(`${team}_last_${c}`);
  // Name
  comparisonCell.innerText = time;

  if (time > 0){
    comparisonCell.classList = "bg-warning";
  } else {
    comparisonCell.classList = "bg-success";
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


const comparisons = [1, 3, 5];
const badTeams = [
  "r60354",
  "r60357",
  "r60364",
  "r60353",
  "r60363",
  "r60360",
  "r60367",
  "r60368",
  "r60352",
  "r60370",
  "r60375",
  "r60372",
  "r60362",
  "r60373",
  "r60351",
  "r60366",
  "r60358",
  "r60356",
  "r60359",
  "r60355",
  "r60369",
  "r60371",
  "r60374",
  "r60376"];
const ourTeam = "r60361";
const allTeams = [ourTeam, ...badTeams];

// MAIN
//

const ws = new WebSocket("ws://www.apex-timing.com:8182")

ws.onopen = () => {
  console.log("Connected to the WebSocket server");
};
allTeams.forEach(team => {
  obj[team] = { laps: [] }
})

ws.onmessage = (event) => {
  if(event.data.includes(mapping["lastLap"]) && allTeams.some(team => event.data.includes(team))) {
    allTeams.forEach(team => {
      teamLastLap = getLastLapForTeam(team, event.data.split("\n"));
      if (teamLastLap){
        obj[team].laps.push(teamLastLap)
        updateTable(team);
      }
    })
  }
}

dynamicSetUpTable(badTeams, comparisons);