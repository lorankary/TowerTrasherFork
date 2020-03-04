let client;

function setup() {
    client = new Client();
    createCanvas(500, 500).position((windowWidth-width)/2, 30);
}

function draw() {
    background(0);
    client.sendPlayerData();

    let players = client.getPlayers();
    for (let b in players) {
        Ball(players[b].location.x, players[b].location.y, players[b].color);
    }
}

function keyPressed() {
    switch (keyCode) {
        case LEFT_ARROW:
            client.x -= 5;
            break;
        case RIGHT_ARROW:
            client.x += 5;
            break;
        case UP_ARROW:
            client.y -= 5;
            break;
        case DOWN_ARROW:
            client.y += 5;
            break;
    }
}
