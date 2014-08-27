/*global createjs */
/*global mouse */
function Level (title) {
    //Game state
    this.title = title;
    this.container = new createjs.Container();
    this.masterEnable  = function() { this.container.visible = true;  this.enable();  };
    this.masterDisable = function() { this.container.visible = false; this.disable(); };

    this.update  = function() {
        if(mouse.isDown) {
            this.currentItem.graphic.x = mouse.pos.x;
            this.currentItem.graphic.y = mouse.pos.y;
        }
        this.levelUpdate();
    };

    //level
    this.grid = null;
    this.currentItem = null;
    this.nextItems = [];
    this.mouseIsDown = false;

    this.levelUpdate = function() { };
    this.mouseDownEvent = function(e) { e=e; };
    this.mouseUpEvent = function(e) { e=e; };
    this.enable  = function() { };
    this.disable = function() { };
}