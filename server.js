const express = require('express');         // load the express module
const expressWs = require('express-ws');    // load the express-ws module

let wss = expressWs(express()); // websocket server
let app = wss.app;  // express app

let DATA = {};  // all the players data, keyed by playerId

// serve all the static (client) files in the public folder over http
app.use(express.static("./public"));

// handle new websocket connection initiations
app.ws("/ws", function(ws, req) {
    let ID;

    // a new client connection has been received on websocket ws
    ws.on("message", function(msg) {
        let decoded = JSON.parse(msg);

        switch (decoded.type) {
            case "playerData":
                // stash the playerId in the websocket
                ID = decoded.id;
                DATA[decoded.id] = {
                    location: decoded.location,
                    color: decoded.color
                };
        }
    });

    // When the connection for a player closes, delete that player's data
    ws.on("close", function() {
        delete DATA[ID];
    });

    ws.on("error", function() {
        console.log("websocket error on ", this);
        delete DATA[ID];
    });
});

// Every 15ms push all the player data to each of the clients
setInterval(function() {
    wss.getWss().clients.forEach(function(client) {
        if (client.readyState === 1) {
            client.send(JSON.stringify({
                type: "allPlayerData",
                playerData:DATA
            }));
        }}, 15);
    });

// start the http server listening
const PORT = process.env.PORT || 8080;
app.listen(PORT, function() {
	console.log(`[+] Listening on ${PORT}`);
});
