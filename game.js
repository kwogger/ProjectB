// The speed in which the bees home in on the mouse cursor
var BEE_HOMING_SPEED = 10;

window.onload = function() {
  //start crafty, full screen
  Crafty.init();

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
  });   //automatically play the loading scene
  Crafty.scene("loading");

  Crafty.scene("main", function () {
    // generate world
    Crafty.c("Cursor", {
      init: function() {
        // initialize the value used for homing the bees
        this.attr("moveTo", null);

        // things to do every time step
        this.bind("EnterFrame", function(e) {
          // home the bees every time step
          if (this.moveTo != null) {
            var xDiff = this.moveTo.x - this.x - this.w/2;
            var yDiff = this.moveTo.y - this.y - this.h/2;
            var dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
            if (dist > BEE_HOMING_SPEED / 2) {
              xDiff = xDiff * BEE_HOMING_SPEED / dist;
              yDiff = yDiff * BEE_HOMING_SPEED / dist;
              this.x += xDiff;
              this.y += yDiff;
            }
          }
        });
      }
    });

    // generate the bees
    var player = Crafty.e("2D, DOM, Color, Cursor")
        .attr({x: 160, y: 96, w: 32, h: 32})
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
  });
};

