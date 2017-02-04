'use strict';

var ObjectBase = function(scene) {
	this.scene = scene;
	this.core = scene.core;

	this.frame_count = 0;

	this.x = 0;
	this.y = 0;
};

ObjectBase.prototype.init = function(){
	this.frame_count = 0;

	this.x = 0;
	this.y = 0;
};

ObjectBase.prototype.beforeDraw = function(){
	this.frame_count++;

};

ObjectBase.prototype.draw = function(){
};

ObjectBase.prototype.afterDraw = function(){
};

ObjectBase.prototype.leftX = function() {
	return this.x;
};
ObjectBase.prototype.rightX = function() {
	return this.x + this.width;
};
ObjectBase.prototype.upY = function() {
	return this.y;
};
ObjectBase.prototype.downY = function() {
	return this.y + this.height;
};

module.exports = ObjectBase;

