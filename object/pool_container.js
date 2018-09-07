'use strict';
// TODO: add pooling logic
var base_object = require('./container');
var util = require('../util');

var PoolContainer = function(scene, Class) {
	base_object.apply(this, arguments);

	this.Class = Class;
};
util.inherit(PoolContainer, base_object);

PoolContainer.prototype.init = function() {
	base_object.prototype.init.apply(this, arguments);
};

PoolContainer.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);
};

PoolContainer.prototype.draw = function(){
	base_object.prototype.draw.apply(this, arguments);
};

PoolContainer.prototype.afterDraw = function(){
	base_object.prototype.afterDraw.apply(this, arguments);
};

PoolContainer.prototype.create = function(args) {
	var object = new this.Class(this.scene);
	object.init.apply(object, arguments);

	this.addObject(object);

	return object;
};
module.exports = PoolContainer;
