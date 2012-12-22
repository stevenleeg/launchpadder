var Midi = require("midi");
var util = require("util");
var events = require("events");

/*
 * Button
 * Represents a single button on the Launchpad
 */
var Button = function(grid, note, y) {
    this._grid = grid;
    // Are we being assigned via a note or x, y?
    if(y == undefined) {
        var map = Button.mapToGrid(note);
        this.x = map[0];
        this.y = map[1];
    } else {
        this.x = note;
        this.y = y;
    }

    this.light = function(color) {
        grid._output.sendMessage([144, this.toNote(), 63]);
    }

    this.dark = function() {
        grid._output.sendMessage([144, this.toNote(), 12]);
    }

    // Converts x,y -> MIDI note
    this.toNote = function() {
        return (this.y * 16) + this.x;
    }

    this.toString = function() {
        return "(" + this.x + ", " + this.y + ")";
    }
};

Button.mapToGrid = function (note) {
    var x = note % 8;
    var y = Math.floor(note / 8) / 2;
    return [x, y];
}

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
    for(var x = 0; x < 8; x++) {
        this._grid.push([]);
        for(var y = 0; y < 8; y++) {
            this._grid[x][y] = new Button(this, x, y);
        }
    }

    this.getButton = function(x, y) {
        if(y != undefined)
            return this._grid[x][y];

        var map = Button.mapToGrid(x);
        return this._grid[map[0]][map[1]];
    }

    // Setup events
    this._input.on("message", function(deltaTime, msg) {
        // Parse the MIDI message
        msg = msg.toString().split(",");
        // Get the button
        var button = that.getButton(msg[1]);
        // On or off?
        var state = (parseInt(msg[2]) == 127) ? true : false;

        // Emit an event
        if(state)
            that.emit("press", button);
        else
            that.emit("release", button);
    });
}

util.inherits(Launchpad, events.EventEmitter);

exports.Launchpad = Launchpad;
