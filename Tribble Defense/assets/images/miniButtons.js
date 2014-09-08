(function(window) {
buttons = function() {
	this.initialize();
}
buttons._SpriteSheet = new createjs.SpriteSheet({images: ["miniButtons.png"], frames: [[0,0,127,38,0,66.5,13.05],[127,0,127,38,0,66.5,13.05],[0,38,127,38,0,65.5,13.05],[127,38,127,38,0,66.5,13.05],[0,76,127,38,0,66.5,13.05],[127,76,127,38,0,65.5,13.05],[0,114,127,38,0,66.5,13.05],[127,114,127,38,0,66.5,13.05],[0,152,127,38,0,65.5,13.05],[127,152,127,38,0,66.5,13.05],[0,190,127,38,0,66.5,13.05],[127,190,127,38,0,65.5,13.05]]});
var buttons_p = buttons.prototype = new createjs.Sprite();
buttons_p.Sprite_initialize = buttons_p.initialize;
buttons_p.initialize = function() {
	this.Sprite_initialize(buttons._SpriteSheet);
	this.paused = false;
}
window.buttons = buttons;
}(window));

