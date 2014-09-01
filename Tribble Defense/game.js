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
    {src:"images/title.png", id:"title"},
    {src:"images/Terrain/BackgroundBase.png", id:"background"},
    {src:"images/Terrain/pathOpen.png", id:"path"},
    {src:"audio/GameOver.mp3", id:"Failure"},
    {src:"images/Population/pop1.png", id:"pop1"},
    {src:"images/instructions.png", id:"instructions"},
    {src:"images/credits.png", id:"credits"},
    {src:"audio/GamePlay.mp3", id:"GamePlay"},
    {src:"images/gameover.png", id:"gameover"},
    {src:"images/buttons.png", id:"button"},
    {src:"images/SpeakerOn.png", id:"SpeakerOn"},
    {src:"audio/StartScreen.mp3", id:"StartScreen"},
    {src:"images/SpeakerOff.png", id:"SpeakerOff"},
    {src:"images/Barrier.png", id:"Barrier"},
    {src:"images/sprites.png", id:"mySprites"},
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
	
    spriteSheets.mainCharacter = new createjs.SpriteSheet({
        images: [queue.getResult("mySprites")],
        frames: [[0,0,114,96,0,57.849999999999994,96.55],[114,0,125,95,0,63.849999999999994,95.55],[0,96,130,95,0,66.85,95.55],[130,96,125,94,0,63.849999999999994,94.55],[0,191,114,96,0,57.849999999999994,96.55],[114,191,96,102,0,46.849999999999994,102.55],[0,293,78,105,0,36.849999999999994,105.55],[78,293,95,102,0,46.849999999999994,102.55]],
        animations: {
            fly:   [0, 7, "fly",0.5]
        }     
    });
    
    spriteSheets.barrier = new createjs.SpriteSheet({
        images: [queue.getResult("Barrier")],
        frames: [[0,0,185,184,0,-4.4,6.7],[185,0,185,184,0,-4.4,6.7],[0,184,185,184,0,-4.4,6.7],[185,184,185,184,0,-4.4,6.7]],
        animations: {
            pulse:   [0, 3, "pulse",0.5]
        }     
    });
    
    
    spriteSheets.mainCharacter.paused = false;
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
            backgroundMusic.setSoundFromString("StartScreen",true);
            createjs.Sound.play("Failure");
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
//endregion

//region HUDOBJECT
var terrainSprite;
var allGraphic = [];

function Square(pos,dim){
    
    this.graphic = loadImage("path");
    this.graphic.x = pos.x;
    this.graphic.y = pos.y;
    this.graphic.scaleX = dim.x/64;
    this.graphic.scaleY = dim.y/64;
    this.isPlaceable = true;
    
    this.upgrade = function() {
        this.level++;
        this.graphic = allGraphic[this.type][this.level].clone();
  };
}

function Grid(cells, pos, dim){
    this.dim = new Coord(dim.x,dim.y);
    this.position = new Coord(pos.x,pos.y);
    this.cells = new Coord(cells.y,cells.y);
    this.squares = [];
    for(var i=0; i<cells.x; i++){
        this.squares[i] = [];
        for(var j=0; j<cells.y; j++){
            var spos = new Coord(i*(dim.x/cells.x)+pos.x,j*(dim.y/cells.y)+pos.y);
            var sdim = new Coord(dim.x/cells.x,dim.y/cells.y);
            this.squares[i][j] = new Square(spos,sdim);
            stage.addChild(this.squares[i][j].graphic);
        }
    }
    
    this.highlight = function(x,y) {
        
    };
    
    this.select = function(x,y){
        
    };
    
}
//endregion

//region GAME
function initGameScene(container) {
    GameStates.Game.update = function() {
        
    };
    GameStates.Game.enable = function() {
        backgroundMusic.setSoundFromString("GamePlay",true);
        //terrainSprite = loadImage("path");
        var cells = new Coord(6,6);
        var pos = new Coord(20,50);
        var dim = new Coord(500,500);
        var grid = new Grid(cells,pos,dim);
    };
}
//endregion