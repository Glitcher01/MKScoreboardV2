window.onload = init;
var setsRequired = 1;
var set_wins = [0, 0];
var match_info = [1, 1];
var fadeInTime = 0.3;
var fadeOutTime = 0.2;
let startup = true;
let lead = -1; // 0 if Team 1 leads, 1 if Team 2 leads
function init() {
    async function mainLoop() {
		const scInfo = await getInfo();
		getData(scInfo);
	}
    
	mainLoop();
	setInterval( () => { mainLoop(); }, 500); // Routinely checks for any updates to JSON file
}

function getInfo() {
	return new Promise(function (resolve) {
		const oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.open("GET", 'Resources/Scoreboard.json');
		oReq.send();

		//will trigger when file loads
		function reqListener () {
			resolve(JSON.parse(oReq.responseText))
		}
	})
	//i would gladly have used fetch, but OBS local files wont support that :(
}

async function getData(scInfo) {
    let Team1Elements = [document.getElementById('TIL'), document.getElementById('TNL'), document.getElementById('TSL')]
    let Team2Elements = [document.getElementById('TIR'), document.getElementById('TNR'), document.getElementById('TSR')]

    if (startup) {
        Team1Elements[0].textContent = scInfo['Team1I'];
        Team1Elements[1].textContent = scInfo['Team1N'];
        Team1Elements[2].innerHTML = "<p>" + scInfo['Team1P'] + "<p>";
        Team1Elements[2].setAttribute("scoreTo", scInfo['Team1P'])

        Team2Elements[0].textContent = scInfo['Team2I'];
        Team2Elements[1].textContent = scInfo['Team2N'];
        Team2Elements[2].innerHTML = "<p>" + scInfo['Team2P'] + "<p>";
        Team2Elements[2].setAttribute("scoreTo", scInfo['Team2P'])
        
        set_wins = [scInfo['Team1S'], scInfo['Team2S']];
        setsRequired = scInfo['SetsToWin']

        compareScores([Team1Elements[2], scInfo['Team1P']], [Team2Elements[2], scInfo['Team2P']])
        updateSets();
        updateRaceInfo([1, 1]);
        startup = false;
    }

    else {
        if (!(Team1Elements[0].textContent == scInfo['Team1I'] && Team1Elements[1].textContent == scInfo['Team1N'])) {
            updateTeams([Team1Elements[0], Team1Elements[1]], [scInfo['Team1I'], scInfo['Team1N']]);
        }

        if (!(Team2Elements[0].textContent == scInfo['Team2I'] && Team2Elements[1].textContent == scInfo['Team2N'])) {
            updateTeams([Team2Elements[0], Team2Elements[1]], [scInfo['Team2I'], scInfo['Team2N']]);
        }

        if (!(Team1Elements[2].getAttribute("scoreTo") == scInfo['Team1P'] && Team2Elements[2].getAttribute("scoreTo") == scInfo['Team2P'])) {
            compareScores([Team1Elements[2], scInfo['Team1P']], [Team2Elements[2], scInfo['Team2P']])
            if (Team1Elements[2].getAttribute("scoreTo") != scInfo['Team1P']) {
                updateScore(Team1Elements[2], scInfo['Team1P'])
            }
            if (Team2Elements[2].getAttribute("scoreTo") != scInfo['Team2P']) {
                updateScore(Team2Elements[2], scInfo['Team2P'])
            }
        }

        if (set_wins[0] != scInfo['Team1S'] || set_wins[1] != scInfo['Team2S'] || setsRequired != scInfo['SetsToWin']) {
            set_wins = [scInfo['Team1S'], scInfo['Team2S']];
            setsRequired = scInfo['SetsToWin']
            updateSets()
        }

        if(match_info[0] != parseInt(scInfo['SetNum']) || match_info[1] != parseInt(scInfo['RaceNum'])) {
            updateRaceInfo([scInfo['SetNum'], scInfo['RaceNum']]);
        }
    }
}

function compareScores(t1, t2) {
    if (t1[1] > t2[1] && lead != 0) {
        t1[0].style.animation ="transition-left-lead 1s forwards";
        if (lead == 1) {
            t2[0].style.animation = "transition-right-away 1s forwards";
        }
        lead = 0;
    }
    else if (t1[1] < t2[1] && lead != 1) {
        t2[0].style.animation = "transition-right-lead 1s forwards";
        if (lead == 0) {
            t1[0].style.animation = "transition-left-away 1s forwards";
        }
        lead = 1;
    }
    else if (t1[1] == t2[1] && lead == 0) {
        lead = -1;
        t1[0].style.animation = "transition-left-away 1s forwards";
    }
    else if (t1[1] == t2[1] && lead == 1) {
        t2[0].style.animation = "transition-right-away 1s forwards";
        lead = -1;
    }
}

function updateTeams(elements, data) {
    if (elements.length != data.length) {
        return;
    }
    for (let i = 0; i < elements.length; i++) {
        elements[i].textContent = data[i];
    }
}

async function updateScore(element, score) {
    element.setAttribute("scoreTo", score) // To avoid startTime being reset to null
    let startTime = null;
    let start = Number(element.textContent);
    let duration = 1000;
    const fn = (x) => {
        return 1 - (1 - x) * (1 - x);
    }
    const step = (timestamp) => {
        if (startTime == null) startTime = timestamp;
        const progress = Math.min((timestamp -  startTime) / duration, 1);
        element.innerHTML = element.innerHTML = "<p>" + (Math.floor((score - start) * fn(progress)) + start) + "<p>";
        console.log(progress)
        if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step)
    element.innerHTML = element.innerHTML = "<p>" + score + "<p>";
}

function updateRaceInfo(info) {
    match_info[0] = info[0];
    match_info[1] = info[1];
    document.getElementById('SN').textContent = 'Set ' + match_info[0];
    document.getElementById('RN').textContent = 'Race ' + match_info[1];
}

function updateSets() {
    var set_size = (100 - (setsRequired - 1) * 2) / setsRequired;
    let elements = document.querySelectorAll('.set-container');
    for (let i = 0; i < elements.length; i++) {
        elements[i].innerHTML = '';
        for (let j = 0; j < Math.min(set_wins[i], setsRequired); j++) {
            elements[i].innerHTML += "<div style='position: absolute; background: white; height: 10%; width: " + set_size + "%; top: 90%; left: " + (set_size + 2) * j + "%'></div>";    
        }
    }
}