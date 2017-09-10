'use strict';

var util = require('../util');

var id = 0;

var ObjectBase = function(scene, object) {
	this.scene = scene;
	this.core = scene.core;
	this.parent = object; // parent object if this is sub object
	this.id = ++id;

	this.frame_count = 0;

	this._x = 0; // local center x
	this._y = 0; // local center y

	// manage flags that disappears in frame elapsed
	this._auto_disable_times_map = {};

	this._velocity = null;
	this.resetVelocity();

	// sub object
	this.objects = [];

};

ObjectBase.prototype.init = function(){
	this.frame_count = 0;

	// NOTE: abolished
	//this._x = 0;
	//this._y = 0;

	this._auto_disable_times_map = {};

	this.resetVelocity();

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
	var ctx = this.core.ctx;

	// If is in DEBUG mode, show collision area
	if(this.core.debug_manager.isShowingCollisionArea()) {
		ctx.save();
		ctx.fillStyle = 'rgb( 255, 255, 255 )' ;
		ctx.globalAlpha = 0.4;
		ctx.fillRect(this.getCollisionLeftX(), this.getCollisionUpY(), this.collisionWidth(), this.collisionHeight());
		ctx.restore();
	}


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

ObjectBase.prototype.removeAllSubObject = function() {
	this.objects = [];
};

ObjectBase.prototype.move = function() {
	var x = util.calcMoveXByVelocity(this._velocity);
	var y = util.calcMoveYByVelocity(this._velocity);

	this._x += x;
	this._y += y;
};
ObjectBase.prototype.onCollision = function(obj){
};

ObjectBase.prototype.width = function() {
	return 0;
};
ObjectBase.prototype.height = function() {
	return 0;
};
ObjectBase.prototype.globalCenterX = function() {
	return this.scene.x() + this.x();
};
ObjectBase.prototype.globalCenterY = function() {
	return this.scene.y() + this.y();
};
ObjectBase.prototype.globalLeftX = function() {
	return this.scene.x() + this.x() - this.width()/2;
};
ObjectBase.prototype.globalRightX = function() {
	return this.scene.x() + this.x() + this.width()/2;
};
ObjectBase.prototype.globalUpY = function() {
	return this.scene.x() + this.y() - this.height()/2;
};
ObjectBase.prototype.globalDownY = function() {
	return this.scene.x() + this.y() + this.height()/2;
};

ObjectBase.prototype.collisionWidth = function(obj) {
	return 0;
};
ObjectBase.prototype.collisionHeight = function(obj) {
	return 0;
};
ObjectBase.prototype.isCollision = function(obj) {
	return true;
};


ObjectBase.prototype.checkCollisionWithPosition = function(x, y) {
	if(this.checkCollisionByPosition(x, y)) {
		this.onCollision();
		return true;
	}

	return false;
};

ObjectBase.prototype.checkCollisionWithObject = function(obj1) {
	var obj2 = this;
	if(obj1.checkCollisionByObject(obj2)) {
		obj1.onCollision(obj2);
		obj2.onCollision(obj1);
		return true;
	}
	return false;
};
ObjectBase.prototype.checkCollisionWithObjects = function(objs) {
	var obj1 = this;
	var return_flag = false;
	for(var i = 0; i < objs.length; i++) {
		var obj2 = objs[i];
		if(obj1.checkCollisionByObject(obj2)) {
			obj1.onCollision(obj2);
			obj2.onCollision(obj1);
			return_flag = true;
		}
	}

	return return_flag;
};


// NOTE: deprecated
ObjectBase.prototype.checkCollision = function(obj) {
	return this.checkCollisionByObject(obj);
};

ObjectBase.prototype.checkCollisionByObject = function(obj) {
	if (!this.isCollision(obj) || !obj.isCollision(this)) return false;

	if(Math.abs(this.x() - obj.x()) < this.collisionWidth(obj)/2 + obj.collisionWidth(this)/2 &&
		Math.abs(this.y() - obj.y()) < this.collisionHeight(obj)/2 + obj.collisionHeight(this)/2) {
		return true;
	}

	return false;
};

ObjectBase.prototype.checkCollisionByPosition = function(x, y) {
	if (!this.isCollision()) return false; // TODO: pass arguments of point object to isCollision method

	if (this.x() - this.collisionWidth()/2 < x && x < this.x() + this.collisionWidth()/2 &&
		this.y() - this.collisionHeight()/2 < y && y < this.y() + this.collisionHeight()/2) {
		return true;
	}

	return false;
};




ObjectBase.prototype.getCollisionLeftX = function(obj) {
	return this.x() - this.collisionWidth(obj) / 2;
};
ObjectBase.prototype.getCollisionRightX = function(obj) {
	return this.x() + this.collisionWidth(obj) / 2;
};
ObjectBase.prototype.getCollisionUpY = function(obj) {
	return this.y() - this.collisionHeight(obj) / 2;
};
ObjectBase.prototype.getCollisionDownY = function(obj) {
	return this.y() + this.collisionHeight(obj) / 2;
};









// set flags that disappears in frame elapsed
// TODO: enable to set flag which becomes false -> true
ObjectBase.prototype.setAutoDisableFlag = function(flag_name, count) {
	var self = this;

	self[flag_name] = true;

	self._auto_disable_times_map[flag_name] = self.frame_count + count;

};

// check flags that disappears in frame elapsed
ObjectBase.prototype.checkAutoDisableFlags = function() {
	var self = this;
	for (var flag_name in self._auto_disable_times_map) {
		if(this._auto_disable_times_map[flag_name] < self.frame_count) {
			self[flag_name] = false;
			delete self._auto_disable_times_map[flag_name];
		}
	}
};

ObjectBase.prototype.x = function(val) {
	if (typeof val !== 'undefined') { this._x = val; }
	return this._x;
};
ObjectBase.prototype.y = function(val) {
	if (typeof val !== 'undefined') { this._y = val; }
	return this._y;
};


ObjectBase.prototype.setVelocity = function(velocity) {
	this._velocity = velocity;
};
ObjectBase.prototype.resetVelocity = function() {
	this._velocity = {magnitude:0, theta:0};
};
ObjectBase.prototype.setVelocityMagnitude = function(magnitude) {
	this._velocity.magnitude = magnitude;
};
ObjectBase.prototype.setVelocityTheta = function(theta) {
	this._velocity.theta = theta;
};



var EXTRA_OUT_OF_SIZE = 100;
ObjectBase.prototype.isOutOfStage = function( ) {
	if(this.x() + EXTRA_OUT_OF_SIZE < 0 ||
	   this.y() + EXTRA_OUT_OF_SIZE < 0 ||
	   this.x() > this.core.width  + EXTRA_OUT_OF_SIZE ||
	   this.y() > this.core.height + EXTRA_OUT_OF_SIZE
	  ) {
		return true;
	}

	return false;
};





module.exports = ObjectBase;

