﻿(function(window) {
GrowingBPop5 = function() {
	this.initialize();
}
GrowingBPop5._SpriteSheet = new createjs.SpriteSheet({images: ["bluePop5Grow.png"], frames: [[0,0,128,38,0,63.95,-20.549999999999997],[128,0,128,43,0,63.95,-15.549999999999997],[256,0,128,48,0,63.95,-10.549999999999997],[384,0,128,52,0,63.95,-6.549999999999997],[0,52,128,57,0,63.95,-1.5499999999999972],[128,52,128,61,0,63.95,2.450000000000003],[256,52,128,66,0,63.95,7.450000000000003],[384,52,128,70,0,63.95,11.450000000000003],[0,122,128,76,0,63.95,16.450000000000003],[128,122,128,80,0,62.95,20.450000000000003],[256,122,128,85,0,62.95,25.450000000000003],[384,122,128,90,0,62.95,30.450000000000003],[0,212,128,95,0,62.95,35.45],[128,212,128,100,0,62.95,40.45],[256,212,128,105,0,62.95,45.45],[384,212,128,111,0,62.95,50.45],[0,323,128,117,0,62.95,56.45],[128,323,128,122,0,62.95,61.45],[256,323,128,128,0,62.95,67.45],[384,323,128,133,0,62.95,72.45],[0,456,128,139,0,62.95,78.45],[128,456,128,137,0,62.95,75.45],[256,456,128,135,0,62.95,73.45],[384,456,128,132,0,62.95,70.45],[0,595,128,131,0,62.95,68.45],[256,323,128,128,0,63.95,65.45],[256,323,128,128,0,63.95,65.45],[256,323,128,128,0,63.95,65.45],[256,323,128,128,0,63.95,65.45],[256,323,128,128,0,63.95,65.45]]});
var GrowingBPop5_p = GrowingBPop5.prototype = new createjs.Sprite();
GrowingBPop5_p.Sprite_initialize = GrowingBPop5_p.initialize;
GrowingBPop5_p.initialize = function() {
	this.Sprite_initialize(GrowingBPop5._SpriteSheet);
	this.paused = false;
}
window.GrowingBPop5 = GrowingBPop5;
}(window));

