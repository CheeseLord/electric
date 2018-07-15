import * as Display from 'display';
import P5Behavior from 'p5beh';
import * as Floor from 'floor';

const pb = new P5Behavior();
const ELECTRON_RADIUS = 4;
const FPS = 20;
const MAX_VELOCITY = 15;
const ACCELERATION_CONSTANT = 1000;
const CURRENT_SPEED = 3;
const NUM_ELECTRONS = 60;

var electronXs;
var electronYs;
var electronXVels;
var electronYVels;

var circleImage;

pb.preload = function(p) {
    circleImage = this.loadImage('images/circle.png')
}

pb.setup = function(p) {
    electronXs = []
    electronYs = []
    electronXVels = []
    electronYVels = []
    for (var i = 0; i < NUM_ELECTRONS; i++) {
        electronXs.push(Math.random() * (this.width - 1));
        electronYs.push(Math.random() * (this.height - 1));
        electronXVels.push(Math.random() * 3 - 1.5);
        electronYVels.push(CURRENT_SPEED + Math.random() - 0.5);
    }
}

pb.draw = function(floor, p) {
    this.clear();

    // Draw the current users.
    let currUsers = floor.users;
    for (let user of currUsers) {
        pb.drawUser(user);
    }

    // Draw the current electrons.
    for (var i = 0; i < electronXs.length; i++) {
        this.image(circleImage, electronXs[i], electronYs[i],
            ELECTRON_RADIUS * 2, ELECTRON_RADIUS * 2, 0, 0);
    }

    var newXs = [];
    var newYs = [];
    var newXVels = [];
    var newYVels = [];

    // Update electron states.
    for (var i = 0; i < electronXs.length; i++) {
        var newX = electronXs[i] + electronXVels[i];
        var newY = electronYs[i] + electronYVels[i];

        var ax = 0;
        var ay = 0;
        for (let user of currUsers) {
            var dx = user.x - electronXs[i];
            var dy = user.y - electronYs[i];
            var r = Math.max(Math.sqrt(dx * dx + dy * dy), 2);
            var a = ACCELERATION_CONSTANT / (r * r);
            var theta = Math.atan(dy / dx);
            ax -= a * Math.sin(theta);
            ay -= a * Math.cos(theta);
        }

        newXs.push(newX);
        newYs.push(newY);
        newXVels.push(electronXVels[i] + ax);
        newYVels.push(electronYVels[i] + ay);
    }

    // Apply sanity checks.
    for (var i = 0; i < electronXs.length; i++) {
        if (newXs[i] < 0) {
            newXs[i] = 0;
            newXVels[i] = 1;
        }
        if (newXs[i] > this.width - 1) {
            newXs[i] = this.width - 1;
            newXVels[i] = -1;
        }
        if (newYs[i] < 0 || newYs[i] > this.height - 1) {
            newXs[i] = Math.random() * (this.width - 1);
            newYs[i] = 0;
            newXVels[i] = Math.random() * 3 - 1.5;
            newYVels[i] = CURRENT_SPEED + Math.random() - 0.5;
        }
        newXVels[i] = Math.max(Math.min(newXVels[i], MAX_VELOCITY), -MAX_VELOCITY);
        newYVels[i] = Math.max(Math.min(newYVels[i], MAX_VELOCITY), -MAX_VELOCITY);

        // Regress toward flow velocity.
        newXVels[i] *= Math.random() * 0.1 + 0.9;
        if (newYVels[i] < CURRENT_SPEED) {
            newYVels[i] += 0.3;
        }
    }

    electronXs = newXs;
    electronYs = newYs;
    electronXVels = newXVels;
    electronYVels = newYVels;
}

export const behavior = {
  title: "Electricity (P5)",
  init: pb.init.bind(pb),
  frameRate: FPS,
  render: pb.render.bind(pb),
  numGhosts: 2,
  ghostBounds: {x: Display.width/4, y: Display.height/4, width: Display.width/2, height: Display.height/2}
};
export default behavior
