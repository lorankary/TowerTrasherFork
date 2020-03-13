let client;

function setup() {
    client = new Client();
    createCanvas(500, 500).position((windowWidth-width)/2, 30);

    // Use an XMLHttpRequest instance to get a particular json file
    var xhr = new XMLHttpRequest();
    // "load" event handler
    xhr.addEventListener("load", function() {
        let resp = xhr.response;    // an object parsed from json
        if(resp){
            // show json in document body
            document.body.appendChild(document.createTextNode(JSON.stringify(resp)));
            for(let i = 0; i < resp.bodies.length; i++) {
                // create a matter.js body and add to the matter.js world
                console.log(resp.bodies[i]);
            }
        }
    })
    xhr.open("GET",
        location.protocol + "//" + document.domain + ":" + location.port
        + "/" + "bodies.json");
    xhr.responseType = "json";  // xhr.response will be parsed from json
    xhr.send();                 // initiate the request
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
