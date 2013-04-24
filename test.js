var launchpadder = require("./launchpadder").Launchpad;
var color = require("./launchpadder").Color;

// The 0 represents the MIDI port to connect with
// The 1 represents the MIDI output-port to connect with
var pad = new launchpadder(0);

pad.on("press", function(button) {
  button.light();
  console.log(button + " was pressed");
});

pad.on("release", function(button) {
  button.dark();
  console.log(button + " was released");
});


