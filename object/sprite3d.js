'use strict';
var base_object = require('./base');
var util = require('../util');
var glmat = require('gl-matrix');

var V_ITEM_SIZE = 3;
var V_ITEM_NUM = 4;
var V_SIZE = V_ITEM_SIZE * V_ITEM_NUM;
var C_ITEM_SIZE = 2;
var C_ITEM_NUM = 4;
var C_SIZE = C_ITEM_SIZE * C_ITEM_NUM;
var I_ITEM_SIZE = 1;
var I_ITEM_NUM = 6;
var I_SIZE = I_ITEM_SIZE * I_ITEM_NUM;
var A_ITEM_SIZE = 4;
var A_ITEM_NUM = 4;
var A_SIZE = A_ITEM_SIZE * A_ITEM_NUM;

var Sprite3d = function(scene) {
	base_object.apply(this, arguments);

	this.current_sprite_index = 0;

	this._z = 0;

	this.vertices = [];
	this.coordinates = [];
	this.indices = [];
	this.colors = [];

	this.vertices.length    = V_SIZE;
	this.coordinates.length = C_SIZE;
	this.indices.length     = I_SIZE;
	this.colors.length      = A_SIZE;



};
util.inherit(Sprite3d, base_object);

Sprite3d.prototype.init = function(){
	base_object.prototype.init.apply(this, arguments);

	this.current_sprite_index = 0;
};

Sprite3d.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);

	// animation sprite
	if(this.frame_count % this.spriteAnimationSpan() === 0) {
		this.current_sprite_index++;
		if(this.current_sprite_index >= this.spriteIndices().length) {
			this.current_sprite_index = 0;
		}
	}
};
Sprite3d.prototype.draw = function(){
	if(this.isShow()) {

		/*
		var image = this.core.image_loader.getImage(this.spriteName());

		if(this.scale()) console.error("scale method is deprecated. you should use scaleWidth and scaleHeight.");

		var ctx = this.core.ctx;

		ctx.save();

		// set position
		ctx.translate(this.globalCenterX(), this.globalCenterY());

		// rotate
		var rotate = util.thetaToRadian(this.velocity.theta + this.rotateAdjust());
		ctx.rotate(rotate);

		var sprite_width  = this.spriteWidth();
		var sprite_height = this.spriteHeight();
		if(!sprite_width)  sprite_width = image.width;
		if(!sprite_height) sprite_height = image.height;

		var width  = this.width();
		var height = this.height();

		// reflect left or right
		if(this.isReflect()) {
			ctx.transform(-1, 0, 0, 1, 0, 0);
		}

		ctx.drawImage(image,
			// sprite position
			sprite_width * this.spriteIndexX(), sprite_height * this.spriteIndexY(),
			// sprite size to get
			sprite_width,                       sprite_height,
			// adjust left x, up y because of x and y indicate sprite center.
			-width/2,                           -height/2,
			// sprite size to show
			width,                              height
		);
		ctx.restore();
		*/
	}

	// draw sub objects(even if this object is not show)
	base_object.prototype.draw.apply(this, arguments);
};

Sprite3d.prototype.z = function(val) {
	if (typeof val !== 'undefined') { this._z = val; }
	return this._z;
};




Sprite3d.prototype.spriteName = function(){
	throw new Error("spriteName method must be overridden.");
};
Sprite3d.prototype.spriteIndexX = function(){
	return this.spriteIndices()[this.current_sprite_index].x;
};
Sprite3d.prototype.spriteIndexY = function(){
	return this.spriteIndices()[this.current_sprite_index].y;
};
Sprite3d.prototype.width = function(){
	return this.spriteWidth() * this.scaleWidth();
};
Sprite3d.prototype.height = function(){
	return this.spriteHeight() * this.scaleHeight();
};




Sprite3d.prototype.isShow = function(){
	return true;
};


Sprite3d.prototype.spriteAnimationSpan = function(){
	return 0;
};
Sprite3d.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
Sprite3d.prototype.spriteWidth = function(){
	return 0;
};
Sprite3d.prototype.spriteHeight = function(){
	return 0;
};
Sprite3d.prototype.rotateAdjust = function(){
	return 0;
};

Sprite3d.prototype.scaleWidth = function(){
	return 1;
};
Sprite3d.prototype.scaleHeight = function(){
	return 1;
};
Sprite3d.prototype.isReflect = function(){
	return false;
};

module.exports = Sprite3d;
