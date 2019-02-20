'use strict';
var BaseObject = require('./base');
var util = require('../util');

var Container = function(scene) {
	BaseObject.apply(this, arguments);

	this.objects = {};
};
util.inherit(Container, BaseObject);

Container.prototype.init = function() {
	BaseObject.prototype.init.apply(this, arguments);

	this.objects = {};
};

Container.prototype.update = function(){
	BaseObject.prototype.update.apply(this, arguments);

	for(var id in this.objects) {
		this.objects[id].update();
	}
};

Container.prototype.beforeDraw = function(){
	BaseObject.prototype.beforeDraw.apply(this, arguments);

	for(var id in this.objects) {
		this.objects[id].beforeDraw();
	}
};

Container.prototype.draw = function(){
	BaseObject.prototype.draw.apply(this, arguments);
	for(var id in this.objects) {
		this.objects[id].draw();
	}
};

Container.prototype.afterDraw = function(){
	BaseObject.prototype.afterDraw.apply(this, arguments);
	for(var id in this.objects) {
		this.objects[id].afterDraw();
	}
};
Container.prototype.addObject = function(object) {
	this.objects[object.id] = object;
};
Container.prototype.addObjects = function(object_list){
	throw new Error("not implemented yet."); // TODO:
};
Container.prototype.removeAllObject = function() {
	this.objects = {};
};
Container.prototype.removeObject = function(object){
	return this.remove(object.id);
};
Container.prototype.existsObject = function(object) {
	return object.id in this.objects;
};

Container.prototype.remove = function(id) {
	var ret = this.objects[id];
	delete this.objects[id];
	return ret;
};

Container.prototype.get = function(id) {
	return this.objects[id];
};

Container.prototype.getRandom = function() {
	var ids = Object.keys(this.objects);
	var id = ids[Math.floor(Math.random() * ids.length)];

	return this.objects[id];
};

Container.prototype.forEach = function(f){
	for (var id in this.objects) {
		f(this.objects[id]);
	}
};

Container.prototype.count = function(){
	return Object.keys(this.objects).length;
};



Container.prototype.checkCollisionWithObject = function(obj1) {
	var is_collision = false;
	for(var id in this.objects) {
		var obj2 = this.objects[id];
		if(obj1.intersect(obj2)) {
			obj1.onCollision(obj2);
			obj2.onCollision(obj1);

			is_collision = true;
		}
	}

	return is_collision;
};

Container.prototype.checkCollisionWithContainer = function(container) {
	for(var obj1_id in this.objects) {
		for(var obj2_id in container.objects) {
			if(this.objects[obj1_id].checkCollision(container.objects[obj2_id])) {
				var obj1 = this.objects[obj1_id];
				var obj2 = container.objects[obj2_id];

				obj1.onCollision(obj2);
				obj2.onCollision(obj1);

				// do not check died object twice
				if (!this.objects[obj1_id]) {
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
	for(var id in this.objects) {
		if(this.objects[id].isOutOfScene()) {
			this.remove(id);
		}
	}
};
module.exports = Container;
