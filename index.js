// Uses proximity sensor on the front to tell the distance from the object
// Assumes prox sensor is plugged into port 2 - if not change the pin to use
// the pin for appropriate port and the second pin within it.

var five = require("johnny-five");
var board = new five.Board({ port: process.argv[2] });
var stdin = process.openStdin();
// require('tty').setRawMode(true);

var max_speed_l = 150;
var max_speed_r = 140;
var l_motor;
var r_motor;
var preventStuff = false;

board.on("ready", function () {

  var proximity = new five.Proximity({
    freq: 1000,
    controller: "HCSR04",
    pin: 10
  });

  l_motor = new five.Motor({ pins: { pwm: 6, dir: 7 } });
  r_motor = new five.Motor({ pins: { pwm: 5, dir: 4 } });

  stdin.on('keypress', function (chunk, key) {
    preventStuff = true;
    handleKeyboardInput(key);
    preventStuff = false;
  });

  proximity.on("data", function () {

    console.log(this.cm);

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

  if (key) {
    switch (key.name) {
      case "up":
        foward();
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
      case "space":
        stop();
        break;
    }
  }

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
