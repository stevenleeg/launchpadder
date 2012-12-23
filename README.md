# Launchpadder
A node library for interacting with the [Novation Launchpad](http://global.novationmusic.com/midi-controllers-digital-dj/launchpad).

# Installing
You can install Launchpadder via npm:

```shell
$ npm install launchpadder
```

# Usage
I tried to make usage as straightforward as possible:

```javascript
var Launchpadder = require("launchpadder");

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
```

# Documentation
Launchpadder was made because I felt that such a simple piece of hardware should also have a simple API behind it. If you feel that any part of the software doesn't follow this philosphy, feel free to open an issue and I'll look into it. So without further adieu, the Launchpadder API:

## `Launchpad` class
Represents the launchpad as a whole.

### `Launchpad(int midi_port)`
Constructor. To create a new instance of the Launchpad class you must include a midi port to connect to (probably 0, unless you have a much cooler MIDI setup than I do).

### `getButton(int x, int y)`
Gets the button at coordinate x, y. If y is undefined, the method assumes you are providing it with a Launchpad-specific MIDI note and will attempt to convert it into x, y coordinates.

### `allDark()`
Sets all of the LEDs to dark. This method works by sending the reset command to the Launchpad (not sending LED_OFF to each button).

### Events
This class also inherits methods frome Node's [event.EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter). Possible events to listen for are:

 * `press`
 * `release`

Both events emit the button object as an argument. Eg:

```javascript
launchpad.on("press", function(button) {
    // Do something awesome...
})
```

## `Button` class
Represents each individual button on the launchpad.

### `light(int color)`
Turn on the button's LED with the specified color (see Launchpad object for color constants). If no color is provided, it defaults to amber.

### `dark()`
Turn off the button's LED

### `getState()`
Gets the button's current state. If it is off, it will return with `false`, otherwise it will return the integer representation of its current color.

### `toString()`
Returns a string representation of the button's coordinates in `(x, y)` format.

### `toNote()`
Converts the x, y coordinates of the button into the Launchpad-specific MIDI representation.

### Events
This class also inherits methods frome Node's [event.EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter). Possible events to listen for are:

 * `press`
 * `release`

Both events emit the button object as an argument (much like the Launchpad class).
