﻿(function(window) {
ShrinkingBPop4 = function() {
	this.initialize();
}
ShrinkingBPop4._SpriteSheet = new createjs.SpriteSheet({images: ["bluePop4Shrink.png"], frames: [[0,0,128,128,0,63.95,65],[128,0,128,137,0,62.95,74],[256,0,128,146,0,62.95,83],[384,0,128,155,0,62.95,92],[0,155,128,164,0,62.95,102],[128,155,128,159,0,62.95,97],[256,155,128,154,0,62.95,92],[384,155,128,149,0,62.95,87],[0,319,128,144,0,62.95,83],[128,319,128,139,0,62.95,78],[256,319,128,133,0,62.95,72],[0,0,128,128,0,62.95,67],[384,319,128,122,0,62.95,61],[0,463,128,117,0,62.95,56],[128,463,128,111,0,62.95,50],[256,463,128,105,0,62.95,45],[384,463,128,100,0,62.95,40],[0,580,128,95,0,62.95,35],[128,580,128,90,0,62.95,30],[256,580,128,85,0,62.95,25],[384,580,128,80,0,62.95,20],[0,675,128,76,0,63.95,16],[128,675,128,71,0,63.95,11],[256,675,128,66,0,63.95,7],[384,675,128,61,0,63.95,2],[0,751,128,57,0,63.95,-2],[128,751,128,52,0,63.95,-7],[256,751,128,48,0,63.95,-11],[384,751,128,43,0,63.95,-16],[0,808,128,38,0,63.95,-21]]});
var ShrinkingBPop4_p = ShrinkingBPop4.prototype = new createjs.Sprite();
ShrinkingBPop4_p.Sprite_initialize = ShrinkingBPop4_p.initialize;
ShrinkingBPop4_p.initialize = function() {
	this.Sprite_initialize(ShrinkingBPop4._SpriteSheet);
	this.paused = false;
}
window.ShrinkingBPop4 = ShrinkingBPop4;
}(window));

