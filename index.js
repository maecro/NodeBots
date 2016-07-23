// Uses proximity sensor on the front to tell the distance from the object
// Assumes prox sensor is plugged into port 2 - if not change the pin to use
// the pin for appropriate port and the second pin within it.

var five = require("johnny-five");
var board = new five.Board();
var max_speed_l = 150;
var max_speed_r = 140;
var l_motor;
var r_motor

board.on("ready", function () {

  var proximity = new five.Proximity({
    freq: 1000,
    controller: "HCSR04",
    pin: 10
  });

  l_motor = new five.Motor({ pins: { pwm: 6, dir: 7 } });
  r_motor = new five.Motor({ pins: { pwm: 5, dir: 4 } });

  proximity.on("data", function () {

    console.log(this.cm);

    if (this.cm > 30) {
      l_motor.reverse(max_speed_l);
      r_motor.forward(max_speed_r);
    } else {
      turnRight();
    }

  });
});


function turnRight() {
  r_motor.reverse(max_speed_r);
  l_motor.reverse(max_speed_l);
}

function turnLeft() {
  l_motor.forward(max_speed_l);
  r_motor.forward(max_speed_r);
}