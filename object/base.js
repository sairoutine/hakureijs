'use strict';

var util = require('../util');

var id = 0;

var ObjectBase = function(scene) {
	this.scene = scene;
	this.core = scene.core;
	this.id = ++id;

	this.frame_count = 0;

	this.x = 0;
	this.y = 0;

	this.velocity = {magnitude:0, theta:0};
};

ObjectBase.prototype.init = function(){
	this.frame_count = 0;

	this.x = 0;
	this.y = 0;
};

ObjectBase.prototype.beforeDraw = function(){
	this.frame_count++;

	this.move();
};

ObjectBase.prototype.draw = function(){
};

ObjectBase.prototype.afterDraw = function(){
};

ObjectBase.prototype.move = function() {
	var x = util.calcMoveXByVelocity(this.velocity);
	var y = util.calcMoveYByVelocity(this.velocity);

	this.x += x;
	this.y += y;
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
ObjectBase.prototype.setVelocity = function(velocity) {
	this.velocity = velocity;
};
module.exports = ObjectBase;

