var launchpad = require("./launchpadder");

var pad = new launchpad.Launchpad(0);

pad.on("press", function(button) {
    console.log("Button pressed!");
});

pad.on("release", function(button) {
    console.log("Button released!");
});
