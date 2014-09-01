/*jslint browser:true */
/*global createjs */
/*global Box2D */
/*global console */
//*jslint vars: false */
//*jslint unused: false */

//region TEMPLATE
var stage;
var FPS = 30;

//region keyCodes
    var KEYCODE_LEFT  = 37;
    //var KEYCODE_UP    = 38;
    var KEYCODE_RIGHT = 39;
    var KEYCODE_DOWN  = 40;
    var KEYCODE_PLUS  = 187;
    var KEYCODE_MINUS = 189;
//endregion

//region gameStates
    function GameState (title) {
        this.title = title;
        this.container = new createjs.Container();
        this.masterEnable  = function() { this.container.visible = true;  this.enable();  };
        this.masterDisable = function() { this.container.visible = false; this.disable(); };
        // should override the following
        this.mouseDownEvent = function(e) { e=e; };
        this.mouseUpEvent = function(e) { e=e; };
        this.enable  = function() { };
        this.disable = function() { };
        this.update  = function() {};
    }
    var GameStates = {
        EMPTY : new GameState("empty"),
        Loading : new GameState("loading"),
        StartScreen : new GameState("start"),
        Instructions: new GameState("instructions"),
        Credits: new GameState("credits"),
        Game : new GameState("game"),
        GameOver : new GameState("game over"),
    };
    var CurrentGameState = GameStates.Loading;
    var LastGameState = GameStates.EMPTY;

//endregion

//region Classes
    function Timer() {
        this.gameTimer = 0;
        this.frameCount = 0;
    }
    Timer.prototype.update = function(FPS) {
        this.frameCount = Math.max(0,this.frameCount+1);
        // lets make this only count 1/10s of a second
        if(this.frameCount%(FPS/10) === 0) {
            this.gameTimer = this.frameCount/(FPS);   
        }
    };
    Timer.prototype.reset = function() {
        this.frameCount = 0;
        this.gameTimer = 0;
    };
    Timer.prototype.addSeconds = function(seconds, FPS) {
        this.frameCount += seconds * FPS;
    };
    
    function Coord(existingCoord) {
        return Coord(existingCoord.x,existingCoord.y);
    }
    function Coord(x,y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    Coord.prototype.toString = function() { return "{"+this.x+","+this.y+"}"; };
    Coord.prototype.isEqual  = function(that) { return this.x === that.x && this.y === that.y; };
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
    Coord.prototype.floor      = function()     { return new Coord(Math.floor(this.x),Math.floor(this.y)); };

    //will have to make and manager per scene
    function KeyStateManager(KEYCODE) {
        if(typeof(KEYCODE) === 'string') { KEYCODE = KEYCODE.charCodeAt(0); }
        this.keyCode = KEYCODE;
        this.numOfFramesClicked = 0;
        
        // override me
        this.onClick = function() {};
    }
    KeyStateManager.prototype.update = function() {
        this.numOfFramesClicked = keyStates[this.keyCode] === true ? this.numOfFramesClicked + 1 : 0;
        if(this.isDown()) { this.onClick(); }
    };
    KeyStateManager.prototype.isDown = function() { return this.numOfFramesClicked === 1; };
//endregion

//region functions
    function stackButtons(buttons, padding) {
        var offset = stage.canvas.height - padding;
        buttons.reverse();
        buttons.map(function(item) {
            if(typeof(item) != 'undefined' && typeof item.getBounds === 'function') {
                var pos = {
                    x: stage.canvas.width / 2 - item.getBounds().width / 2,
                    y: offset - item.getBounds().height / 2,
                };

                offset -= item.getBounds().height + padding;
                item.x = pos.x;
                item.y = pos.y;
            }
        });
    }
    function moveAndLoop(object,speed,radius) {
        object.x += speed;
        if(object.x - radius > stage.canvas.width) {
            object.x = -radius;
        }
    }
    function generateRegButton(title) {
        return function(button,onClickMethod) {
            button.gotoAndStop(title+"Up");
            button.on("click", onClickMethod);
            button.on("mouseover", function(evt) { evt = evt; button.gotoAndStop(title+"Over"); });
            button.on("mouseout",  function(evt) { evt = evt; button.gotoAndStop(title+"Up"); });
            button.on("mousedown", function(evt) { evt = evt; button.gotoAndStop(title+"Down"); });
            return button;
        };
    }
    function CreateButtonFromSprite(btnPlay, title, onClickMethod) {
        generateRegButton(title)(btnPlay,onClickMethod);
        return btnPlay;
    }
    //condition is a function(a) reutrns true/false
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
//endregion

//region loading files
var manifest = [
    {src:"audio/Loading.mp3", id:"Loading"},
    {src:"images/Static/Title.png", id:"title"},
    {src:"images/Terrain/BackgroundBase.png", id:"background"},
    {src:"images/Terrain/pathOpen.png", id:"path"},
    {src:"audio/GameOver.mp3", id:"Failure"},
    {src:"images/Static/Instructions.png", id:"instructions"},
    {src:"images/Static/Credits.png", id:"credits"},
    {src:"audio/GamePlay.mp3", id:"GamePlay"},
    {src:"images/Static/GameOverPurplePlanet.png", id:"gameover"},
    {src:"images/buttons.png", id:"button"},
    {src:"images/SpeakerOn.png", id:"SpeakerOn"},
    {src:"audio/StartScreen.mp3", id:"StartScreen"},
    {src:"images/SpeakerOff.png", id:"SpeakerOff"},
    {src:"images/Barrier.png", id:"Barrier"},
    {src:"images/Hazard/LightningBolt.png", id:"bolt"},
    {src:"images/Population/purplePop1.png", id:"pop1"},
    {src:"images/Population/purplePop2.png", id:"pop2"},
    {src:"images/Population/purplePop3.png", id:"pop3"},
    {src:"images/Population/purplePop4.png", id:"pop4"},
    {src:"images/Population/purplePop5.png", id:"pop5"},
];

var queue;

var backgroundMusic = {
    //private
    _enabled: true,
    _src: null,
    //public
    
    //allows audio to play
    enable: function() {
        if(!this._enabled && this._src !== null) {
            this._src.resume();
        }
        this._enabled = true;
    },
    
    //audio will stop
    disable: function() {
        if(this._src!==null) { this._src.pause(); }
        this._enabled = false;
    },
    
    //changes audio, if existing audio is playing, it will be stopped
    //will only play if already enabled
    setSound: function(newGuy) {
        var temp = this._enabled;
        this.disable();
        this._src = newGuy;
        this.disable();
        if(temp) { this.enable(); }
    },
    setSoundFromString: function(audioKey, loop) {
        var willLoop = loop ? {loop:-1} : null;
        var audio = createjs.Sound.play(audioKey,willLoop);
        this.setSound(audio);
    },
    //static functions
    isPaused: function(audio)    { return !audio.paused; },
    toggleMusic: function(audio) {
        return this.isPaused(audio) ? audio.resume() || true : audio.pause() && false;
    },
    
    //stops and sets audio src to null
    removeSound: function() {
        var temp = this._enabled;
        this.disable();
        this._src = null;
        this._enabled = temp;
    },
    
};

var spriteSheets = {
    buttons: null,
    barrier: null,
    makeButton: function() {
        return (new createjs.Sprite(this.buttons));
    },
    makeBarrier: function() {
        return (new createjs.Sprite(this.barrier));
    },
    mainCharacter: null
};

function loadImage(key) {
    return new createjs.Bitmap(queue.getResult(key));
}

function loadFiles() {
    
    
    queue = new createjs.LoadQueue(true, "assets/");  //files are stored in 'images' directory
    createjs.Sound.alternateExtensions = ["mp3"];
    queue.installPlugin(createjs.Sound);
    queue.on("complete", LoadComplete, this);  
    queue.on("progress", handleProgress, this);
    queue.addEventListener("fileload",playSound);
    function playSound(event) {
        if(event.item.id == "Loading") {
            backgroundMusic.setSoundFromString(event.item.src,true);
        }
    }
    
    var progress = new createjs.Shape(); 
    var progressBellow = new createjs.Shape();
    var txt = new createjs.Text();

    function ShapeData(widthPercent, height) {
        this.width = stage.canvas.width * widthPercent;
        this.height = height;
        this.x = stage.canvas.width / 2 - this.width / 2;
        this.y = stage.canvas.height / 2 - this.height / 2;
    }

    var dims = new ShapeData(50/100,100);

    progress.graphics.beginStroke("#280000").drawRect(dims.x,dims.y,dims.width,dims.height);
    progressBellow.graphics.beginStroke("#280000").drawRect(dims.x,dims.y,dims.width,dims.height);
    txt.x = dims.x+2;
    txt.y = dims.y+(dims.height) / 2 - 9;
    txt.font = ("13px Verdana");
    txt.color = ("#17A");
    
    function handleProgress(event) {
        progress.graphics.clear();
        // Draw the progress bar
        progress.graphics.beginFill("#ccc").drawRect(dims.x,dims.y,dims.width*(event.loaded / event.total),dims.height);
        txt.text = ("Loading " + 100*(event.loaded / event.total) + "%");
        stage.update();
    }
    function LoadComplete(event) {
        event = event;
        //once the files are loaded, put them into usable objects
        txt.text = "Click to continue";
        backgroundMusic.allLoaded = true;
        backgroundMusic.enable();
        progress.on("click",function() {
            backgroundMusic.setSoundFromString("StartScreen",true);
            initSprites();
            init();
        });
    }
    GameStates.Loading.container.addChild(progress,progressBellow,txt);
    
    queue.loadManifest(manifest);  //load files listed in 'manifest'
}

function initSprites() {
    var buttonSheet = new createjs.SpriteSheet({
        images: [queue.getResult("button")],
        frames: {width: 94, height: 33, regX: 46, regY: 15},
        animations: {
        playUp:   [0, 0, "playUp"],
        playOver: [1, 1, "playOver"],
        playDown: [2, 2, "playDown"],
        instructUp:   [3, 3, "instructUp"],
        instructOver: [4, 4, "instructOver"],
        instructDown: [5, 5, "instructDown"],
        menuUp:   [6, 6, "menuUp"],
        menuOver: [7, 7, "menuOver"],
        menuDown: [8, 8, "menuDown"],
        creditsUp:   [9, 9,   "creditsUp"],
        creditsOver: [10, 10, "creditsOver"],
        creditsDown: [11, 11, "creditsDown"],
        } 
    });
    spriteSheets.buttons = buttonSheet;
    //This takes the images loaded from the sprite sheet and breaks it into the individual frames. I cut and pasted the 'frames' parameter from the .js file created by Flash when I exported in easelJS format. I didn't cut and paste anything except 'frames' because I am using preloadJS to load all the images completely before running the game. That's what the queue.getResult is all about.
	
    
    spriteSheets.barrier = new createjs.SpriteSheet({
        images: [queue.getResult("Barrier")],
        frames: [[0,0,185,184,0,-4.4,6.7],[185,0,185,184,0,-4.4,6.7],[0,184,185,184,0,-4.4,6.7],[185,184,185,184,0,-4.4,6.7]],
        animations: {
            pulse:   [0, 3, "pulse",0.5]
        }     
    });
}

//endregion

//region init
    //region global assets (mouse and keys)
        var mouse = {
            pos: new Coord(),
            isDown: false,
        };
        function mouseInit() {
            stage.enableMouseOver();
            stage.on("stagemousemove", function(evt) {
                mouse.pos.x = Math.floor(evt.stageX);
                mouse.pos.y = Math.floor(evt.stageY);
            });
            stage.on("stagemousedown",function(e) {
                CurrentGameState.mouseDownEvent(e);
                mouse.isDown = true;
            });
            stage.on("stagemouseup",function(e) {
                CurrentGameState.mouseUpEvent(e);
                mouse.isDown = false;
            });
        }
        
        //universial across all scenes
        var keyStates = [];
        function handleKeyDown(evt) {
            if(!CurrentGameState) { return; }
            if(!evt){ evt = window.event; }  //browser compatibility
            keyStates[evt.keyCode] = true;
            //console.log(evt.keyCode+"up");
        }
        function handleKeyUp(evt) {
            if(!CurrentGameState) { return; }
            if(!evt){ evt = window.event; }  //browser compatibility
            keyStates[evt.keyCode] = false;
            //console.log(evt.keyCode+"down");
        }
        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
    //endregion
    
    function setupCanvas() {
        var canvas = document.getElementById("game");
        canvas.width = 800;
        canvas.height = 600;
        stage = new createjs.Stage(canvas);
    }

    function registerGameLoop() {
        function loop() {
            if(CurrentGameState != LastGameState) {
                LastGameState.masterDisable();
                CurrentGameState.masterEnable();
            }
            LastGameState = CurrentGameState;
            CurrentGameState.update();
            stage.update();
        }
        createjs.Ticker.addEventListener("tick", loop);
        createjs.Ticker.setFPS(FPS);
    }
    
    function main() {
        setupCanvas();
        mouseInit();
        initLoadingScreen();
        registerGameLoop();

        loadFiles();
    }
    
    if (!!(window.addEventListener)) {
        window.addEventListener("DOMContentLoaded", main);
    } else { // if IE
        window.attachEvent("onload", main);
    }
//endregion

var score = 0;

//to be called after files have been loaded
function init() {
    GameStates.StartScreen.container.addChild(  loadImage("title")        );
    GameStates.Game.container.addChild(         loadImage("background")   );
    GameStates.Instructions.container.addChild( loadImage("instructions") );
    GameStates.Credits.container.addChild(      loadImage("credits") );
    GameStates.GameOver.container.addChild(     loadImage("gameover")     );
    stage.addChild(GameStates.EMPTY.container);         GameStates.EMPTY.masterDisable();
    stage.addChild(GameStates.StartScreen.container);   GameStates.StartScreen.masterDisable();
    stage.addChild(GameStates.Instructions.container);  GameStates.Instructions.masterDisable();
    stage.addChild(GameStates.Credits.container);       GameStates.Credits.masterDisable();
    stage.addChild(GameStates.Game.container);          GameStates.Game.masterDisable();
    stage.addChild(GameStates.GameOver.container);      GameStates.GameOver.masterDisable();
    
    //adding speaker
    var speaker = {
        onImg: loadImage("SpeakerOn"),
        offImg: loadImage("SpeakerOff"),
    };
    speaker.onImg.x = stage.canvas.width  - speaker.onImg.getBounds().width;
    speaker.onImg.y = stage.canvas.height - speaker.onImg.getBounds().height;
    speaker.offImg.x = speaker.onImg.x;
    speaker.offImg.y = speaker.onImg.y;
    speaker.onImg.on("click", function() {
        speaker.onImg.visible  = false;
        speaker.offImg.visible = true;
        backgroundMusic.disable();
    });
    speaker.offImg.on("click", function() {
        speaker.offImg.visible = false;
        speaker.onImg.visible  = true;
        backgroundMusic.enable();
    });
    speaker.offImg.visible = false;
    stage.addChild(speaker.onImg);
    stage.addChild(speaker.offImg);
    
    
    //init start
    {
        var BTN = [];
        BTN.push(CreateButtonFromSprite(spriteSheets.makeButton(),"play",    function() { CurrentGameState = GameStates.Game;         }));
        BTN.push(CreateButtonFromSprite(spriteSheets.makeButton(),"instruct",function() { CurrentGameState = GameStates.Instructions; }));
        BTN.push(CreateButtonFromSprite(spriteSheets.makeButton(),"credits", function() { CurrentGameState = GameStates.Credits;      }));
        
        stackButtons(BTN,10);
        
        BTN.map(function(item) {
            GameStates.StartScreen.container.addChild(item);
        });
    }
    var PADDING = 5;
    //init instructions
    {
        var BTN_mainMenu = spriteSheets.makeButton();
        CreateButtonFromSprite(BTN_mainMenu,"menu",function() { CurrentGameState = GameStates.StartScreen; });
        BTN_mainMenu.x = stage.canvas.width - BTN_mainMenu.getBounds().width - PADDING;
        BTN_mainMenu.y = stage.canvas.height - BTN_mainMenu.getBounds().height - PADDING;
        GameStates.Instructions.container.addChild(BTN_mainMenu);
        
    }
    //init credits
    {
        var BTN_mainMenu_creditsScreen = CreateButtonFromSprite(spriteSheets.makeButton(),"menu",function() { CurrentGameState = GameStates.StartScreen; });
        BTN_mainMenu_creditsScreen.x = stage.canvas.width - BTN_mainMenu_creditsScreen.getBounds().width - PADDING;
        BTN_mainMenu_creditsScreen.y = stage.canvas.height - BTN_mainMenu_creditsScreen.getBounds().height - PADDING;
        GameStates.Credits.container.addChild(BTN_mainMenu_creditsScreen);
        
    }
    //init game
    initGameScene(GameStates.Game.container);
    //init gameOver
    {
        var finalScore = new createjs.Text("Score:\n"+score, "50px Arial", "#000");
        finalScore.x = stage.canvas.width / 2 - 50;
        finalScore.y = stage.canvas.height / 2;
        GameStates.GameOver.container.addChild(finalScore);
        
        var btn = spriteSheets.makeButton();
        CreateButtonFromSprite(btn,"menu",function() { CurrentGameState = GameStates.StartScreen; });
        
        GameStates.GameOver.container.addChild(btn);
        GameStates.GameOver.enable = function() {
        backgroundMusic.setSoundFromString("Failure",true);
        };
        var btns = [btn];
        stackButtons(btns,10);
        GameStates.GameOver.update = function() {
            finalScore.text = "Score:\n"+score;
        };
    }
    CurrentGameState = GameStates.StartScreen;
}
//progress bar will run anything listed here should only be animation stuff without using any images
function initLoadingScreen() {
    var circle = new createjs.Shape();
    circle.graphics.beginFill("#A66").drawCircle(0, 0, 40);  //creates circle at 0,0, with radius of 40
    circle.x = circle.y = 100;  //this just sets the x and y equal to 50
    GameStates.Loading.container.addChild(circle);  //add the circle to the stage but it is not apparent until the stage is updated
        
    GameStates.Loading.update = function() {
        moveAndLoop(circle,2,40);
    };
    stage.addChild(GameStates.Loading.container);
    CurrentGameState = GameStates.Loading;
}
//endregion

//region GAMEOBJECT
//region hasy

/*
 * Hash table developed by Anthony Corbin
//*/
var HashTable = (function() {
	function HashTable() {
		this.pairs = [];
		this.orderedPairs = [];
	}
	HashTable.prototype.hashObject = function (value) {
		return (typeof value) + ' ' + (value instanceof Object ? (value.__hash || (value.__hash = ++arguments.callee.current)) : value.toString());
	};
	HashTable.prototype.hashObject.current = 0;
	function KeyValuePair(hash, key, val) {
		this.hash = hash;
		this.key = key;
		this.val = val;
	}
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
			for (i = 0; i < this.orderedPairs.length; i++) {
				if (this.orderedPairs[i] === this.pairs[hash]) {
					this.orderedPairs.splice(i, 1);
					this.pairs[hash] = null;
					return;
				}
			}
			throw new Error("contain returned true, but key not found");
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
		this.orderedPairs.map(function (item) {
			theirFunction(item.key, item.val);
		});
	};
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
	HashSet.prototype.union = function (that) {
		var ret = new HashSet();
		this.myTable.foreachInSet(function (key, val) { ret.add(key); });
		that.myTable.foreachInSet(function (key, val) { ret.add(key); });
		return ret;
	};
	HashSet.prototype.join = function (that) {
		var ret = new HashSet();
		this.myTable.foreachInSet(function (key, val) {
			if (that.contains(key)) { ret.add(key); }
		});
		return ret;
	};
	HashSet.prototype.foreachInSet = function (theirFunction) {
		return this.myTable.foreachInSet(function(key,val) { theirFunction(key); });
	};
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
    this.update = function () {};
    this.population = 0;
    this.direction = new Coord();
    this.strength = 0;
    this.type = type;
    this.getLevel = function() {
        return Math.max(0,Math.floor((Math.log(this.population) / Math.log(3)) + 1));
    };
    this.setToLevel = function(level) {
        this.population = Math.pow(3,(level-1));
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
    this.ComboBoost = 0;
    this.avalableItemPool = [];
    //region init
    var i;
    { // init pool
        var basicHouse = new Item(ItemType.Housing);
        basicHouse.population = 1;
        for(i = 0 ;i<5;i++) {
            this.avalableItemPool.push(basicHouse.duplicate());
        }
        this.avalableItemPool.push(new Item(ItemType.BlackHole));
    }
    this.nextItemList = [];
    
    //init grid
    for(i=0;i<size.x;i++) {
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
    ret.alreadyOccupied = thisCell.item !== null;
    function pushToRet(cellToAdd) {
        ret.cells.push(cellToAdd);
        ret.positions.push(cellToAdd.pos);
    }

    var itemToCheck = itemToPlace.duplicate();
    var sameType;
    while( (sameType = this.MoveHelper(new HashSet(),this.getCell(pos),itemToCheck)).length >=3 ) {
        itemToCheck.setToLevel(itemToCheck.getLevel()+1);
        ret.levelBoost++;
        sameType.map(pushToRet);
    }
    var temp = new HashSet();
    temp.addAll(ret.positions);
    ret.positions = temp.toList();
    temp = new HashSet();
    temp.addAll(ret.cells);
    ret.cells = temp.toList();
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
    } else {
        if(itemToPlace.type === ItemType.BlackHole) {
            thisCell.item = null;
        }
    }

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
//endregion

//region HUDOBJECT
var terrainSprite;
var allGraphic = [];

function Square(pos,dim){
    
    this.graphic = terrainSprite.clone();
    this.graphic.x = pos.x;
    this.graphic.y = pos.y;
    this.graphic.scaleX = dim.x/64;
    this.graphic.scaleY = dim.y/64;
    this.isPlaceable = true;
    this.item = null;
    this.level=0;
    
    this.upgrade = function() {
        this.level++;
        if(this.level>5){this.level=5;}
        this.item = allGraphic[this.level].clone();
    };
    this.fill = function(pos,dim){
        this.item.x = pos.x;
        this.item.y = pos.y;
        this.item.scaleX = dim.x/128;
        this.item.scaleY = dim.y/128;
    };
}

function Grid(container, cells, pos, dim){
    this.dim = new Coord(dim.x,dim.y);
    this.pos = new Coord(pos.x,pos.y);
    this.cells = new Coord(cells.y,cells.y);
    this.squares = [];
    for(var i=0; i<cells.x; i++){
        this.squares[i] = [];
        for(var j=0; j<cells.y; j++){
            var spos = new Coord(i*(dim.x/cells.x)+pos.x,j*(dim.y/cells.y)+pos.y);
            var sdim = new Coord(dim.x/cells.x,dim.y/cells.y);
            this.squares[i][j] = new Square(spos,sdim);
            container.addChild(this.squares[i][j].graphic);
        }
    }
    
    this.highlight = function(x,y) {
        
    };
    
    this.place = function(container,i,lev){
        if(this.squares[i.x][i.y].isPlaceable===false){return false;}
        this.squares[i.x][i.y].isPlaceable=false;
        this.squares[i.x][i.y].level = lev;
        this.squares[i.x][i.y].item = allGraphic[lev].clone();
            var spos = new Coord(i.x*(dim.x/cells.x)+pos.x,i.y*(dim.y/cells.y)+pos.y);
            var sdim = new Coord(dim.x/cells.x,dim.y/cells.y);
            this.squares[i.x][i.y].fill(spos,sdim);
        container.addChild(this.squares[i.x][i.y].item);
        return true;
    };
    
    this.upgrade = function(container,i){
        container.removeChild(this.squares[i.x][i.y].item);
        this.squares[i.x][i.y].upgrade();
            var spos = new Coord(i.x*(dim.x/cells.x)+pos.x,i.y*(dim.y/cells.y)+pos.y);
            var sdim = new Coord(dim.x/cells.x,dim.y/cells.y);
            this.squares[i.x][i.y].fill(spos,sdim);
        container.addChild(this.squares[i.x][i.y].item);
    };
    
    this.clear = function(container,i){
        container.removeChild(this.squares[i.x][i.y].item);
        this.squares[i.x][i.y].item=null;
        this.squares[i.x][i.y].level=0;
        this.squares[i.x][i.y].isPlaceable=true;
    };
}

function updateQueue(container){
    var mod=1;
    for(var i=3; i>=0; i--){
        container.removeChild(elementQueue[i]);
        if(i===0){mod=2;}
        var lev = game.itemQ(i).getLevel();
        if(lev>5){lev=5;}
        elementQueue[i] = allGraphic[lev].clone();
        elementQueue[i].x = 650-25*mod;
        elementQueue[i].y = 550-(50)*(3-i)-50*mod;
        elementQueue[i].scaleX = 50*mod/128;
        elementQueue[i].scaleY = 50*mod/128;
        container.addChild(elementQueue[i]);
    }
}
//endregion

//region GAME
var game;
var grid;
var elementQueue = [];
var turns;
var pop;
var goal;

function initGameScene(container) {
    
    terrainSprite = loadImage("path");
    allGraphic[1] = loadImage("pop1");
    allGraphic[2] = loadImage("pop2");
    allGraphic[3] = loadImage("pop3");
    allGraphic[4] = loadImage("pop4");
    allGraphic[5] = loadImage("pop5");
    allGraphic[0] = loadImage("bolt");
    
    GameStates.Game.enable = function() {
        backgroundMusic.setSoundFromString("GamePlay",true);
        
        game = new Game(new Coord(6,6));
        
        turns = new createjs.Text("Turns: "+game.getTurnCount(), "16px Arial", "#FFF");
        turns.x = 600;
        turns.y = 30; 
        container.addChild(turns);
        
        pop = new createjs.Text("Pop " +game.getPopulation(), "12px Arial", "#FFF");
        pop.x = 600;
        pop.y = 50; 
        container.addChild(pop);
        
        goal = new createjs.Text(" / 80", "12px Arial", "#FFF");
        goal.x = 650;
        goal.y = 50; 
        container.addChild(goal);
        
        updateQueue(container);
        
        grid = new Grid(container, new Coord(6,6),new Coord(20,50),new Coord(500,500));
    };
    GameStates.Game.mouseDownEvent = function(e){
        e=e;
        //if(mouse.pos.sub(grid.pos).withinBox(grid.dim)){
        //    var index = mouse.pos.sub(grid.pos).div(grid.dim.x/grid.cells.x);
        //    var flooredIndex = index.floor();
        //    var queryInfo = game.QueryMove(flooredIndex);
        //}
    };
    GameStates.Game.mouseUpEvent = function(e){
        e=e;
        if(mouse.pos.sub(grid.pos).withinBox(grid.dim)){
            var index = mouse.pos.sub(grid.pos).div(grid.dim.x/grid.cells.x);
            var flooredIndex = index.floor();
            if(game.itemQ(0).type!=ItemType.BlackHole){
                var upcomingLevel = game.itemQ(0).getLevel();
                if(upcomingLevel>5){upcomingLevel=5;}
                var queryInfo = game.QueryMove(flooredIndex,game.itemQ(0));
                if(!queryInfo.alreadyOccupied){
                    var placeInfo = game.ApplyMove(flooredIndex);
                    grid.place(container,flooredIndex,upcomingLevel);
                    if(placeInfo.valid){
                        for(var i=0; i<placeInfo.positions.length; i++)
                        {
                            if(!placeInfo.positions[i].isEqual(flooredIndex)){
                                grid.clear(container,placeInfo.positions[i]);  
                            }
                            else {
                                for(var j=0; j<placeInfo.levelBoost; j++){
                                    grid.upgrade(container,flooredIndex);
                                }
                            }
                        }
                    }
                    updateQueue(container);
                    pop.text = "Pop " +game.getPopulation();
                }
            }
            else{
                game.ApplyMove(flooredIndex);
                grid.clear(container,flooredIndex); 
                updateQueue(container);
            }
        }
    };
    GameStates.Game.update = function() {
        turns.text="Turns: "+game.getTurnCount();
        if(game.getTurnCount()===0){
            CurrentGameState=GameStates.GameOver;
        }
    };
    GameStates.Game.disable = function() {
        score = pop.text;
        container.removeChild(turns);
        container.removeChild(pop); 
        container.removeChild(goal); 
    };
}
//endregion