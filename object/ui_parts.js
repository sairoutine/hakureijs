'use strict';
var base_object = require('./base');
var Util = require('../util');

var ObjectUIParts = function(scene, x, y, width, height, draw_function) {
	base_object.apply(this, arguments);

	this.x(x);
	this.y(y);

	this._width  = width;
	this._height = height;

	this._draw_function = null;
	if (typeof draw_function !== "undefined") {
		this._draw_function = Util.bind(draw_function, this);
	}

	this._is_show_rect = false;

};
Util.inherit(ObjectUIParts, base_object);

ObjectUIParts.prototype.collisionWidth = function(){
	return this._width;
};

ObjectUIParts.prototype.collisionHeight = function(){
	return this._height;
};

ObjectUIParts.prototype.setShowRect = function() {
	this._is_show_rect = true;
	return this;
};

ObjectUIParts.prototype.setVariable = function (name, value){
	this[name] = value;
	return this;
};

ObjectUIParts.prototype.draw = function(){
	base_object.prototype.draw.apply(this, arguments);
	var ctx = this.core.ctx;
	ctx.save();
	if (this._draw_function) {
		this._draw_function();
	}
	ctx.restore();

	if(this._is_show_rect) {
		ctx.save();
		ctx.fillStyle = 'rgb( 255, 255, 255 )' ;
		ctx.globalAlpha = 0.4;
		ctx.fillRect(this.getCollisionLeftX(), this.getCollisionUpY(), this.collisionWidth(), this.collisionHeight());
		ctx.restore();
	}
};

module.exports = ObjectUIParts;
