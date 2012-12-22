# Launchpadder
A node library for interacting with the [Novation Launchpad](http://global.novationmusic.com/midi-controllers-digital-dj/launchpad).

## Installing
You can install Launchpadder via npm:

```shell
$ npm install launchpadder
```

## Usage
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

## Documentation
Coming soon. The library is still in its early stages, so I don't want to document everything now just to have it change in the future. Check launchpad.js for the current API, it's a pretty easy read. 
