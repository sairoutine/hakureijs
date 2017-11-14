'use strict';

var base_object = require('./base');
var util = require('../util');

var Window = function(scene, Class) {
	base_object.apply(this, arguments);

	this._width = 0;
	this._height = 0;
};
util.inherit(Window, base_object);

Window.prototype.init = function() {
	base_object.prototype.init.apply(this, arguments);

	this._width = 0;
	this._height = 0;
};

Window.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);
};

Window.prototype.draw = function(){
	base_object.prototype.draw.apply(this, arguments);
};

Window.prototype.setSize = function(width, height){
	this._width = width;
	this._height = height;
};

Window.prototype.collisionWidth = function(){
	return this._width;
};
Window.prototype.collisionHeight = function(){
	return this._height;
};
Window.prototype.width = function() {
	return this._width;
};
Window.prototype.height = function() {
	return this._height;
};





module.exports = Window;
