var Midi = require("midi");
var util = require("util");
var events = require("events");

/*
 * Button
 * Represents a single button on the Launchpad
 */
var Button = function(grid, note, y) {
    this._grid = grid;
    this._state = Launchpad.LED_OFF;

    // Are we being assigned via a note or x, y?
    if(y == undefined) {
        var map = Button.mapToLaunchpad(note);
        this.x = map[0];
        this.y = map[1];
    } else {
        this.x = note;
        this.y = y;
    }

    // Setup the event emitter
    events.EventEmitter.call(this);

    this.light = function(color) {
        if(color == undefined)
            color = Launchpad.LED_AMBER;

        // Send the instruction to the launchpad
        if(this.y == 8)
            grid._output.sendMessage([176, this.toNote(), color]);
        else
            grid._output.sendMessage([144, this.toNote(), color]);

        // Save the state
        this._state = color;
    }

    this.dark = function() {
        if(this.y == 8)
            grid._output.sendMessage([176, this.toNote(), Launchpad.LED_OFF]);
        else
            grid._output.sendMessage([144, this.toNote(), Launchpad.LED_OFF]);

        this._state = Launchpad.LED_OFF;
    }

    this.getState = function() {
        return this._state;
    }

    // Converts x,y -> MIDI note
    this.toNote = function() {
        if(this.y == 8)
            return 104 + this.x;
        else
            return (this.y * 16) + this.x;
    }

    this.toString = function() {
        return "(" + this.x + ", " + this.y + ")";
    }
};

Button.mapToLaunchpad = function (note) {
    // For right buttons
    if(note % 8 == 0 && ((note / 8) % 2 == 1))
        return [8, Math.floor(note / 8 / 2)];

    var x = note % 8;
    var y = Math.floor(note / 8) / 2;
    return [x, y];
}

util.inherits(Button, events.EventEmitter);

/*
 * Launchpad
 * Represents the launchpad as a whole
 */
var Launchpad = function(midi_port) {
    // Some variables
    this._grid = [];
    var that = this;

    // Connect to the MIDI port
    this._input = new Midi.input();
    this._output = new Midi.output();
    this._input.openPort(midi_port);
    this._output.openPort(midi_port);

    // Setup the event emitter
    events.EventEmitter.call(this);
    
    // Initialize all of the buttons
    for(var x = 0; x < 9; x++) {
        this._grid.push([]);
        for(var y = 0; y < 9; y++) {
            this._grid[x][y] = new Button(this, x, y);
        }
    }

    /*
     * Gets a button object from this._grid
     */
    this.getButton = function(x, y) {
        if(y != undefined) {
            // Are they giving a bad value?
            if(x > 8 || y > 8) 
                return null;
            return this._grid[x][y];
        }

        var map = Button.mapToLaunchpad(x);
        return this._grid[map[0]][map[1]];
    }

    /*
     * Turns all LEDs off
     */
    this.allDark = function() {
        this._output.sendMessage([176, 0, 0]);

        // Reset the state on all buttons
        for(var x = 0; x < 9; x++) {
            for(var y = 0; y < 9; y++) {
                this._grid[x][y]._state = false;
            }
        }
    }

    /*
     * Event handler for button press
     */
    this._input.on("message", function(deltaTime, msg) {
        // Parse the MIDI message
        msg = msg.toString().split(",");
        
        // We have to do something special for the top buttons
        if(msg[0] == "176")
            var button = that.getButton(parseInt(msg[1]) % 8, 8);
        else
            var button = that.getButton(msg[1]);
        // On or off?
        var state = (parseInt(msg[2]) == 127) ? true : false;

        // Emit an event
        if(state) {
            that.emit("press", button);
            button.emit("press", button);
        } else {
            that.emit("release", button);
            button.emit("release", button);
        }
    });
}
// Constants
Launchpad.LED_OFF = 12;
Launchpad.LED_LOW_RED = 13;
Launchpad.LED_LOW_AMBER = 29;
Launchpad.LED_LOW_GREEN = 28;
Launchpad.LED_RED = 15;
Launchpad.LED_AMBER = 63;
Launchpad.LED_GREEN = 60;
Launchpad.LED_YELLOW = 62;

util.inherits(Launchpad, events.EventEmitter);

exports.Launchpad = Launchpad;
exports.Button = Button;
