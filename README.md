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
var launchpadder = require("./launchpadder").Launchpad;
var launchpadColor = require("./launchpadder").Color;

// The 0 represents the MIDI port to connect with
// The 1 represents the MIDI output-port to connect with
// Both these are optional and default to 0
var pad = new launchpadder(0, 1);

pad.on("press", function(button) {
    button.light(launchpadColor.RED);
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

### `Launchpad([int midi_in], [int midi_out])`
Constructor. To create a new instance of the Launchpad class you may include a midi port to connect to (probably 0, unless you have a much cooler MIDI setup than I do). Both of these values are optional, however.

### `getButton(int x, [int y])`
Gets the button at coordinate x, y. If y is undefined, the method assumes you are providing it with a Launchpad-specific MIDI note and will attempt to convert it into x, y coordinates.

### `allDark()`
Sets all of the LEDs to dark. This method works by sending the reset command to the Launchpad (not sending Color.OFF to each button).

### `getX(note)`
Returns the X-coordinate for a Launchpad-specific MIDI note.

### `getY(note)`
Returns the Y-coordinate for a Launchpad-specific MIDI note.

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
Represents each individual button on the launchpad. Only obtainable through the `Launchpad` class.

### `getX()`
Returns the X-coordinate of the button.

### `getY()`
Returns the Y-coordinate of the button.

### `light([int color])`
Turns on the button's LED with the specified color (see `Color` object for color constants). If no color is provided, it defaults to amber.

### `dark()`
Turns off the button's LED.

### `isLit([int color])`
Returns true when the Button is lit up. Optionally: specify "color" to validate against a certain color.

### `getState()`
Gets the button's current state, returns a MIDI representation of the color. See `Color` class below.

### `toggle([int color], [int color])`
Toggles the button's state between two colors. The first color defaults to amber if unspecified, the second to off. If the current color is neither of the two values, the second value is used.

### `startBlinking([int color])`
Starts blinking the button in the specified color (defaults to amber). The timeout is set at 500ms.

### `stopBlinking()`
Stops blinking the button.

### `isBlinking()`
Returns true or false depending if the button is blinking or not.

### `toString()`
Returns a string representation of the button's coordinates in `(x, y)` format.

### `toNote()`
Converts the x, y coordinates of the button into the Launchpad-specific MIDI representation. See the `Launchpad` class to get the x and y values back.

### Events
This class also inherits methods frome Node's [event.EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter). Possible events to listen for are:

 * `press`
 * `release`

Both events emit the button object as an argument (much like the Launchpad class).

## `Color` class
Represents a Launchpad-specific MIDI color.

### `getColor([int red], [int green])`
Returns the MIDI color representing your red and green light values (values can be 0 up to a maximum of 3). Both values default to 0, and therefore `getColor()` will return value 12 (which is off; see static colors below).

### `getGreen(int note)`
Returns the green value (0 to 3) of the specified MIDI note.

### `getRed(int note)`
Returns the red value (0 to 3) of the specified MIDI note.

Launchpadder comes with several static values stored in the `Color` class which can be used to light up buttons.

 * `#OFF`: 12
 * `#LOW_RED`: 13
 * `#RED`: 15
 * `#LOW_AMBER`: 29
 * `#AMBER`: 63
 * `#LOW_GREEN`: 28
 * `#GREEN`: 60
 * `#YELLOW`: 62
