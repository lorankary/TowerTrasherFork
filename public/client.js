class Client {
    constructor(url = "//" + document.domain + ":" + location.port + "/ws") {
        // deals with compatibility between secured and unsecured websockets
        if (url[0] !== "w") {
            if (location.protocol === "https") url = "wss:" + url;
            else url = "ws:" + url;
        }

        this.id = "";
        this.data = {};

        this.x = 250;
        this.y = 250;
        this.color = "#";

        // open a websocket connection to the server
        this.ws = new WebSocket(url);

        // set up to handle the one-time open event
        this.ws.onopen = () => {
            // In arrow functions, the value of 'this' is the value that it
            // had when the function was defined.  In this case that would be the
            // client instance.  Otherwise if not an arrow function it would
            // have been the target of the event which is the websocket.
            let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
            for (let i = 0; i < 8; i++) this.id += possible.charAt(Math.random() * possible.length);
            for (let i = 0; i < 3; i++) this.color += (Math.floor(Math.random() * 255)).toString(16);
        };

        // set up to handle the message event
        this.ws.onmessage = event => {  // arrow function so 'this' is the client instance
            let msg = JSON.parse(event.data);
            switch(msg.type) {
                case "allPlayerData":
                this.data = msg.playerData;
                break;
            }
        }
    }

    // send this client (player) data to the server
    sendPlayerData() {
        if (this.ws.readyState !== 1) return;
        this.ws.send(JSON.stringify({
            type: "playerData",
            id: this.id,
            location: {
                x: this.x,
                y: this.y
            },
            color: this.color
        }));
    }

    getPlayers() {
        if (this.ws.readyState !== 1) return {};
        return this.data;
    }
}
