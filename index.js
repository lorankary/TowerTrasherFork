// Import main express library
const express = require('express');
const expressWs = require('express-ws');
const PORT = process.env.PORT || 8080;

// Create express app and websockets middleware
let websocketServer = expressWs(express());
let app = websocketServer.app;

// console.log(websocketServer.getWss());

// Data storage
let DATA = {};

// Set static directory (put index.html and whatnot in here)
app.use(express.static('public'));

// A new client has just connected with Websocket ws
app.ws('/ws', function(ws, req) {
    let playerID;

    // show the clients
    // console.log(websocketServer.getWss().clients);

    // Set up this websocket to handle events
    // On message event
    ws.on('message', function(msg) {
        let decoded = JSON.parse(msg);

        switch (decoded.type) {
            // Save player's data
            case 1:
                playerID = decoded.id;
                DATA[decoded.id] = {
                    x: decoded.coordinates.x,
                    y: decoded.coordinates.y,
                    z: decoded.coordinates.z,
                    orientation: decoded.orientation,
                    other: decoded.other
                };
                break;

            // Send back all data
            case 3:
                ws.send(JSON.stringify(DATA));
                break;
        }
    });

    // On close event
    ws.on('close', function() {
        delete DATA[playerID];
    });
});

// let host = process.env.MMOS_HOST || "localhost";
// let port = parseInt(process.env.MMOS_PORT) || 8080;

console.log("process.env.HOST " + process.env.HOST);
console.log("process.env.PORT " + process.env.PORT);

app.listen(PORT, function() {
	console.log(`[+] Listening on ${PORT}`);
});
