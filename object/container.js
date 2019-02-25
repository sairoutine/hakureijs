'use strict';
var BaseObject = require('./base');
var util = require('../util');

var Container = function(scene) {
	BaseObject.apply(this, arguments);

	this._objects = {};
};
util.inherit(Container, BaseObject);

Container.prototype.init = function() {
	BaseObject.prototype.init.apply(this, arguments);

	this._objects = {};
};

Container.prototype.update = function(){
	BaseObject.prototype.update.apply(this, arguments);

	for(var id in this._objects) {
		this._objects[id].update();
	}
};

Container.prototype.beforeDraw = function(){
	BaseObject.prototype.beforeDraw.apply(this, arguments);

	for(var id in this._objects) {
		this._objects[id].beforeDraw();
	}
};

Container.prototype.draw = function(){
	BaseObject.prototype.draw.apply(this, arguments);
	for(var id in this._objects) {
		this._objects[id].draw();
	}
};

Container.prototype.afterDraw = function(){
	BaseObject.prototype.afterDraw.apply(this, arguments);
	for(var id in this._objects) {
		this._objects[id].afterDraw();
	}
};
Container.prototype.addObject = function(object) {
	this._objects[object.id] = object;
};

Container.prototype.addObjects = function(object_list){
	for (var i = 0, len = object_list.length; i < len; i++) {
		var object = object_list[i];
		this._objects[object.id] = object;
	}
};
Container.prototype.removeAllObject = function() {
	this._objects = {};
};
Container.prototype.removeObject = function(object){
	return this.remove(object.id);
};
Container.prototype.existsObject = function(object) {
	return object.id in this._objects;
};

Container.prototype.remove = function(id) {
	var ret = this._objects[id];
	delete this._objects[id];
	return ret;
};

Container.prototype.get = function(id) {
	return this._objects[id];
};

Container.prototype.getAll = function() {
	return Object.values(this._objects);
};

Container.prototype.getRandom = function() {
	var ids = Object.keys(this._objects);
	var id = ids[Math.floor(Math.random() * ids.length)];

	return this._objects[id];
};

Container.prototype.forEach = function(f){
	for (var id in this._objects) {
		f(this._objects[id]);
	}
};

Container.prototype.count = function(){
	return Object.keys(this._objects).length;
};



Container.prototype.checkCollisionWithObject = function(obj1) {
	var is_collision = false;
	for(var id in this._objects) {
		var obj2 = this._objects[id];
		if(obj1.intersect(obj2)) {
			obj1.onCollision(obj2);
			obj2.onCollision(obj1);

			is_collision = true;
		}
	}

	return is_collision;
};

Container.prototype.checkCollisionWithContainer = function(container) {
	for(var obj1_id in this._objects) {
		for(var obj2_id in container._objects) {
			if(this._objects[obj1_id].checkCollision(container.get[obj2_id])) {
				var obj1 = this._objects[obj1_id];
				var obj2 = container._objects[obj2_id];

				obj1.onCollision(obj2);
				obj2.onCollision(obj1);

				// do not check died object twice
				if (!this._objects[obj1_id]) {
					break;
				}
			}
		}
	}
};

Container.prototype.removeOutOfStageObjects = function() {
	console.error("object's removeOutOfStageObjects method is deprecated.");
	return this.removeOutOfSceneObjects.apply(this, arguments);
};

Container.prototype.removeOutOfSceneObjects = function() {
	for(var id in this._objects) {
		if(this._objects[id].isOutOfScene()) {
			this.remove(id);
		}
	}
};
module.exports = Container;
