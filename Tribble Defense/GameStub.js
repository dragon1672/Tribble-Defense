function Coord() {} // included from main project


var ItemType = { // enum
    Hazard: "haz",
    Housing: "woody",
    Static: "oldTv",
    ComboMaster: "combine with all",
    BlackHole: "Anything will die",
};

function Cell(pos) {
    this.isPlaceable = true;
    this.item = null;
    this.pos = pos;
}

function Query(valid) {
    this.levelBoost = 0;
    this.positions = [new Coord(), new Coord(1,1)];
    this.valid = valid;
}

function Item(type) {
    this.update = function () {};
    this.population = 0;
    this.direction = new Coord();
    this.strength = 0;
    this.type = type;
}

function Spawner() {
    this.pos = new Coord();
    this.directions = [new Coord(), new Coord()];
    this.freqLow = 5;
    this.freqHigh = 10;
    this.turnsTillNextSpawn = 7; // will be updated based off freq
    //will be changed 
    this.update = function() {
        this.turnsTillNextSpawn--;
        if(this.turnsTillNextSpawn < 0) {
            this.turnsTillNextSpawn = 7;
        }
    };
}



function Game(size) { // pass in Coord of size
    this.getTurnCount  = function() { return size; };
    this.itemQ         = function(index) {
        index = index;
        var ret = new Item(ItemType.Housing);
        ret.population = 1;
        return ret;
    };
    this.QueryMove     = function(pos,itemToPlace) {
        pos = pos;
        itemToPlace = itemToPlace;
        var ret = new Query(true);
    };
    this.ApplyMove     = function(pos,itemToPlace) { 
        pos = pos;
        itemToPlace = itemToPlace;
        return this.QueryMove();
    };
    this.getCell       = function(pos) {
        return new Cell(pos);
    };
    this.getPopulation = function() { return 42; };
    this.update = function() {};
    
    //for building map
    this.setComboBoost = function(boost) { boost = boost; };
    this.setSpawner = function(pos,spawner) { pos = pos; spawner = spawner;};
    this.getDims = function() { return size; };
}