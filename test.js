var Launchpadder = require("./launchpadder");

// The 0 represents the MIDI port to connect with
var pad = new Launchpadder.Launchpad(0)

pad.on("press", function(button) {
    button.light();
    console.log(button + " was pressed");
});

pad.on("release", function(button) {
    button.dark();
    console.log(button + " was released");
});
