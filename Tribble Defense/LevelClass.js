//region assets

function Coord() {
        return Coord(0,0);
    }
    function Coord(existingCoord) {
        return Coord(existingCoord.x,existingCoord.y);
    }
    function Coord(x,y) {
        this.x = x;
        this.y = y;
    }
    Coord.prototype.toString = function() { return "{"+this.x+","+this.y+"}"; };
    //math
    Coord.prototype.add = function(that)     { return new Coord(this.x+that.x,this.y+that.y); };
    Coord.prototype.sub = function(that)     { return new Coord(this.x-that.x,this.y-that.y); };
    Coord.prototype.mul = function(constent) { return new Coord(constent * this.x,constent * this.y); };
    Coord.prototype.div = function(constent) { return this.mul(1/constent); };
    Coord.prototype.dot = function(that)     { return this.x * that.x + this.y * that.y; };
    Coord.prototype.lengthSquared = function() { return this.dot(this); };
    Coord.prototype.length     = function()    { return Math.sqrt(this.lengthSquared(this)); };
    Coord.prototype.normalized = function()    { return new Coord(this.x,this.y).div(Math.sqrt(this.lengthSquared(this))); };
    Coord.prototype.perpCW     = function()    { return new Coord(-this.y,this.x); };
    Coord.prototype.perpCCW    = function()    { return new Coord(this.y,-this.x); };
    Coord.prototype.LERP       = function(percent, that) { return this.mul(1-percent).add(that.mul(percent)); };
    Coord.prototype.cross      = function(that) { return this.x * that.y - this.y * that.x; };
    Coord.prototype.projection = function(norm) { return (this.dot(norm).mul(norm)).div(norm.lengthSquared()); };
    Coord.prototype.rejection  = function(norm) { return this.sub(this.projection(norm)); };
    Coord.prototype.isZero     = function()     { return this.x === 0 && this.y === 0;};

//endregion
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
        } else {
            this.currentItem.graphic.x = 0; // location of holder
            this.currentItem.graphic.y = 0; // location of holder
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


var MessageTicker = {
    addMessage: function(stringMsg) {},
    messageQ: [],
    _currentMessage: new createjs.Text("Message Ticker", "12px Arial", "#000"),
    _messageOffset: new Coord(),
};