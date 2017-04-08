'use strict';

var util = require('../util');

var id = 0;

var ObjectBase = function(scene, object) {
	this.scene = scene;
	this.core = scene.core;
	this.parent = object; // parent object if this is sub object
	this.id = ++id;

	this.frame_count = 0;

	this.x = 0; // local center x
	this.y = 0; // local center y

	// manage flags that disappears in frame elapsed
	this.auto_disable_times_map = {};

	this.velocity = {magnitude:0, theta:0};

	// sub object
	this.objects = [];

};

ObjectBase.prototype.init = function(){
	this.frame_count = 0;

	this.x = 0;
	this.y = 0;

	this.auto_disable_times_map = {};

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].init();
	}
};

ObjectBase.prototype.beforeDraw = function(){
	this.frame_count++;

	this.checkAutoDisableFlags();

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].beforeDraw();
	}

	this.move();
};

ObjectBase.prototype.draw = function() {
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].draw();
	}
};

ObjectBase.prototype.afterDraw = function() {
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].afterDraw();
	}
};

// add sub object
ObjectBase.prototype.addSubObject = function(object){
	this.objects.push(object);
};
ObjectBase.prototype.removeSubObject = function(object){
	// TODO: O(n) -> O(1)
	for(var i = 0, len = this.objects.length; i < len; i++) {
		if(this.objects[i].id === object.id) {
			this.objects.splice(i, 1);
			break;
		}
	}
};



ObjectBase.prototype.move = function() {
	var x = util.calcMoveXByVelocity(this.velocity);
	var y = util.calcMoveYByVelocity(this.velocity);

	this.x += x;
	this.y += y;
};
ObjectBase.prototype.onCollision = function(){
};

ObjectBase.prototype.width = function() {
	return 0;
};
ObjectBase.prototype.height = function() {
	return 0;
};
ObjectBase.prototype.globalCenterX = function() {
	return this.scene.x + this.x;
};
ObjectBase.prototype.globalCenterY = function() {
	return this.scene.y + this.y;
};
ObjectBase.prototype.globalLeftX = function() {
	return this.scene.x + this.x - this.width()/2;
};
ObjectBase.prototype.globalRightX = function() {
	return this.scene.x + this.x + this.width()/2;
};
ObjectBase.prototype.globalUpY = function() {
	return this.scene.x + this.y - this.height()/2;
};
ObjectBase.prototype.globalDownY = function() {
	return this.scene.x + this.y + this.height()/2;
};

ObjectBase.prototype.collisionWidth = function() {
	return 0;
};
ObjectBase.prototype.collisionHeight = function() {
	return 0;
};

ObjectBase.prototype.checkCollisionWithObject = function(obj1) {
	var obj2 = this;
	if(obj1.checkCollision(obj2)) {
		obj1.onCollision(obj2);
		obj2.onCollision(obj1);
	}
};
ObjectBase.prototype.checkCollisionWithObjects = function(objs) {
	var obj1 = this;
	for(var i = 0; i < objs.length; i++) {
		var obj2 = objs[i];
		if(obj1.checkCollision(obj2)) {
			obj1.onCollision(obj2);
			obj2.onCollision(obj1);
		}
	}
};



ObjectBase.prototype.checkCollision = function(obj) {
	if(Math.abs(this.x - obj.x) < this.collisionWidth()/2 + obj.collisionWidth()/2 &&
		Math.abs(this.y - obj.y) < this.collisionHeight()/2 + obj.collisionHeight()/2) {
		return true;
	}

	return false;
};

ObjectBase.prototype.getCollisionLeftX = function() {
	return this.x - this.collisionWidth() / 2;
};

ObjectBase.prototype.getCollisionUpY = function() {
	return this.y - this.collisionHeight() / 2;
};








// set flags that disappears in frame elapsed
// TODO: enable to set flag which becomes false -> true
ObjectBase.prototype.setAutoDisableFlag = function(flag_name, count) {
	var self = this;

	self[flag_name] = true;

	self.auto_disable_times_map[flag_name] = self.frame_count + count;

};

// check flags that disappears in frame elapsed
ObjectBase.prototype.checkAutoDisableFlags = function() {
	var self = this;
	for (var flag_name in self.auto_disable_times_map) {
		if(this.auto_disable_times_map[flag_name] < self.frame_count) {
			self[flag_name] = false;
			delete self.auto_disable_times_map[flag_name];
		}
	}
};




ObjectBase.prototype.setVelocity = function(velocity) {
	this.velocity = velocity;
};
module.exports = ObjectBase;

