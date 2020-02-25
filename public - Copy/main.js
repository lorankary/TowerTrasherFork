let player, positions;
let multiplayer = new MMOC();
multiplayer.setOther("color", "#88aa44");

function update(jscolor) {
    multiplayer.setOther("color", "#" + jscolor);
}

function setup() {
    multiplayer.init();

    multiplayer.changeX(Math.floor(windowWidth/2));
    multiplayer.changeY(Math.floor(windowHeight/2));

    document.getElementById("modal").style.display = "block";
    document.getElementById("observer").onclick = function () {
        document.getElementById("modal").style.display = "none";
        player = false;
    };
    document.getElementById("player").onclick = function () {
        document.getElementById("modal").style.display = "none";
        player = true;
    };

    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.style("display", "block");
}

function draw() {
    background(255);
    if (player) {
        multiplayer.sendPlayerData();
        if (keyIsDown(87) || keyIsDown(38)) {
            multiplayer.changeY(-1);
        }
        if (keyIsDown(83) || keyIsDown(40)) {
            multiplayer.changeY(1);
        }
        if (keyIsDown(65) || keyIsDown(37)) {
            multiplayer.changeX(-1);
        }
        if (keyIsDown(68) || keyIsDown(39)) {
            multiplayer.changeX(1);
        }
    }

    let players = multiplayer.getPlayers();
    for (let player in players) {
        let color = players[player]["other"]["color"];
        fill(color);
        let x = players[player]["x"];
        let y = players[player]["y"];
        ellipse(x, y, 20);
    }
}
