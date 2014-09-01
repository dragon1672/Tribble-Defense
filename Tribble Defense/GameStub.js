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

/**
 * HashSet
 *
 * This is a JavaScript implementation of HashSet, similar in concept to those found in Java or C#'s standard libraries.
 * It is distributed as part of jshashtable and depends on jshashtable.js. It creates a single constructor function
 * called HashSet in the global scope.
 *
 * Depends on: jshashtable.js
 * Author: Tim Down <tim@timdown.co.uk>
 * Version: 3.0
 * Build date: 17 July 2013
 * Website: http://www.timdown.co.uk/jshashtable/
 */

function HashSet(param1, param2) {
    var hashTable = new Hashtable(param1, param2);

    this.add = function(o) {
        hashTable.put(o, true);
    };

    this.addAll = function(arr) {
        for (var i = 0, len = arr.length; i < len; ++i) {
            hashTable.put(arr[i], true);
        }
    };

    this.values = function() {
        return hashTable.keys();
    };

    this.remove = function(o) {
        return hashTable.remove(o) ? o : null;
    };

    this.contains = function(o) {
        return hashTable.containsKey(o);
    };

    this.clear = function() {
        hashTable.clear();
    };

    this.size = function() {
        return hashTable.size();
    };

    this.isEmpty = function() {
        return hashTable.isEmpty();
    };

    this.clone = function() {
        var h = new HashSet(param1, param2);
        h.addAll(hashTable.keys());
        return h;
    };

    this.intersection = function(hashSet) {
        var intersection = new HashSet(param1, param2);
        var values = hashSet.values(), i = values.length, val;
        while (i--) {
            val = values[i];
            if (hashTable.containsKey(val)) {
                intersection.add(val);
            }
        }
        return intersection;
    };

    this.union = function(hashSet) {
        var union = this.clone();
        var values = hashSet.values(), i = values.length, val;
        while (i--) {
            val = values[i];
            if (!hashTable.containsKey(val)) {
                union.add(val);
            }
        }
        return union;
    };

    this.isSubsetOf = function(hashSet) {
        var values = hashTable.keys(), i = values.length;
        while (i--) {
            if (!hashSet.contains(values[i])) {
                return false;
            }
        }
        return true;
    };

    this.complement = function(hashSet) {
        var complement = new HashSet(param1, param2);
        var values = this.values(), i = values.length, val;
        while (i--) {
            val = values[i];
            if (!hashSet.contains(val)) {
                complement.add(val);
            }
        }
        return complement;
    };
}

/**
 * @license jahashtable, a JavaScript implementation of a hash table. It creates a single constructor function called
 * Hashtable in the global scope.
 *
 * http://www.timdown.co.uk/jshashtable/
 * Copyright 2013 Tim Down.
 * Version: 3.0
 * Build date: 17 July 2013
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
var Hashtable = (function(UNDEFINED) {
    var FUNCTION = "function", STRING = "string", UNDEF = "undefined";

    // Require Array.prototype.splice, Object.prototype.hasOwnProperty and encodeURIComponent. In environments not
    // having these (e.g. IE <= 5), we bail out now and leave Hashtable null.
    if (typeof encodeURIComponent == UNDEF ||
            Array.prototype.splice === UNDEFINED ||
            Object.prototype.hasOwnProperty === UNDEFINED) {
        return null;
    }

    function toStr(obj) {
        return (typeof obj == STRING) ? obj : "" + obj;
    }

    function hashObject(obj) {
        var hashCode;
        if (typeof obj == STRING) {
            return obj;
        } else if (typeof obj.hashCode == FUNCTION) {
            // Check the hashCode method really has returned a string
            hashCode = obj.hashCode();
            return (typeof hashCode == STRING) ? hashCode : hashObject(hashCode);
        } else {
            return toStr(obj);
        }
    }
    
    function merge(o1, o2) {
        for (var i in o2) {
            if (o2.hasOwnProperty(i)) {
                o1[i] = o2[i];
            }
        }
    }

    function equals_fixedValueHasEquals(fixedValue, variableValue) {
        return fixedValue.equals(variableValue);
    }

    function equals_fixedValueNoEquals(fixedValue, variableValue) {
        return (typeof variableValue.equals == FUNCTION) ?
            variableValue.equals(fixedValue) : (fixedValue === variableValue);
    }

    function createKeyValCheck(kvStr) {
        return function(kv) {
            if (kv === null) {
                throw new Error("null is not a valid " + kvStr);
            } else if (kv === UNDEFINED) {
                throw new Error(kvStr + " must not be undefined");
            }
        };
    }

    var checkKey = createKeyValCheck("key"), checkValue = createKeyValCheck("value");

    /*----------------------------------------------------------------------------------------------------------------*/

    function Bucket(hash, firstKey, firstValue, equalityFunction) {
        this[0] = hash;
        this.entries = [];
        this.addEntry(firstKey, firstValue);

        if (equalityFunction !== null) {
            this.getEqualityFunction = function() {
                return equalityFunction;
            };
        }
    }

    var EXISTENCE = 0, ENTRY = 1, ENTRY_INDEX_AND_VALUE = 2;

    function createBucketSearcher(mode) {
        return function(key) {
            var i = this.entries.length, entry, equals = this.getEqualityFunction(key);
            while (i--) {
                entry = this.entries[i];
                if ( equals(key, entry[0]) ) {
                    switch (mode) {
                        case EXISTENCE:
                            return true;
                        case ENTRY:
                            return entry;
                        case ENTRY_INDEX_AND_VALUE:
                            return [ i, entry[1] ];
                    }
                }
            }
            return false;
        };
    }

    function createBucketLister(entryProperty) {
        return function(aggregatedArr) {
            var startIndex = aggregatedArr.length;
            for (var i = 0, entries = this.entries, len = entries.length; i < len; ++i) {
                aggregatedArr[startIndex + i] = entries[i][entryProperty];
            }
        };
    }

    Bucket.prototype = {
        getEqualityFunction: function(searchValue) {
            return (typeof searchValue.equals == FUNCTION) ? equals_fixedValueHasEquals : equals_fixedValueNoEquals;
        },

        getEntryForKey: createBucketSearcher(ENTRY),

        getEntryAndIndexForKey: createBucketSearcher(ENTRY_INDEX_AND_VALUE),

        removeEntryForKey: function(key) {
            var result = this.getEntryAndIndexForKey(key);
            if (result) {
                this.entries.splice(result[0], 1);
                return result[1];
            }
            return null;
        },

        addEntry: function(key, value) {
            this.entries.push( [key, value] );
        },

        keys: createBucketLister(0),

        values: createBucketLister(1),

        getEntries: function(destEntries) {
            var startIndex = destEntries.length;
            for (var i = 0, entries = this.entries, len = entries.length; i < len; ++i) {
                // Clone the entry stored in the bucket before adding to array
                destEntries[startIndex + i] = entries[i].slice(0);
            }
        },

        containsKey: createBucketSearcher(EXISTENCE),

        containsValue: function(value) {
            var entries = this.entries, i = entries.length;
            while (i--) {
                if ( value === entries[i][1] ) {
                    return true;
                }
            }
            return false;
        }
    };

    /*----------------------------------------------------------------------------------------------------------------*/

    // Supporting functions for searching hashtable buckets

    function searchBuckets(buckets, hash) {
        var i = buckets.length, bucket;
        while (i--) {
            bucket = buckets[i];
            if (hash === bucket[0]) {
                return i;
            }
        }
        return null;
    }

    function getBucketForHash(bucketsByHash, hash) {
        var bucket = bucketsByHash[hash];

        // Check that this is a genuine bucket and not something inherited from the bucketsByHash's prototype
        return ( bucket && (bucket instanceof Bucket) ) ? bucket : null;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    function Hashtable() {
        var buckets = [];
        var bucketsByHash = {};
        var properties = {
            replaceDuplicateKey: true,
            hashCode: hashObject,
            equals: null
        };

        var arg0 = arguments[0], arg1 = arguments[1];
        if (arg1 !== UNDEFINED) {
            properties.hashCode = arg0;
            properties.equals = arg1;
        } else if (arg0 !== UNDEFINED) {
            merge(properties, arg0);
        }

        var hashCode = properties.hashCode, equals = properties.equals;

        this.properties = properties;

        this.put = function(key, value) {
            checkKey(key);
            checkValue(value);
            var hash = hashCode(key), bucket, bucketEntry, oldValue = null;

            // Check if a bucket exists for the bucket key
            bucket = getBucketForHash(bucketsByHash, hash);
            if (bucket) {
                // Check this bucket to see if it already contains this key
                bucketEntry = bucket.getEntryForKey(key);
                if (bucketEntry) {
                    // This bucket entry is the current mapping of key to value, so replace the old value.
                    // Also, we optionally replace the key so that the latest key is stored.
                    if (properties.replaceDuplicateKey) {
                        bucketEntry[0] = key;
                    }
                    oldValue = bucketEntry[1];
                    bucketEntry[1] = value;
                } else {
                    // The bucket does not contain an entry for this key, so add one
                    bucket.addEntry(key, value);
                }
            } else {
                // No bucket exists for the key, so create one and put our key/value mapping in
                bucket = new Bucket(hash, key, value, equals);
                buckets.push(bucket);
                bucketsByHash[hash] = bucket;
            }
            return oldValue;
        };

        this.get = function(key) {
            checkKey(key);

            var hash = hashCode(key);

            // Check if a bucket exists for the bucket key
            var bucket = getBucketForHash(bucketsByHash, hash);
            if (bucket) {
                // Check this bucket to see if it contains this key
                var bucketEntry = bucket.getEntryForKey(key);
                if (bucketEntry) {
                    // This bucket entry is the current mapping of key to value, so return the value.
                    return bucketEntry[1];
                }
            }
            return null;
        };

        this.containsKey = function(key) {
            checkKey(key);
            var bucketKey = hashCode(key);

            // Check if a bucket exists for the bucket key
            var bucket = getBucketForHash(bucketsByHash, bucketKey);

            return bucket ? bucket.containsKey(key) : false;
        };

        this.containsValue = function(value) {
            checkValue(value);
            var i = buckets.length;
            while (i--) {
                if (buckets[i].containsValue(value)) {
                    return true;
                }
            }
            return false;
        };

        this.clear = function() {
            buckets.length = 0;
            bucketsByHash = {};
        };

        this.isEmpty = function() {
            return !buckets.length;
        };

        var createBucketAggregator = function(bucketFuncName) {
            return function() {
                var aggregated = [], i = buckets.length;
                while (i--) {
                    buckets[i][bucketFuncName](aggregated);
                }
                return aggregated;
            };
        };

        this.keys = createBucketAggregator("keys");
        this.values = createBucketAggregator("values");
        this.entries = createBucketAggregator("getEntries");

        this.remove = function(key) {
            checkKey(key);

            var hash = hashCode(key), bucketIndex, oldValue = null;

            // Check if a bucket exists for the bucket key
            var bucket = getBucketForHash(bucketsByHash, hash);

            if (bucket) {
                // Remove entry from this bucket for this key
                oldValue = bucket.removeEntryForKey(key);
                if (oldValue !== null) {
                    // Entry was removed, so check if bucket is empty
                    if (bucket.entries.length === 0) {
                        // Bucket is empty, so remove it from the bucket collections
                        bucketIndex = searchBuckets(buckets, hash);
                        buckets.splice(bucketIndex, 1);
                        delete bucketsByHash[hash];
                    }
                }
            }
            return oldValue;
        };

        this.size = function() {
            var total = 0, i = buckets.length;
            while (i--) {
                total += buckets[i].entries.length;
            }
            return total;
        };
    }

    Hashtable.prototype = {
        each: function(callback) {
            var entries = this.entries(), i = entries.length, entry;
            while (i--) {
                entry = entries[i];
                callback(entry[0], entry[1]);
            }
        },

        equals: function(hashtable) {
            var keys, key, val, count = this.size();
            if (count == hashtable.size()) {
                keys = this.keys();
                while (count--) {
                    key = keys[count];
                    val = hashtable.get(key);
                    if (val === null || val !== this.get(key)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        },

        putAll: function(hashtable, conflictCallback) {
            var entries = hashtable.entries();
            var entry, key, value, thisValue, i = entries.length;
            var hasConflictCallback = (typeof conflictCallback == FUNCTION);
            while (i--) {
                entry = entries[i];
                key = entry[0];
                value = entry[1];

                // Check for a conflict. The default behaviour is to overwrite the value for an existing key
                if ( hasConflictCallback && (thisValue = this.get(key)) ) {
                    value = conflictCallback(key, thisValue, value);
                }
                this.put(key, value);
            }
        },

        clone: function() {
            var clone = new Hashtable(this.properties);
            clone.putAll(this);
            return clone;
        }
    };

    Hashtable.prototype.toQueryString = function() {
        var entries = this.entries(), i = entries.length, entry;
        var parts = [];
        while (i--) {
            entry = entries[i];
            parts[i] = encodeURIComponent( toStr(entry[0]) ) + "=" + encodeURIComponent( toStr(entry[1]) );
        }
        return parts.join("&");
    };

    return Hashtable;
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
    
    //for building map
    this.setComboBoost = function(boost) { boost = boost; };
    this.setSpawner = function(pos,spawner) { pos = pos; spawner = spawner;};
    this.getDims = function() { return size; };
}



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
    return this.nextItemList.shift();
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

Game.prototype.ApplyMove     = function(pos,itemToPlace, preloadedQuery) {
    var thisCell = this.getCell(pos);
    if(thisCell === null) { throw new Error("Must apply move to valid cell"); }
    if(thisCell.item !== null) { console.log("warning placing ontop of existing cell"); }

    preloadedQuery = preloadedQuery || this.QueryMove(pos,itemToPlace);
    itemToPlace = itemToPlace || this.popFromQ();

    if(preloadedQuery.valid) {
        preloadedQuery.cells.map(function(meCell) {
            if(!meCell.pos.isEqual(pos)) {
                itemToPlace.population += meCell.item.population;
                meCell.item = null;
            }
        });
        itemToPlace.population += preloadedQuery.levelBoost * this.ComboBoost;
    }
    thisCell.item = itemToPlace;
    this.avalableItemPool.push(itemToPlace.duplicate());

    this.turns--;

    return preloadedQuery;
};
Game.prototype.getCell       = function(pos) {
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
    console.log("lolz");
};
