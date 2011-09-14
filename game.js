// The speed in which the bees home in on the mouse cursor
var BEE_HOMING_SPEED_MAX = 7;
var SIZE_OF_PLANT = 20;
var SIZE_OF_BEES = 32;

var WINDOW_WIDTH = window.innerWidth;
var WINDOW_HEIGHT = window.innerHeight;

// define the cursor component for bees to home on
Crafty.c("Cursor", {
  init: function() {
    // initialize the value used for homing the bees
    this.attr({
      moveTo: null,
      w: SIZE_OF_BEES,
      h: SIZE_OF_BEES,
      inCollision: []
    });

    // things to do every time step
    this.bind("EnterFrame", function(e) {
      // home the bees every time step
      if (this.moveTo != null) {
        var xDiff = this.moveTo.x - this.x - this.w/2;
        var yDiff = this.moveTo.y - this.y - this.h/2;
        var dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        if (dist > 0) {
          xDiff = xDiff * Math.min(BEE_HOMING_SPEED_MAX, dist) / dist;
          yDiff = yDiff * Math.min(BEE_HOMING_SPEED_MAX, dist) / dist;
          this.x += xDiff;
          this.y += yDiff;
        }
      }
    });

    // setup collision detection
    this.attr({
      w: SIZE_OF_BEES,
      h: SIZE_OF_BEES
    });
    this.addComponent("Collision").collision();
    this.onHit("Plant", function(e) {
      // collided with a plant

      // clear colours from all plants
      var plants = Crafty("Plant");
      var i;
      for (i = 0; i < plants.length; ++i) {
        Crafty(plants[i]).color("#0F0");
      }

      // highlight colliding plants
      if (e) {
        var x;
        for (x in e) {
          if (e[x].type == "SAT") {
            e[x].obj.color("#FFF");
          }
        }
      }
    }, function() {
      // out of collision with a plant, clear all colours
      var plants = Crafty("Plant");
      var i;
      for (i = 0; i < plants.length; ++i) {
        Crafty(plants[i]).color("#0F0");
      }
    });
  }
});

Crafty.c("Plant", {
  init: function() {
    this.attr({
      w: SIZE_OF_PLANT,
      h: SIZE_OF_PLANT
    });
    this.addComponent("Collision").collision();
  }
});


//the loading screen that will display while our assets load
Crafty.scene("loading", function () {
  //load takes an array of assets and a callback when complete
  Crafty.load(["img/sprite.png"], function () {
    Crafty.scene("main"); //when everything is loaded, run the main scene
  });
  //black background with some loading text
  Crafty.background("#000");
  Crafty.e("2D, DOM, Text").attr({ w: 100, h: 20, x: 150, y: 120 })
      .text("Loading")
      .css({ "text-align": "center" });
});

Crafty.scene("main", function () {
  // generate world

  // generate the bees
  var player = Crafty.e("2D, DOM, Color, Cursor")
      .attr({
        x: (WINDOW_WIDTH - SIZE_OF_BEES)/2,
        y: (WINDOW_HEIGHT - SIZE_OF_BEES)/2
      })
      .color("#F00");

  // homing bees event handling
  Crafty.addEvent(this, Crafty.stage.elem, "mousedown", function(e) {
    // only track on left mouse button click
    if (e.button > 0) return;

    // record the mouse value to home the bees
    var homing = function(e) {
      player.attr("moveTo", {x: e.clientX, y: e.clientY});
    };

    // home the bees
    homing(e);

    // set the homing if the player drags the mouse
    Crafty.addEvent(this, Crafty.stage.elem, "mousemove", homing);

    // stop homing on mouse release
    Crafty.addEvent(this, Crafty.stage.elem, "mouseup", function() {
      Crafty.removeEvent(this, Crafty.stage.elem, "mousemove", homing);
      player.attr("moveTo", null);
    });
  });

  // generate the plants
  var i;
  for (i = 0; i < 30; ++i) {
    Crafty.e("2D, DOM, Color, Plant")
      .attr({
        x: Crafty.randRange(0, WINDOW_WIDTH - SIZE_OF_PLANT),
        y: Crafty.randRange(0, WINDOW_HEIGHT - SIZE_OF_PLANT)
      })
      .color("#0F0");
  }
});

window.onload = function() {
  //start crafty, full screen
  Crafty.init(WINDOW_WIDTH, WINDOW_HEIGHT);

  //automatically play the loading scene
  Crafty.scene("loading");
};

