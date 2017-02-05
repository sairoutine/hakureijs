'use strict';

var SceneBase = function(core) {
	this.core = core;
	this.width = core.width;
	this.height = core.height;

	this.x = 0;
	this.y = 0;

	this.frame_count = 0;

	this.objects = [];
};

SceneBase.prototype.init = function(){
	this.x = 0;
	this.y = 0;

	this.frame_count = 0;

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].init();
	}
};

SceneBase.prototype.beforeDraw = function(){
	this.frame_count++;

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].beforeDraw();
	}
};

SceneBase.prototype.draw = function(){
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].draw();
	}
};

SceneBase.prototype.afterDraw = function(){
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].afterDraw();
	}
};

SceneBase.prototype.addObject = function(object){
	this.objects.push(object);
};


module.exports = SceneBase;

