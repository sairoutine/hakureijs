'use strict';

var SceneBase = function(core) {
	this.core = core;

	this.frame_count = 0;
};

SceneBase.prototype.init = function(){
	this.frame_count = 0;
};

SceneBase.prototype.beforeDraw = function(){
	this.frame_count++;
};

SceneBase.prototype.draw = function(){
};

SceneBase.prototype.afterDraw = function(){
};

module.exports = SceneBase;

