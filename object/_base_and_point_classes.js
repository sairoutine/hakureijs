'use strict';

// internal class
// you should require base.js or point.js

var Util = require('../util');

// used by isOutOfStage method
var EXTRA_OUT_OF_SIZE = 100;

var id = 0;

var ObjectBase = function(scene) {
	this.scene = scene;
	this.core = scene.core;
	// TODO: parent -> parent() because ajust to root method
	this.parent = null; // parent object if this is sub object
	this.id = ++id;

	this.frame_count = 0;

	this._is_inited = false;

	this._x = 0; // local center x
	this._y = 0; // local center y

	// manage flags that disappears in frame elapsed
	this._auto_disable_times_map = {};

	this._velocity = null;
	this.resetVelocity();

	this._previous_x = null;
	this._previous_y = null;

	// sub object
	this.objects = [];

};

Util.defineProperty(ObjectBase, "x");
Util.defineProperty(ObjectBase, "y");

ObjectBase.prototype.init = function(){
	this.frame_count = 0;

	this._is_inited = true;

	// NOTE: abolished
	//this._x = 0;
	//this._y = 0;

	this._auto_disable_times_map = {};

	this.resetVelocity();

	this._previous_x = null;
	this._previous_y = null;

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].init();
	}
};

ObjectBase.prototype.update = function(){
	this.frame_count++;

	// check flags that disappears in frame elapsed
	this._checkAutoDisableFlags();

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].update();
	}

	// move if this object is set velocity
	this.moveByVelocity(this._velocity);
};

ObjectBase.prototype.beforeDraw = function() {
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].beforeDraw();
	}
};

ObjectBase.prototype.draw = function() {
	// If is in DEBUG mode, show collision area
	if(this.core.debug_manager.isShowingCollisionArea()) {
		this._drawCollisionArea(this.core.debug_manager.collisionAreaColor());
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

ObjectBase.prototype.width = function() {
	return 0;
};
ObjectBase.prototype.height = function() {
	return 0;
};

ObjectBase.prototype.setPosition = function(x, y) {
	this.x(x);
	this.y(y);
};

ObjectBase.prototype.root = function() {
	if (this.parent) {
		return this.parent.root();
	}
	else {
		return this;
	}
};

ObjectBase.prototype.isInit = function(){
	return this._is_inited;
}



/*
*******************************
* position methods
*******************************
*/

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
	return this.scene.y() + this.y() - this.height()/2;
};

ObjectBase.prototype.globalDownY = function() {
	return this.scene.y() + this.y() + this.height()/2;
};

/*
*******************************
* sub object methods
*******************************
*/

// add sub object
ObjectBase.prototype.addSubObject = function(object){
	object.setParent(this);
	this.objects.push(object);
};

// add sub object list
ObjectBase.prototype.addSubObjects = function(object_list){
	// set parent
	for (var i = 0, len = object_list.length; i < len; i++) {
		var object = object_list[i];
		object.setParent(this);
	}

	this.objects = this.objects.concat(object_list);
};



ObjectBase.prototype.removeSubObject = function(object){
	// TODO: O(n) -> O(1)
	for(var i = 0, len = this.objects.length; i < len; i++) {
		if(this.objects[i].id === object.id) {
			this.objects[i].resetParent();
			this.objects.splice(i, 1);
			break;
		}
	}
};

ObjectBase.prototype.removeAllSubObject = function() {
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].resetParent();
	}

	this.objects = [];
};

// set parent object if this is sub object
ObjectBase.prototype.setParent = function(parent_object) {
	if(this.parent) throw new Error("already set parent");
	this.parent = parent_object;
};

ObjectBase.prototype.resetParent = function() {
	this.parent = null;
};

/*
*******************************
* collision methods
*******************************
*/

// collision width
// NOTE: the obj of arguments is collision target object
ObjectBase.prototype.collisionWidth = function(obj) {
	return 0;
};

// collision height
// NOTE: the obj of arguments is collision target object
ObjectBase.prototype.collisionHeight = function(obj) {
	return 0;
};

// callback if the object is collision with
// NOTE: the obj of arguments is collision target object
ObjectBase.prototype.onCollision = function(obj){
};

// flag if the object is check collision with
// NOTE: the obj of arguments is collision target object
ObjectBase.prototype.isCollision = function(obj) {
	return true;
};

// check Collision Detect with object and execute onCollision method if detect
ObjectBase.prototype.checkCollisionWithObject = function(obj1) {
	var obj2 = this;
	var is_collision = obj1.intersect(obj2);

	if(is_collision) {
		obj1.onCollision(obj2);
		obj2.onCollision(obj1);
	}

	return is_collision;
};

// check Collision Detect with object array and execute onCollision method if detect
ObjectBase.prototype.checkCollisionWithObjects = function(objs) {
	var obj1 = this;
	var return_flag = false;
	for(var i = 0; i < objs.length; i++) {
		var obj2 = objs[i];
		if(obj1.intersect(obj2)) {
			obj1.onCollision(obj2);
			obj2.onCollision(obj1);
			return_flag = true;
		}
	}

	return return_flag;
};

// check Collision Detect with (x, y) and execute onCollision method if detect
ObjectBase.prototype.checkCollisionWithPosition = function(x, y) {
	var point = new ObjectPoint(this.scene);
	point.init();
	point.setPosition(x, y);

	return this.checkCollisionWithObject(point);
};

// is the object collides with obj of argument ?
ObjectBase.prototype.intersect = function(obj) {
	if (!this.isCollision(obj) || !obj.isCollision(this)) return false;

	if(Math.abs(this.collisionX() - obj.collisionX()) < this.collisionWidth(obj)/2 + obj.collisionWidth(this)/2 &&
		Math.abs(this.collisionY() - obj.collisionY()) < this.collisionHeight(obj)/2 + obj.collisionHeight(this)/2) {
		return true;
	}

	return false;
};

ObjectBase.prototype.collisionX = function() {
	return this.x();
};
ObjectBase.prototype.collisionY = function() {
	return this.y();
};

ObjectBase.prototype.getCollisionLeftX = function(obj) {
	return this.collisionX() - this.collisionWidth(obj) / 2;
};

ObjectBase.prototype.getCollisionRightX = function(obj) {
	return this.collisionX() + this.collisionWidth(obj) / 2;
};

ObjectBase.prototype.getCollisionUpY = function(obj) {
	return this.collisionY() - this.collisionHeight(obj) / 2;
};

ObjectBase.prototype.getCollisionDownY = function(obj) {
	return this.collisionY() + this.collisionHeight(obj) / 2;
};

ObjectBase.prototype._drawCollisionArea = function(color) {
	// make dummy object to decide collision width and height
	var dummy_object = new ObjectBase(this.scene);

	// check whether does collide with
	if (!this.isCollision(dummy_object)) return;

	color = color || 'rgb( 255, 255, 255 )' ;
	var ctx = this.core.ctx;
	ctx.save();
	ctx.fillStyle = color;
	ctx.globalAlpha = 0.4;
	ctx.translate(this.globalCenterX(),this.globalCenterY());
	ctx.fillRect(
		-this.collisionWidth(dummy_object)/2,
		-this.collisionHeight(dummy_object)/2,
		this.collisionWidth(dummy_object),
		this.collisionHeight(dummy_object)
	);
	ctx.restore();
};


// NOTE: deprecated
ObjectBase.prototype.checkCollision = function(obj) {
	return this.intersect(obj);
};

// NOTE: deprecated
ObjectBase.prototype.checkCollisionByObject = function(obj) {
	return this.intersect(obj);
};
/*
*******************************
* disable flag methods
*******************************
*/

// set flags that disappears in frame elapsed
// TODO: enable to set flag which becomes false -> true
// TODO: reset flag if the object calls init method
ObjectBase.prototype.setAutoDisableFlag = function(flag_name, count) {
	var self = this;

	self[flag_name] = true;

	self._auto_disable_times_map[flag_name] = self.frame_count + count;

};

// check flags that disappears in frame elapsed
ObjectBase.prototype._checkAutoDisableFlags = function() {
	var self = this;
	for (var flag_name in self._auto_disable_times_map) {
		if(this._auto_disable_times_map[flag_name] < self.frame_count) {
			self[flag_name] = false;
			delete self._auto_disable_times_map[flag_name];
		}
	}
};

/*
*******************************
* velocity methods
*******************************
*/

ObjectBase.prototype.moveByVelocity = function(velocity) {
	if (velocity.magnitude === 0) {
		return;
	}

	var x = Util.calcMoveXByVelocity(velocity);
	var y = Util.calcMoveYByVelocity(velocity);

	// save previous (x,y)
	this._previous_x = this.x();
	this._previous_y = this.y();

	this.x(this.x() + x);
	this.y(this.y() + y);
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

ObjectBase.prototype.moveBack = function() {
	if (this._previous_x === null && this._previous_y) return;

	var current_x = this.x();
	var current_y = this.y();

	this.x(this._previous_x);
	this.y(this._previous_y);

	this._previous_x = current_x;
	this._previous_y = current_y;
};

/*
*******************************
* other methods
*******************************
*/

ObjectBase.prototype.isOutOfStage = function() {
	console.error("object's isOutOfStage method is deprecated.");
	return this.isOutOfScene.apply(this, arguments);
};

ObjectBase.prototype.isOutOfScene = function() {
	if(this.x() + EXTRA_OUT_OF_SIZE < 0 ||
	   this.y() + EXTRA_OUT_OF_SIZE < 0 ||
	   this.x() > this.scene.width  + EXTRA_OUT_OF_SIZE ||
	   this.y() > this.scene.height + EXTRA_OUT_OF_SIZE
	  ) {
		return true;
	}

	return false;
};

ObjectBase.prototype.isOutOfView = function() {
	if(this.globalCenterX() + EXTRA_OUT_OF_SIZE < 0 ||
	   this.globalCenterY() + EXTRA_OUT_OF_SIZE < 0 ||
	   this.globalCenterX() > this.core.width  + EXTRA_OUT_OF_SIZE ||
	   this.globalCenterY() > this.core.height + EXTRA_OUT_OF_SIZE
	  ) {
		return true;
	}

	return false;
};

/*
*******************************
* point object class
*******************************
*/

var ObjectPoint = function(scene) {
	ObjectBase.apply(this, arguments);

};
Util.inherit(ObjectPoint, ObjectBase);

ObjectPoint.prototype.collisionWidth = function(){
	return 1;
};
ObjectPoint.prototype.collisionHeight = function(){
	return 1;
};
ObjectPoint.prototype.width = function() {
	return 1;
};
ObjectPoint.prototype.height = function() {
	return 1;
};

module.exports = {
	object_base: ObjectBase,
	object_point: ObjectPoint,
};
