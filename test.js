var launchpadder = require("./launchpadder").Launchpad;
var color = require("./launchpadder").Color;

// The 0 represents the MIDI port to connect with
// The 1 represents the MIDI output-port to connect with
var pad = new launchpadder(0, 1);

pad.on("press", function (button) {
  // Ignore scene buttons
  if (button.getX() == 8) {
    console.log("Scene button " + button.getY() + " was pressed");
    return;
  }
  button.light();
  console.log(button + " was pressed");
});

pad.on("release", function (button) {
  // Ignore scene buttons
  if (button.getX() == 8) {
    console.log("Scene button " + button.getY() + " was released");
    return;
  }
  button.dark();
  console.log(button + " was released");
});


// Start blinking the first scene-button
var state = color.GREEN;
var scene = pad.getButton(8, 0);
scene.startBlinking(state);

// Toggle blink color on press
scene.on("press", function (button) {
  if (state == color.GREEN) {
    button.startBlinking(Color.YELLOW);
  } else {
    button.startBlinking(Color.GREEEN);
  }
});

// Toggle on/off state for second scene button
var scene2 = pad.getButton(8, 1);
scene2.light(Color.AMBER);
scene2.on("press", function (button) {
  button.toggle(Color.AMBER, Color.RED);
});






