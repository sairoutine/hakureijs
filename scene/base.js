'use strict';

var SceneBase = function(core, scene) {
	this.core = core;
	this.parent = scene; // parent scene if this is sub scene
	this.width = this.core.width; // default
	this.height = this.core.height; // default

	this._x = 0;
	this._y = 0;

	this.frame_count = 0;

	this.objects = [];

	// sub scenes
	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run
	this.scenes = {};
};

SceneBase.prototype.init = function(){
	// sub scenes
	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run

	this._x = 0;
	this._y = 0;

	this.frame_count = 0;

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].init();
	}
};

SceneBase.prototype.beforeDraw = function(){
	this.frame_count++;

	// go to next sub scene if next scene is set
	this.changeNextSubSceneIfReserved();

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].beforeDraw();
	}

	if(this.currentSubScene()) this.currentSubScene().beforeDraw();
};

SceneBase.prototype.draw = function(){
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].draw();
	}
	if(this.currentSubScene()) this.currentSubScene().draw();
};

SceneBase.prototype.afterDraw = function(){
	var ctx = this.core.ctx;

	// fade in
	if (this.isInFadeIn()) {
		ctx.save();

		// tranparent settings
		var alpha;
		if(this.frame_count - this._fade_start_frame_count < this._fade_duration) {
			alpha = 1.0 - (this.frame_count - this._fade_start_frame_count) / this._fade_duration;
		}
		else {
			alpha = 0.0;
			this._quitFadeIn();
		}

		ctx.globalAlpha = alpha;

		// transition color
		ctx.fillStyle = this._fade_color;
		ctx.fillRect(0, 0, this.width, this.height);

		ctx.restore();
	}

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].afterDraw();
	}

	if(this.currentSubScene()) this.currentSubScene().afterDraw();
};

SceneBase.prototype.addObject = function(object){
	this.objects.push(object);
};
SceneBase.prototype.addObjects = function(object_list){
	this.objects = this.objects.concat(object_list);
};

SceneBase.prototype.currentSubScene = function() {
	if(this.current_scene === null) {
		return;
	}

	return this.scenes[this.current_scene];
};
SceneBase.prototype.getSubScene = function(name) {
	return this.scenes[name];
};

SceneBase.prototype.addSubScene = function(name, scene) {
	this.scenes[name] = scene;
};
SceneBase.prototype.changeSubScene = function() {
	var args = Array.prototype.slice.call(arguments); // to convert array object
	this._reserved_next_scene = args;

};
SceneBase.prototype.changeNextSubSceneIfReserved = function() {
	if(this._reserved_next_scene) {
		this.current_scene = this._reserved_next_scene.shift();

		var current_sub_scene = this.currentSubScene();
		current_sub_scene.init.apply(current_sub_scene, this._reserved_next_scene);

		this._reserved_next_scene = null;
	}

};

SceneBase.prototype.setFadeIn = function(duration, color) {
	// start fade in immediately
	this._startFadeIn(duration, color);
};
SceneBase.prototype._startFadeIn = function(duration, color) {
	this._is_in_fade_out = false; // quit fade out
	this._is_in_fade_in = true;
	this._fade_duration = duration || 30;
	this._fade_color = color || 'white';
	this._fade_start_frame_count = this.frame_count;
};

SceneBase.prototype._quitFadeIn = function() {
	this._is_in_fade_in = false;
	this._fade_duration = null;
	this._fade_color = null;
	this._fade_start_frame_count = null;
};
SceneBase.prototype.isInFadeIn = function() {
	return this._is_in_fade_in;
};

SceneBase.prototype.x = function(val) {
	if (typeof val !== 'undefined') { this._x = val; }
	return this._x;
};
SceneBase.prototype.y = function(val) {
	if (typeof val !== 'undefined') { this._y = val; }
	return this._y;
};

module.exports = SceneBase;

