const express = require('express');         // load the express module
const expressWs = require('express-ws');    // load the express-ws module

let wss = expressWs(express()); // websocket server
let app = wss.app;  // express app
let clients = wss.getWss().clients; // the websocket server's set of clients

let DATA = {};          // all the players data, keyed by playerId
let maxConnections = 2; // the maximum number of client websocket connections
                        // that we want to allow at a time

// express middleware to potentially redirect the http request
function later(req,resp,next) {
    let readyClients = 0;
    // Some client websocket connections may be closed but
    // still in the set so don't count them.
    clients.forEach(function(client) {
        if (client.readyState === 1)
            readyClients++;
    });
    // If we already have the maximum number of websocket connections
    if(readyClients >= maxConnections) {
        req.url = 'later.html';     // redirect the http request
        }
    next(); // continue to the express static middleware
}

// If the request is for "/" or "/index.html" and there are already
// maxConnections, redirect the request
app.get("/", later);
app.get("/index.html", later);

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
    clients.forEach(function(client) {
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
