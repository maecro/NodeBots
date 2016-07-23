// Uses proximity sensor on the front to tell the distance from the object
// Assumes prox sensor is plugged into port 2 - if not change the pin to use
// the pin for appropriate port and the second pin within it.

var five = require("johnny-five");
var board = new five.Board({ port: process.argv[2] });
var stdin = process.openStdin();
var pixel = require("node-pixel");

var max_speed_l = 150;
var max_speed_r = 140;
var l_motor;
var r_motor;
var preventStuff = false;
var piezo;
var strip = null;
var fps = 3; // how many frames per second do you want to try?
var blinker = null;

board.on("ready", function () {

  strip = new pixel.Strip({
    data: 13,
    length: 2,
    board: this,
    controller: "FIRMATA",
  });

  var colors = ["#440000", "#000044"];
  var current_colors = [0, 1];
  var current_pos = [0, 1];

  piezo = new five.Piezo(8);

  var sensor = new five.Sensor({
    pin: "A6",
    freq: 500 // change this to speed you want data reported at. Slower is better
  });

  sensor.on("data", function() {
    console.log("light: " + this.value);
  });

  var proximity = new five.Proximity({
    freq: 1000,
    controller: "HCSR04",
    pin: 10
  });

  l_motor = new five.Motor({ pins: { pwm: 6, dir: 7 } });
  r_motor = new five.Motor({ pins: { pwm: 5, dir: 4 } });

  stdin.on('keypress', function (chunk, key) {
    handleKeyboardInput(key);
  });

  proximity.on("data", function () {

    console.log("distance (cm):" + this.cm);

    if (preventStuff) return;

    if (this.cm > 30) {
      l_motor.reverse(max_speed_l);
      r_motor.forward(max_speed_r);
    } else {
      right();
    }

  });
});

function handleKeyboardInput(key) {

  preventStuff = false;

  if (key) {
    switch (key.name) {
      case "up":
        forward();
        break;
      case "down":
        reverse();
        break;
      case "left":
        left();
        break;
      case "right":
        right();
        break;
      case "h":
        if (blinker === null) {
          blinker = soundHornLight();
        } else {
          clearInterval(blinker);
          blinker = null;
        }
        break;
      case "space":
        preventStuff = true;
        stop();
        break;
    }
  }

}

function flashLights() {
  // TODO: Implement
}

function stop() {
  l_motor.stop();
  r_motor.stop();
}

function right() {
  r_motor.reverse(max_speed_r);
  l_motor.reverse(max_speed_l);
}

function left() {
  l_motor.forward(max_speed_l);
  r_motor.forward(max_speed_r);
}

function forward() {
  l_motor.reverse(max_speed_l);
  r_motor.forward(max_speed_r);
}

function reverse() {
  r_motor.reverse(max_speed_r);
  l_motor.forward(max_speed_l);
}

function soundHornLight() {
  piezo.frequency(587, 1000);
  return setInterval(function () {

    strip.color("#000"); // blanks it out
    for (var i = 0; i < current_pos.length; i++) {
      if (++current_pos[i] >= strip.stripLength()) {
        current_pos[i] = 0;
        if (++current_colors[i] >= colors.length) current_colors[i] = 0;
      }
      strip.pixel(current_pos[i]).color(colors[current_colors[i]]);
    }
    strip.show();
  }, 1000 / fps);
}