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
Coord.prototype.isEqual  = function(that) { return this.x === that.x && this.y === that.y };
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

/**
 * Copyright 2013 Tim Down.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function HashSet(t,n){var e=new Hashtable(t,n);this.add=function(t){e.put(t,!0)},this.addAll=function(t){for(var n=0,r=t.length;r>n;++n)e.put(t[n],!0)},this.values=function(){return e.keys()},this.remove=function(t){return e.remove(t)?t:null},this.contains=function(t){return e.containsKey(t)},this.clear=function(){e.clear()},this.size=function(){return e.size()},this.isEmpty=function(){return e.isEmpty()},this.clone=function(){var r=new HashSet(t,n);return r.addAll(e.keys()),r},this.intersection=function(r){for(var i,u=new HashSet(t,n),o=r.values(),s=o.length;s--;)i=o[s],e.containsKey(i)&&u.add(i);return u},this.union=function(t){for(var n,r=this.clone(),i=t.values(),u=i.length;u--;)n=i[u],e.containsKey(n)||r.add(n);return r},this.isSubsetOf=function(t){for(var n=e.keys(),r=n.length;r--;)if(!t.contains(n[r]))return!1;return!0},this.complement=function(e){for(var r,i=new HashSet(t,n),u=this.values(),o=u.length;o--;)r=u[o],e.contains(r)||i.add(r);return i}}

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
}

function Item(type) {
    this.update = function () {};
    this.population = 0;
    this.direction = new Coord();
    this.strength = 0;
    this.type = type;
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
        return this.population === that.population && 
               this.direction.isEqual(that.direction) && 
               this.strength === that.strength &&
               this.type === that.type;
    };
}

function Spawner() {
    this.pos = new Coord();
    this.directions = [];
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

//endregion

function Game(size) { // pass in Coord of size
    
    this.size = size;
    this.turns = 42;
    this.Grid = [];
    this.ComboBoost = 2;
    this.avalableItemPool = [];
    //region init
    { // init pool
        var basicHouse = new Item(ItemType.Housing);
        basicHouse.population = 1;
        this.avalableItemPool.push(basicHouse);
    }
    this.nextItemList = [];
    
    //init grid
    for(var i=0;i<size.x;i++) {
        this.Grid[i] = [];
        for(var j=0;j<size.y;j++) {
            this.Grid[i][j] = new Cell(new Coord(i,j));
        }
    }
    
    //endregion
    
    this.foreachCell = function(operation) {
        for(var i=0;i<size.x;i++) {
            for(var j=0;j<size.y;j++) {
                operation(this.Grid[i][j]);
            }
        }
    };
    
    //public functions
    this.getTurnCount  = function() { return this.turns; };
    this.popFromQ = function() {
        return this.nextItemList.shift();
    };
    this.itemQ         = function(index) {
        while(this.nextItemList.length < index) {
            this.nextItemList.push(RandomElement(this.avalableItemPool).duplicate());
        }
        return this.nextItemList[index];
    };
    this.QueryMove     = function(pos,itemToPlace) {
        var thisCell = this.getCell(pos);
        var ret = new Query(thisCell !== null);
        function pushToRet(cellToAdd) {
            ret.cells.push(cellToAdd);
            ret.positions.push(cellToAdd.pos);
        }
        
        var itemToCheck = itemToPlace.duplicate();
        var sameType;
        while( (sameType = this.MoveHelper(new HashSet(),this.getCell(pos),itemToCheck)).length >=3 ) {
            itemToCheck.population++;
            ret.levelBoost++;
            sameType.map(pushToRet);
        }
        ret.valid = ret.positions.length > 2;
        return ret;
    };
    this.MoveHelper = function(visistedPool,current, item) {
        item = item || current.item;
        if(item === null) { throw new Error("must have item to compare with"); }
        var ret = [];
        if(current === null || visistedPool.contains(current)) { return ret; }
        
        visistedPool.add(current);
        ret.add(current);
        
        var sameTypeNeighbors = Where(this.getCellNeighbors(current.pos),function(that) { return item.isEqual(that); });
        sameTypeNeighbors.map(function(buddy) {
            var buddyPals = this.MoveHelper(visistedPool,buddy);
            buddyPals.map(function(item) {
               ret.add(item); 
            });
        });
        return ret;
    };
    
    this.ApplyMove     = function(pos,itemToPlace, preloadedQuery) {
        var thisCell = this.getCell(pos);
        if(thisCell === null) { throw new Error("Must apply move to valid cell"); }
        if(thisCell.item !== null) { console.log("warning placing ontop of existing cell"); }
        
        preloadedQuery = preloadedQuery || this.QueryMove(pos,itemToPlace);
        
        if(preloadedQuery.valid) {
            preloadedQuery.cells.map(function(meCell) {
                itemToPlace.population += meCell.item.population;
                meCell.item = null;
            });
            itemToPlace.population += preloadedQuery.levelBoost * this.ComboBoost;
        }
        thisCell.item = itemToPlace;
        this.avalableItemPool.push(itemToPlace.duplicate());
        
        this.turns--;
        
        return preloadedQuery;
    };
    this.getCell       = function(pos) {
        if(pos.withinBox(this.getDims())) { return this.Grid[pos.x][pos.y]; }
        return null;
    };
    this.getCellNeighbors = function(cellPos) {
        var temp = null;
        var ret = [];
        temp = this.getCell(cellPos.add(new Coord( 1, 0))); if(temp !== null) { ret.add(temp); }
        temp = this.getCell(cellPos.add(new Coord( 0, 1))); if(temp !== null) { ret.add(temp); }
        temp = this.getCell(cellPos.add(new Coord(-1, 0))); if(temp !== null) { ret.add(temp); }
        temp = this.getCell(cellPos.add(new Coord( 0,-1))); if(temp !== null) { ret.add(temp); }
        return ret;
    };
    this.getPopulation = function() {
        var ret = 0;
        this.foreachCell(function(cell) {
            ret += cell.item !== null ? cell.item.population : 0;
        });
        return ret;
    };
    this.update = function() {
        console.log("lolz");
    };
    
    //for building map
    this.setComboBoost = function(boost) { boost = boost; };
    this.setSpawner = function(pos,spawner) { pos = pos; spawner = spawner;};
    this.getDims = function() { return size; };
}