'use strict';

var ObjectBase = function(scene) {
	this.scene = scene;
	this.core = scene.core;

	this.frame_count = 0;
};

ObjectBase.prototype.init = function(){
	this.frame_count = 0;

};

ObjectBase.prototype.beforeDraw = function(){
	this.frame_count++;

};

ObjectBase.prototype.draw = function(){
};

ObjectBase.prototype.afterDraw = function(){
};

module.exports = ObjectBase;

