'use strict';

// TODO: add pooling logic

var base_object = require('./base');
var util = require('../util');

var PoolManager = function(scene) {
	base_object.apply(this, arguments);

	this.objects = [];
};
util.inherit(PoolManager, base_object);

PoolManager.prototype.init = function() {
	base_object.prototype.init.apply(this, arguments);

	this.objects = [];
};

PoolManager.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].beforeDraw();
	}
};

PoolManager.prototype.draw = function(){
	base_object.prototype.draw.apply(this, arguments);
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].draw();
	}
};

PoolManager.prototype.afterDraw = function(){
	base_object.prototype.afterDraw.apply(this, arguments);
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].afterDraw();
	}
};

PoolManager.prototype.addObject = function(object){
	this.objects.push(object);
};

PoolManager.prototype.addObjects = function(objects) {
	 this.objects = this.objects.concat(objects);
};
module.exports = PoolManager;
