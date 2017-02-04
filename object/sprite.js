'use strict';
var base_object = require('./base');
var util = require('../util');

var Sprite = function(scene) {
	base_object.apply(this, arguments);

	this.current_sprite_index = 0;
};
util.inherit(Sprite, base_object);

Sprite.prototype.init = function(){
	base_object.prototype.init.apply(this, arguments);

	this.current_sprite_index = 0;
};

Sprite.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);

	// animation sprite
	if(this.frame_count % this.spriteAnimationSpan() === 0) {
		this.current_sprite_index++;
		if(this.current_sprite_index >= this.spriteIndices().length) {
			this.current_sprite_index = 0;
		}
	}
};
Sprite.prototype.draw = function(){
	base_object.prototype.draw.apply(this, arguments);

	var image = this.core.image_loader.getImage(this.spriteName());

	var ctx = this.core.ctx;

	ctx.save();

	// set position
	ctx.translate(this.x, this.y);

	// rotate
	var rotate = util.thetaToRadian(this.velocity.theta);
	ctx.rotate(rotate);

	var width  = this.spriteWidth()  * this.scale();
	var height = this.spriteHeight() * this.scale();

	ctx.drawImage(image,
		// sprite position
		this.spriteWidth()  * this.spriteIndexX(), this.spriteHeight() * this.spriteIndexY(),
		// sprite size to get
		this.spriteWidth(),                   this.spriteHeight(),
		// adjust left x, up y because of x and y indicate sprite center.
		-width/2,                             -height/2,
		// sprite size to show
		width,                                height
	);
	ctx.restore();
};

Sprite.prototype.spriteName = function(){
	return;
};
Sprite.prototype.spriteIndexX = function(){
	return this.spriteIndices()[this.current_sprite_index].x;
};
Sprite.prototype.spriteIndexY = function(){
	return this.spriteIndices()[this.current_sprite_index].y;
};
Sprite.prototype.spriteAnimationSpan = function(){
	return 0;
};
Sprite.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
Sprite.prototype.spriteWidth = function(){
	return 0;
};
Sprite.prototype.spriteHeight = function(){
	return 0;
};
Sprite.prototype.scale = function(){
	return 1;
};


module.exports = Sprite;
