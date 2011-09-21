// CONSTANTS
// The speed in which the bees home in on the mouse cursor
var BEE_HOMING_SPEED_MAX = 7;
var SIZE_OF_PLANT = 20;
var SIZE_OF_BEES = 32;

var WIDTH_OFFSET = ((window.innerWidth % SIZE_OF_PLANT) == 0? 20 : window.innerWidth % SIZE_OF_PLANT) / 2;

var WINDOW_WIDTH = window.innerWidth - WIDTH_OFFSET * 2;
var WINDOW_HEIGHT = window.innerHeight - window.innerHeight % SIZE_OF_PLANT;

var GRID_RANGE_X = WINDOW_WIDTH / SIZE_OF_PLANT - 1;
var GRID_RANGE_Y = WINDOW_HEIGHT / SIZE_OF_PLANT - 1;

// GLOBAL VARIABLES
var plant_grid = new Array(GRID_RANGE_X);
{
  var x, y;
  for (x = 0; x <= GRID_RANGE_X; ++x) {
    plant_grid[x] = new Array(GRID_RANGE_Y);
    for (y = 0; y <= GRID_RANGE_Y; ++y) {
      plant_grid[x][y] = false;
    }
  }
}

Crafty.c("Moving", {
  init:
  function() {
    this.bind("EnterFrame", function(e) {
      if (this._destPos != null) {
        var xDiff = this._destPos.x - this.x - this.w/2;
        var yDiff = this._destPos.y - this.y - this.h/2;
        var dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        if (dist > 0) {
          xDiff = xDiff * Math.min(this._destPos.speed, dist) / dist;
          yDiff = yDiff * Math.min(this._destPos.speed, dist) / dist;
          this.x += xDiff;
          this.y += yDiff;
        }
      }
    });
  },
  _destPos: null,
  moveTo:
  function(x, y, speed) {
    this._destPos = {
      x: x,
      y: y,
      speed: speed
    };
  },
  moveStop:
  function() {
    this._destPos = null;
  }
});

// define the cursor component for bees to home on
Crafty.c("Cursor", {
  init: function() {
    // setup collision detection
    this.addComponent("Collision").collision();
    this.onHit("Plant", function(e) {
      // collided with a plant

      // clear colours from all plants
      var plants = Crafty("Plant");
      var i;
      for (i = 0; i < plants.length; ++i) {
        Crafty(plants[i]).removeComponent("Collided");
      }

      // highlight colliding plants
      if (e) {
        var x;
        for (x in e) {
          if (e[x].type == "SAT") {
            e[x].obj.addComponent("Collided");
          }
        }
      }
    }, function() {
      // out of collision with a plant, clear all colours
      var plants = Crafty("Plant");
      var i;
      for (i = 0; i < plants.length; ++i) {
        Crafty(plants[i]).removeComponent("Collided");
      }
    });
  },
  h: SIZE_OF_BEES,
  inCollision: [],
  w: SIZE_OF_BEES
});

Crafty.c("Enemy", {
  init: function() {
    this.addComponent("2D, DOM");
  },
  enemy: function(hp) {
    this._hp = hp;
  }
});

Crafty.c("Plant", {
  init: function() {
    this.addComponent("Collision").collision();
  },
  h: SIZE_OF_PLANT,
  w: SIZE_OF_PLANT,
  plant_x: -1,
  plant_y: -1,
  plant_pos: function(new_plant_x, new_plant_y) {
    if (this.plant_x != -1 && this.plant_y != -1) {
      plant_grid[this.plant_x][this.plant_y] = false;
    }
    this.plant_x = new_plant_x;
    this.plant_y = new_plant_y;
    plant_grid[this.plant_x][this.plant_y] = this[0];
    this.x = new_plant_x * SIZE_OF_PLANT;
    this.y = new_plant_y * SIZE_OF_PLANT;
    return this;
  }
});


//the loading screen that will display while our assets load
Crafty.scene("loading", function () {
  //load takes an array of assets and a callback when complete
  Crafty.load(["img/sprite.png"], function () {
    Crafty.scene("main"); //when everything is loaded, run the main scene
  });
  //black background with some loading text
  Crafty.e("2D, DOM, Text").attr({ w: 100, h: 20, x: 150, y: 120 })
      .text("Loading")
      .css({ "text-align": "center" });
});

Crafty.scene("main", function () {
  // generate world

  // generate the bees
  var player = Crafty.e("2D, DOM, Cursor, Moving")
      .attr({
        x: (WINDOW_WIDTH - SIZE_OF_BEES)/2,
        y: (WINDOW_HEIGHT - SIZE_OF_BEES)/2
      });

  // homing bees event handling
  Crafty.addEvent(this, Crafty.stage.elem, "mousedown", function(e) {
    // only track on left mouse button click
    if (e.button > 0) return;

    // record the mouse value to home the bees
    var homing = function(e) {
      player.moveTo(e.clientX - WIDTH_OFFSET, e.clientY, BEE_HOMING_SPEED_MAX);
    };

    // home the bees
    homing(e);

    // set the homing if the player drags the mouse
    Crafty.addEvent(this, Crafty.stage.elem, "mousemove", homing);

    // stop homing on mouse release
    Crafty.addEvent(this, Crafty.stage.elem, "mouseup", function() {
      Crafty.removeEvent(this, Crafty.stage.elem, "mousemove", homing);
      player.moveStop();
    });
  });

  // generate the initial plants
  var i;

  for (i = 0; i < 5; ++i) {
    var plant = Crafty
      .e("2D, DOM, Plant, Text")
      .plant_pos(Crafty.randRange(0, GRID_RANGE_X), Crafty.randRange(0, GRID_RANGE_Y));
    plant.text(plant[0]);
  }
});

window.onload = function() {
  //start crafty, full screen
  Crafty.init(WINDOW_WIDTH, WINDOW_HEIGHT);

  //automatically play the loading scene
  Crafty.scene("loading");
};

