let client;
var canvas,context;

window.addEventListener("load", init);

function init() {
    client = new Client();
    canvas = document.getElementById('cnv');
    context = canvas.getContext("2d");
    Example.slingshot();
}
