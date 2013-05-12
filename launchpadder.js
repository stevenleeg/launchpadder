var Midi = require("midi");
var util = require("util");
var events = require("events");

/*
 * Button
 * Represents a single button on the Launchpad
 */
var Button = function(grid, note, y) {
    this._grid = grid;
    this._state = Color.OFF;

    // Are we being assigned via a note or x, y?
    if (!y) {
        this.x = this._grid.getX(note);
        this.y = this._grid.getY(note);
    } else {
        this.x = note;
        this.y = y;
    }

    // Setup the event emitter
    events.EventEmitter.call(this);

    this.light = function(color) {
        color = color || Color.AMBER;

        // Send the instruction to the launchpad
        if (this.y == 8) {
            grid._output.sendMessage([176, this.toNote(), color]);
        } else {
            grid._output.sendMessage([144, this.toNote(), color]);
        }
        // Save the state
        this._state = color;
    };

    this.dark = function() {
        if (this.y == 8) {
            grid._output.sendMessage([176, this.toNote(), Color.OFF]);
        } else {
            grid._output.sendMessage([144, this.toNote(), Color.OFF]);
        }
        this._state = Color.OFF;
    };

    this.getState = function() {
        return this._state;
    };

    this.getX = function() { return this.x; }
    this.getY = function() { return this.y; }

    this.toggle = function(color, color2) {
        color = color || Color.AMBER;
        color2 = color2 || Color.OFF;

        if (this._state == color2) {
            var sColor = color;
        } else {
            var sColor = color2;
        }
        this._state = sColor;

        if (this.y == 8) {
            grid._output.sendMessage([176, this.toNote(), sColor]);
        } else {
            grid._output.sendMessage([144, this.toNote(), sColor]);
        }

    };

    this.startBlinking = function(color) {
        this._blink_color = color || Color.AMBER;
        this._grid._blinking.push(this);

        // If we're adding the first blinking LED, start the interval
        if (this._grid._blinking.length == 1) {
            this._grid._blink_interval = setInterval(this._grid._tick, 500);
        }
    };

    this.stopBlinking = function() {
        var index = this._grid._blinking.indexOf(this)
        if (index == -1) {
            return;
        }
        delete this._blink_color;
        this._grid._blinking.splice(index, 1);
        this.dark();
    };

    this.isBlinking = function() {
        if (this._grid._blinking.indexOf(this) == -1) {
            return false;
        } else {
            return true;
        }
    };

    this.isLit = function(color)  {
        if (!color) {
            if (this._state == Color.OFF) {
                return false;
            }
        } else {
            if (this._state != color) {
                return false
            }
        }
        return true;
    };

    // Converts x,y -> MIDI note
    this.toNote = function() {
        if (this.y == 8) {
            return 104 + this.x;
        } else {
            return (this.y * 16) + this.x;
        }
    };

    this.toString = function() {
        return "(" + this.x + ", " + this.y + ")";
    };
};

util.inherits(Button, events.EventEmitter);

/*
 * Launchpad
 * Represents the launchpad as a whole
 */
var Launchpad = function(midi_input, midi_output) {
    midi_input = midi_input || 0;
    midi_output = midi_output || midi_input;
    var that = this;
    this._grid = [];
    this._blinking = [];

    // Connect to the MIDI port
    this._input = new Midi.input();
    this._output = new Midi.output();
    this._input.openPort(midi_input);
    this._output.openPort(midi_output);

    // Setup the event emitter
    events.EventEmitter.call(this);

    // Some functions to resolve X and Y from a note
    this.getX = function(note) {
        // For right buttons
        if (note % 8 == 0 && ((note / 8) % 2 == 1)) {
            return 8;
        }
        return note % 8;
    };
    this.getY = function(note) {
        // For right buttons
        if (note % 8 == 0 && ((note / 8) % 2 == 1)) {
            return Math.floor(note / 8 / 2);
        }
        return Math.floor(note / 8) / 2;
    };

    // Initialize all of the buttons
    for (var x = 0; x < 9; x++) {
        this._grid.push([]);
        for (var y = 0; y < 9; y++) {
            this._grid[x][y] = new Button(this, x, y);
        }
    }

    // Gets a button object from this._grid
    this.getButton = function(x, y) {
        if (y) {
            if (x > 8 || y > 8) {
                return null;
            }
            return this._grid[x][y];
        }
        // Hax 8D
        return this._grid[that.getX(x)][that.getY(x)];
    };

    // Turns all LEDs off
    this.allDark = function() {
        this._output.sendMessage([176, 0, 0]);

        // Reset the state on all buttons
        for (var x = 0; x < 9; x++) {
            for (var y = 0; y < 9; y++) {
                this._grid[x][y]._state = false;
            }
        }
    };

    this._tick = function() {
        if(that._blinking.length == 0) {
            clearInterval(that._blink_interval);
            // MOD start
            return;
            // MOD end
        }
        for (var i in that._blinking) {
            if(that._blinking[i].getState() == Color.OFF) {
                that._blinking[i].light(that._blinking[i]._blink_color);
            } else {
                that._blinking[i].dark();
            }
        }
    };

    // Event handler for Button press
    this._input.on("message", function(deltaTime, msg) {
        // Parse the MIDI message
        msg = msg.toString().split(",");

        // We have to do something special for the top buttons
        if (msg[0] == "176") {
            var button = that.getButton(parseInt(msg[1]) % 8, 8);
        } else {
            var button = that.getButton(msg[1]);
        }

        // On or off?
        var state = (parseInt(msg[2]) == 127) ? true : false;

        // Emit an event
        if (state) {
            that.emit("press", button);
            button.emit("press", button);
        } else {
            that.emit("release", button);
            button.emit("release", button);
        }
    });
};
util.inherits(Launchpad, events.EventEmitter);

var Color = {
    OFF: 12,
    LOW_RED: 13,
    RED: 15,
    LOW_AMBER: 29,
    AMBER: 63,
    LOW_GREEN: 28,
    GREEN: 60,
    YELLOW: 62,
    getColor: function(green, red) {
        green = green || 0;
        red = red || 0;
        return 16 * green + red + 12;
    },
    getGreen: function(color) {
        if (!color) {
            return false;
        }
        return Math.floor(color / 16);
    },
    getRed: function(color) {
        if (!color) {
            return false;
        }
        return (color - 12) % 16;
    }
};

exports.Launchpad = Launchpad;
exports.Color = Color;
