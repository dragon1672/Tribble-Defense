/*global createjs */
/*global mouse */
function LevelExample (title) {
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
        //put other general GUI stuff here
        this.levelUpdate();
    };

    //level
    this.grid = null;
    this.currentItem = null;
    this.nextItems = [];
    this.turns = 50;

    this.levelUpdate = function() { };
    this.mouseDownEvent = function(e) { e=e; };
    this.mouseUpEvent = function(e) {
        e=e;
        //find closest square
        //if this.currentItem.onPlace()
            //this.turns--
    };
    this.enable  = function() {
        //this.grid = new Grid();
            //setup grid
        //change turns to be different number?
        //init nextItems
        //set current item
    };
    this.disable = function() { };
}