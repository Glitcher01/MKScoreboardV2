window.onload = init;
const fs = require('fs')
const path = require('path')
const mainPath = path.resolve(process.env.PORTABLE_EXECUTABLE_DIR, 'Resources');

var T1 = [null, null, null, null];
var T2 = [null, null, null, null];

function init() {
    T1 = [document.getElementById('T1I'), document.getElementById('T1N'), document.getElementById('T1P'), document.getElementById('T1S')];
    T2 = [document.getElementById('T2I'), document.getElementById('T2N'), document.getElementById('T2P'), document.getElementById('T2S')];
    document.getElementById('swap-button').addEventListener('click', swap);
    document.getElementById('update-button').addEventListener('click', update);
}

function swap() {
    if (T1.length != T2.length) {
        return;
    }
    for (let i = 0; i < T1.length; i++) {
        let temp = T1[i].value;
        T1[i].value = T2[i].value;
        T2[i].value = temp;
    }
}

function update() {
    let scoreJSON = {
        Team1I: T1[0].value,
        Team1N: T1[1].value,
        Team1P: T1[2].value == '' ? 0 : parseInt(T1[2].value),
        Team1S: T1[3].value == '' ? 0 : parseInt(T1[3].value),
        Team2I: T2[0].value,
        Team2N: T2[1].value,
        Team2P: T2[2].value == '' ? 0 : parseInt(T2[2].value),
        Team2S: T2[3].value == '' ? 0 : parseInt(T2[3].value),
        SetNum: document.getElementById('SN').value == '' ? 1 : parseInt(document.getElementById('SN').value),
        RaceNum: document.getElementById('RN').value == '' ? 1 : parseInt(document.getElementById('RN').value),
        SetsToWin: document.getElementById('SR').value == '' ? 1 : parseInt(document.getElementById('SR').value),
    };
    let data = JSON.stringify(scoreJSON, null, 2);
    fs.writeFileSync(mainPath + '/scoreboard.json', data);
}