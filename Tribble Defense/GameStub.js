/*jslint browser:true */
/*global console */
//region copy pasted code

function Where(theArray, condition) {
    var ret = [];
    theArray.map(function(item) { if(condition(item)) { ret.push(item); }});
    return ret;
}
function Rand(min,max) {
    return Math.round(Math.random() * (max - min) + min);
}
function RandomElement(array) {
    return array[Rand(0,array.length-1)];
}
function SingleSelect(array,selector) {
    selector = selector || function(a,b) { return a > b ? a : b; };
    var ret = null;
    array.map(function(item) { ret = ret === null ? item : selector(item,ret);});
    return ret;
}
function Max(array) { return SingleSelect(array,function(a,b) { return a > b ? a : b; }); }
function Min(array) { return SingleSelect(array,function(a,b) { return a < b ? a : b; }); }
function Sum(array) { return SingleSelect(array,function(a,b) { return a + b; }); }
function Select(array,selector) {
    selector = selector || function(item) { return item; };
    var ret = [];
    array.map(function(item) { ret.push(selector(item));});
    return ret;
}

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
Coord.prototype.isEqual  = function(that) { return this.x === that.x && this.y === that.y; };
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
Coord.prototype.withinBox  = function(exclusiveBounds) { return this.x >= 0 && this.y >= 0 && this.x < exclusiveBounds.x && this.y < exclusiveBounds.y; };

//endregion

//region hasy

/*
 * Hash table developed by Anthony Corbin
//*/
var HashTable, HashMap;
 HashTable = HashMap = (function() {
	function HashTable() {
		this.pairs = [];
		this.orderedPairs = [];
	}
	function KeyValuePair(hash, key, val) {
		this.hash = hash;
		this.key = key;
		this.val = val;
        this.markedForDel = false;
	}
    
    var hasher = function (value) {
        return (typeof value) + ' ' + (value instanceof Object ? (value.__hash || (value.__hash = ++arguments.callee.current)) : value.toString());
    };
    hasher.current = 0;
    
    this.numOfActiveIterations = 0;
    
    HashTable.prototype.hashObject = hasher;
	KeyValuePair.prototype.containsKey = function (key) { return this.key === key; };
	KeyValuePair.prototype.containsVal = function (val) { return this.val === val; };
	HashTable.prototype.add = function (newKey, newVal) {
		var hash = this.hashObject(newKey);
		if (!this.containsKey(newKey)) {
			this.pairs[hash] = new KeyValuePair(hash, newKey, newVal);
			this.orderedPairs.push(this.pairs[hash]);
		} else {
			this.pairs[hash].val = newVal;
		}
	};
	HashTable.prototype.put  = this.add;
	HashTable.prototype.get = function (key) {
		var hash = this.hashObject(key);
		if (this.pairs[hash] !== null) { return this.pairs[hash].val; }
		return null;
	};
	HashTable.prototype.remove = function (key) {
		var i, hash;
		if (this.containsKey(key)) {
			hash = this.hashObject(key);
            this.pairs[hash].markedForDel = true;
            var del = function del() {
                if(this.numOfActiveIterations > 0) {
                    setTimeout(del,10);
                    return;
                }
                for (i = 0; i < this.orderedPairs.length; i++) {
                    if (this.orderedPairs[i] === this.pairs[hash]) {
                        this.orderedPairs.splice(i, 1);
                        this.pairs[hash] = null;
                        return;
                    }
                }
                throw new Error("contain returned true, but key not found");
            };
		}
	};
	HashTable.prototype.containsKey = function (key) {
		var hash = this.hashObject(key);
		return (this.pairs[hash] && (this.pairs[hash] instanceof KeyValuePair)) ? true : false;
	};
	HashTable.prototype.containsValue = function (val) {
		var ret = false;
		this.orderedPairs.map(function (item) {
			ret = ret || item.val === val;
		});
		return ret;
	};
	HashTable.prototype.isEmpty = function () { return this.size() === 0; };
	HashTable.prototype.size = function () { return this.orderedPairs.length; };
	//pass in function(key,val)
	HashTable.prototype.foreachInSet = function (theirFunction) {
        this.numOfActiveIterations++;
		this.orderedPairs.map(function (item) {
            if(!item.markedForDel) {
                theirFunction(item.key, item.val);
            }
		});
        this.numOfActiveIterations--;
	};
    HashTable.prototype.map = HashTable.prototype.foreachInSet;
	return HashTable;
}());

/*
 * Hash Set developed by Anthony Corbin
//*/
var HashSet = (function() {
	function HashSet() {
		this.myTable = new HashTable();
	}
	HashSet.prototype.add      = function (val)      { return this.myTable.add(val, true);       };
	HashSet.prototype.addAll   = function (vals)     { var potato = this; vals.map(function(item) { potato.myTable.add(item,true); }); };
	HashSet.prototype.contains = function (toCheck)  { return this.myTable.containsKey(toCheck); };
	HashSet.prototype.remove   = function (toRemove) { return this.myTable.remove(toRemove);     };
	HashSet.prototype.size     = function ()         { return this.myTable.size(); };
    
    HashSet.prototype.cross = function (that) {
		var ret = new HashSet();
		this.foreachInSet(function (a) {
            that.foreachInSet(function (b) {
                var toAdd = {
                    0: a,
                    1: b,
                };
                ret.add(toAdd);
            });
        });
		return ret;
	};
	HashSet.prototype.union = function (that) {
		var ret = new HashSet();
		this.foreachInSet(function (item) { ret.add(item); });
		that.foreachInSet(function (item) { ret.add(item); });
		return ret;
	};
	HashSet.prototype.join  = function (that) {
		var ret = new HashSet();
		this.myTable.foreachInSet(function (key, val) {
			if (that.contains(key)) { ret.add(key); }
		});
		return ret;
	};
    HashSet.prototype.removeSet = function (that) {
        that.foreachInSet(function(item) {
            this.remove(item); 
        });
	};
    HashSet.prototype.isEqual   = function (that) {
		return this.isSubsetOf(that) && that.isSuperSet(this);
	};
    HashSet.prototype.isSubSet  = function (that) {
		var ret = true;
		this.myTable.foreachInSet(function (item) {
            ret = ret && that.contains(item);
		});
		return ret;
	};
    HashSet.prototype.isSuperSet   = function (that) {
        return that.isSubSet(this);
	};
	HashSet.prototype.foreachInSet = function (theirFunction) {
		return this.myTable.foreachInSet(function(key,val) { theirFunction(key); });
	};
    HashSet.prototype.map = HashSet.prototype.foreachInSet;
    HashSet.prototype.toList = function () {
        var ret = [];
		this.foreachInSet(function (item) {
            ret.push(item);
		});
        return ret;
	};
    return HashSet;
})();

//endregion

//region classes
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
    this.positions = [];
    this.cells = [];
    this.valid = valid;
    this.alreadyOccupied = false;
}

function Item(type) {
    this.population = 0;
    this.direction = new Coord();
    this.strength = 0;
    this.type = type;
    this.getLevel = function() {
        return this.strength;
    };
    this.setToLevel = function(level) {
        this.strength = level;
    };
    this.duplicate = function() {
        var ret = new Item(this.type);
        ret.update     = this.update;
        ret.population = this.population;
        ret.direction  = this.direction;
        ret.strength   = this.strength;
        return ret;
    };
    this.isEqual = function(that) {
        if(that === null) { return false; }
        return this.getLevel() === that.getLevel() && 
               this.direction.isEqual(that.direction) && 
               this.strength === that.strength &&
               this.type === that.type;
    };
    this.decreaseLevel = function() {
        this.population -= this.population / this.getLevel();
        this.setToLevel(this.getLevel()-1);
    };
}
function Hazard(level) {
    this.pos = new Coord();
    this.direction = new Coord();
    this.level = level;
    this.getLevel = function() {
        return this.level;
    };
    this.setToLevel = function(level) {
        this.level = level;
    };
    this.duplicate = function() {
        var ret    = new Hazard(this.getLevel());
        ret.pos    = this.pos;
        ret.direction  = this.direction;
        ret.level  = this.level;
        return ret;
    };
    this.isEqual = function(that) {
        if(that === null) { return false; }
        return this.getLevel() === that.getLevel() && 
               this.direction.isEqual(that.direction) && 
               this.level === that.level;
    };
    this.decreaseLevel = function() {
        this.level--;
    };
}
var GameEvent = (function(){
    function GameEvent() {
        this.calls = new HashSet();
    }
    GameEvent.prototype.callAll = function(a,b,c,d,e,f,g) {
        this.calls.foreachInSet(function(item) { item(a,b,c,d,e,f,g); });
    };
    GameEvent.prototype.addCallBack = function(toAdd) {
        this.calls.add(toAdd);
    };
    GameEvent.prototype.removeCallBack = function (toKill) {
        this.calls.remove(toKill);
    };
    return GameEvent;
}());

function Spawner(freqLow,freqHigh, powerLow, powerHigh) {
    freqLow   = freqLow   || 5;
    freqHigh  = freqHigh  || 10;
    powerLow  = powerLow  || 3;
    powerHigh = powerHigh || 4;
    this.pos = new Coord();
    this.directions = [];
    //power of hazard
    this.powLow = powerLow;
    this.powHigh = powerHigh;
    
    //how often hazards are spawn
    this.freqLow = freqLow;
    this.freqHigh = freqHigh;
    this.turnsTillNextSpawn = Rand(this.freqLow,this.freqHigh); // will be updated based off freq
    //will be changed 
    this.updateTurns = function() {
        this.turnsTillNextSpawn--;
        if(this.turnsTillNextSpawn < 0) {
            this.turnsTillNextSpawn = Rand(this.freqLow,this.freqHigh);
            //spawn
            var ret = new Hazard(Rand(this.powLow,this.powHigh));
            ret.pos = this.pos;
            ret.direction = RandomElement(this.directions);
            return ret;
        }
        return null;
    };
}


//endregion

//region Game
var Game = (function() {
    //pass x,y or size
    function Game(x,y) {
        x = x || new Coord(5,5);
        this.size = y === undefined ? x : new Coord(x,y);
        this.turns = 42;
        this.Grid = [];
        this.ComboBoost = 3;
        this.avalableItemPool = [];

        this.spawners = [];
        this.trackedHazards = new HashSet();

        //region events

        //function(pos,oldItem, new item)
        this.itemChangedEvent = new GameEvent();
        //function(pos,hazard)
        this.hazardSpawnedEvent = new GameEvent();
        //function(oldPos,newPos)
        this.hazardMovedEvent = new GameEvent();
        //function(pos,hazard)
        this.hazardRemovedEvent = new GameEvent();

        //function()
        this.itemQChangedEvent = new GameEvent();
        //function()
        this.populationChangedEvent = new GameEvent();

        //endregion

        //region init
        var i;
        { // init pool
            var basicHouse = new Item(ItemType.Housing);
            basicHouse.population = 1;
            basicHouse.strength = 1;
            this.addItemToPool(basicHouse,5);
            //adding powerups
            this.addItemToPool(new Item(ItemType.BlackHole),1);
        }
        this.nextItemList = [];

        //init grid
        for(i=0;i<this.size.x;i++) {
            this.Grid[i] = [];
            for(var j=0;j<this.size.y;j++) {
                this.Grid[i][j] = new Cell(new Coord(i,j));
            }
        }

        //endregion

        //for building map
    }
    
    Game.prototype.getDims = function() { return this.size; };
    Game.prototype.setComboBoost = function(boost) {
        this.ComboBoost = boost;
    };
    Game.prototype.addSpawner = function(spawner) { this.spawners.push(spawner);};
    
    Game.prototype.addHazard = function(toAdd) { this.trackedHazards.add(toAdd); };
    Game.prototype.removeHazard = function(toKill) { this.trackedHazards.remove(toKill); };
    Game.prototype.addItemToPool = function(item,count) {
        count = count || 1;
        for(var i = 0 ;i<count;i++) {
            this.avalableItemPool.push(item.duplicate());
        }
    };
    Game.prototype.foreachCell = function(operation) {
        for(var i=0;i<this.size.x;i++) {
            for(var j=0;j<this.size.y;j++) {
                operation(this.Grid[i][j]);
            }
        }
    };
    //public functions
    Game.prototype.getTurnCount  = function() { return this.turns; };
    Game.prototype.popFromQ = function() {
        this.itemQ(0);
        var ret = this.nextItemList.shift();
        this.itemQChangedEvent.callAll();
        return ret;
    };
    Game.prototype.itemQ         = function(index) {
        while(this.nextItemList.length <= index) {
            this.nextItemList.push(RandomElement(this.avalableItemPool).duplicate());
        }
        return this.nextItemList[index];
    };
    Game.prototype.QueryMove     = function(pos,itemToPlace) {
        itemToPlace = itemToPlace || this.itemQ(0);
        var thisCell = this.getCell(pos);
        var ret = new Query(thisCell !== null);
        ret.alreadyOccupied = thisCell.item !== null;
        function pushToRet(cellToAdd) {
            ret.cells.push(cellToAdd);
            ret.positions.push(cellToAdd.pos);
        }

        var itemToCheck = itemToPlace.duplicate();
        var sameType;
        while( (sameType = this.MoveHelper(new HashSet(),this.getCell(pos),itemToCheck)).length >=3 ) {
            itemToCheck.setToLevel(itemToCheck.getLevel()+1);
            ret.levelBoost = itemToCheck.getLevel() - itemToPlace.getLevel();
            sameType.map(pushToRet);
        }
        ret.valid = ret.positions.length > 2;
        return ret;
    };
    Game.prototype.MoveHelper = function(visistedPool,current, item) {
        item = item || current.item;
        if(item === null) { throw new Error("must have item to compare with"); }
        var ret = [];
        if(current === null || visistedPool.contains(current)) { return ret; }

        visistedPool.add(current);
        ret.push(current);

        var sameTypeNeighbors = Where(this.getCellNeighbors(current.pos),function(that) { return item.isEqual(that.item); });
        var potato = this;
        sameTypeNeighbors.map(function(buddy) {
            var buddyPals = potato.MoveHelper(visistedPool,buddy); // this is breaking :(
            buddyPals.map(function(item) {
               ret.push(item); 
            });
        });
        return ret;
    };

    //pass
    //ApplyMove(Query)
    //ApplyMove(pos, optionalItem)
    Game.prototype.ApplyMove     = function(pos,itemToPlace, preloadedQuery) {
        if(pos instanceof(Query)) {
            preloadedQuery = pos;
            pos = preloadedQuery.cells[0].pos;
        }
        var thisCell = this.getCell(pos);
        if(thisCell === null) { throw new Error("Must apply move to valid cell"); }
        if(thisCell.item !== null) { console.log("warning placing ontop of existing cell"); }


        itemToPlace = itemToPlace || this.popFromQ();

        if(itemToPlace.type === ItemType.Housing) {
            preloadedQuery = preloadedQuery || this.QueryMove(pos,itemToPlace);

            this.avalableItemPool.push(itemToPlace.duplicate());

            var potato = this;
            if(preloadedQuery.valid) {
                preloadedQuery.cells.map(function(meCell) {
                    if(!meCell.pos.isEqual(pos)) {
                        itemToPlace.population += meCell.item.population;
                        var old = meCell.item;
                        meCell.item = null;
                        potato.itemChangedEvent.callAll(meCell.pos,old,null);
                    }
                });
                itemToPlace.population += preloadedQuery.levelBoost * this.ComboBoost;
                itemToPlace.setToLevel(itemToPlace.getLevel()+preloadedQuery.levelBoost);
                this.populationChangedEvent.callAll();
            }
            var old = thisCell.item;
            thisCell.item = itemToPlace;
            this.itemChangedEvent.callAll(thisCell.pos,old,itemToPlace);
            this.avalableItemPool.push(itemToPlace.duplicate());
        } else {
            if(itemToPlace.type === ItemType.BlackHole) {
                preloadedQuery = new Query(true);
                preloadedQuery.alreadyOccupied = thisCell.item !== null;
                thisCell.item = null;
            }
        }

        this.turns--;
        this.update();

        return preloadedQuery;
    };
    //pass x,y or pos
    Game.prototype.getCell       = function(x,y) {
        var pos = y === undefined ? x : new Coord(x,y);
        if(pos.withinBox(this.getDims())) { return this.Grid[pos.x][pos.y]; }
        return null;
    };
    Game.prototype.getCellNeighbors = function(cellPos) {
        var temp = null;
        var ret = [];
        temp = this.getCell(cellPos.add(new Coord( 1, 0))); if(temp !== null) { ret.push(temp); }
        temp = this.getCell(cellPos.add(new Coord( 0, 1))); if(temp !== null) { ret.push(temp); }
        temp = this.getCell(cellPos.add(new Coord(-1, 0))); if(temp !== null) { ret.push(temp); }
        temp = this.getCell(cellPos.add(new Coord( 0,-1))); if(temp !== null) { ret.push(temp); }
        return ret;
    };
    Game.prototype.getPopulation = function() {
        var ret = 0;
        this.foreachCell(function(cell) {
            ret += cell.item !== null ? cell.item.population : 0;
        });
        return ret;
    };
    
    Game.prototype.update = function() {
        var potato = this;
        this.trackedHazards.foreachInSet(function(item) {
            var oldPos = item.pos;
            item.pos = item.pos.add(item.direction);
            potato.hazardMovedEvent.callAll(oldPos,item.pos);
            var cell = potato.getCell(item.pos);
            if(cell !== null && cell.item !== null && cell.item.type === ItemType.Housing) {
                //hazard beats item
                var changed = false;
                while(item.getLevel() > 0 && cell.item.getLevel() > 0) {
                    item.decreaseLevel();
                    cell.item.decreaseLevel();
                    changed = true;
                }
                if(changed) {
                    if(cell.item.getLevel() === 0) {
                        var oldItem = cell.item;
                        cell.item = null;
                        potato.itemChangedEvent.callAll(oldItem.pos,oldItem,cell.item);
                    }
                }
            }
            item.decreaseLevel();
            if(item.getLevel() <= 0) {
                potato.hazardRemovedEvent.callAll(item.pos,item);
                potato.removeHazard(item);
            }
        });
        this.spawners.map(function(item) {
            var newHazard = item.updateTurns();
            if(newHazard !== null) {
                potato.addHazard(newHazard);
                potato.hazardSpawnedEvent.callAll(newHazard.pos,newHazard);
            }
        });
    };
    
    return Game;
}());




//endregion

















//message ticker


//make a pool of possible message to poll from when Q is empty

var MessageTicker = (function(){
    function MessageTicker() {
        this.characterQ = [];
        this.dilimiter = " ";
    }
    MessageTicker.prototype.addMessage = function(stringMsg) {
        var i;
        for(i = 0;i<stringMsg.length;i++) {
            this.characterQ.push(stringMsg.charAt(i));
        }
        for(i = 0;i<this.dilimiter.length;i++) {
            this.characterQ.push(stringMsg.charAt(i));
        }
    };
    MessageTicker.prototype.getString = function(length) {
        length = length || 100;
        var ret = "";
        for(var i = 0;i<length && i< this.characterQ.length;i++) {
            ret += this.characterQ[i];
        }
    };
    MessageTicker.prototype.update = function() {
        if(this.characterQ.length > 0) {
            this.characterQ.shift();
        }
    };
}());