﻿(function(window) {
ShrinkingPPop3 = function() {
	this.initialize();
}
ShrinkingPPop3._SpriteSheet = new createjs.SpriteSheet({images: ["purplePop3Shrink.png"], frames: [[0,0,99,128,0,49.15,65.5],[99,0,103,134,0,51.15,68.5],[202,0,108,140,0,54.15,71.5],[310,0,113,145,0,56.15,73.5],[0,145,117,151,0,58.15,76.5],[117,145,115,149,0,57.15,75.5],[232,145,113,147,0,56.15,74.5],[345,145,113,146,0,56.15,74.5],[0,296,111,144,0,55.15,73.5],[111,296,111,142,0,55.15,72.5],[222,296,105,136,0,52.15,69.5],[327,296,100,130,0,50.15,66.5],[0,440,95,123,0,47.15,63.5],[95,440,90,116,0,45.15,59.5],[185,440,85,110,0,42.15,56.5],[270,440,80,103,0,40.15,53.5],[350,440,75,97,0,37.15,50.5],[425,440,70,91,0,35.15,47.5],[0,563,64,83,0,32.15,43.5],[64,563,59,77,0,29.15,40.5],[123,563,55,71,0,27.15,37.5],[178,563,51,65,0,25.15,34.5],[229,563,46,60,0,23.15,32.5],[275,563,41,54,0,20.15,29.5],[316,563,37,48,0,18.15,26.5],[353,563,35,44,0,17.15,24.5],[388,563,32,42,0,16.15,23.5],[420,563,29,38,0,14.149999999999999,21.5],[449,563,27,35,0,13.149999999999999,20.5],[476,563,25,32,0,12.149999999999999,18.5]]});
var ShrinkingPPop3_p = ShrinkingPPop3.prototype = new createjs.Sprite();
ShrinkingPPop3_p.Sprite_initialize = ShrinkingPPop3_p.initialize;
ShrinkingPPop3_p.initialize = function() {
	this.Sprite_initialize(ShrinkingPPop3._SpriteSheet);
	this.paused = false;
}
window.ShrinkingPPop3 = ShrinkingPPop3;
}(window));

