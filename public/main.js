let client;

function setup() {
    client = new Client();
    let cnv = createCanvas(500, 500);
    cnv.canvas.style.margin = "20px";

    // Use an XMLHttpRequest instance to get a particular json file
    var xhr = new XMLHttpRequest();
    // "load" event handler
    xhr.addEventListener("load", function() {
        let resp = xhr.response;    // an object parsed from json
        if(resp){
            let debug = true;
            if(debug) {
                // purely as a visual aid to determine that the request to load
                // the json has succeeded, show the json in the document body
                let p = document.createElement("p");    // <p> element
                p.appendChild(document.createTextNode(JSON.stringify(resp)));
                document.body.appendChild(p);
            }
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
