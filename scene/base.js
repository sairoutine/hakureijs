'use strict';
var ObjectBase = require("../object/base");
var Util = require('../util');

var SceneBase = function(core) {
	this.core = core;
	// TODO: parent -> parent() because ajust to root method
	this.parent = null; // parent scene if this is sub scene
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

	// property for fade in
	this._fade_in_duration = null;
	this._fade_in_color = null;
	this._fade_in_start_frame_count = null;

	// property for fade out
	this._fade_out_duration = null;
	this._fade_out_color = null;
	this._fade_out_start_frame_count = null;

	// property for wait to start bgm
	this._wait_to_start_bgm_name = null;
	this._wait_to_start_bgm_duration = null;
	this._wait_to_start_bgm_start_frame_count = null;

	// UI view
	this.ui = new UI(this);
	this.addObject(this.ui);
};

SceneBase.prototype.init = function(){
	// sub scenes
	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run

	this._x = 0;
	this._y = 0;

	this.frame_count = 0;

	// property for fade in
	this._fade_in_duration = null;
	this._fade_in_color = null;
	this._fade_in_start_frame_count = null;

	// property for fade out
	this._fade_out_duration = null;
	this._fade_out_color = null;
	this._fade_out_start_frame_count = null;

	// property for wait to start bgm
	this._wait_to_start_bgm_name = null;
	this._wait_to_start_bgm_duration = null;
	this._wait_to_start_bgm_start_frame_count = null;

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].init();
	}
};

SceneBase.prototype.beforeDraw = function(){
	// for setWaitToStartBGM method
	if (this._wait_to_start_bgm_name) {
		if(this.frame_count - this._wait_to_start_bgm_start_frame_count >= this._wait_to_start_bgm_duration) {
			this.core.audio_loader.playBGM(this._wait_to_start_bgm_name);

			// reset properties for wait to start bgm
			this._wait_to_start_bgm_name = null;
			this._wait_to_start_bgm_duration = null;
			this._wait_to_start_bgm_start_frame_count = null;
		}
	}

	// go to next sub scene if next scene is set
	this.changeNextSubSceneIfReserved();

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].beforeDraw();
	}

	if(this.currentSubScene()) this.currentSubScene().beforeDraw();

	this.frame_count++;
};

SceneBase.prototype.draw = function(){
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].draw();
	}
	if(this.currentSubScene()) this.currentSubScene().draw();
};

SceneBase.prototype.afterDraw = function(){
	var ctx = this.core.ctx;

	var alpha;
	// fade in
	if (this.isInFadeIn()) {
		ctx.save();

		// tranparent settings
		if(this.frame_count - this._fade_in_start_frame_count < this._fade_in_duration) {
			alpha = 1.0 - (this.frame_count - this._fade_in_start_frame_count) / this._fade_in_duration;
		}
		else {
			alpha = 0.0;
		}

		ctx.globalAlpha = alpha;

		// transition color
		ctx.fillStyle = this._fade_in_color;
		ctx.fillRect(0, 0, this.width, this.height);

		ctx.restore();

		// alpha === 0.0 by transparent settings so quit fade in
		// why there? because alpha === 0, _fade_in_color === null by quitFadeIn method
		if(alpha === 1) this._quitFadeIn();

	}
	// fade out
	else if (this.isInFadeOut()) {
		ctx.save();

		// tranparent settings
		if(this.frame_count - this._fade_out_start_frame_count < this._fade_out_duration) {
			alpha = (this.frame_count - this._fade_out_start_frame_count) / this._fade_out_duration;
		}
		else {
			alpha = 1.0;
		}

		ctx.globalAlpha = alpha;

		// transition color
		ctx.fillStyle = this._fade_out_color;
		ctx.fillRect(0, 0, this.width, this.height);

		ctx.restore();

		// alpha === 1.0 by transparent settings so quit fade out
		// why there? because alpha === 1, _fade_out_color === null by quitFadeOut method
		if(alpha === 1) this._quitFadeOut();
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
SceneBase.prototype.removeAllObject = function() {
	this.objects = [];
};
SceneBase.prototype.removeObject = function(object){
	// TODO: O(n) -> O(1)
	for(var i = 0, len = this.objects.length; i < len; i++) {
		if(this.objects[i].id === object.id) {
			this.objects.splice(i, 1);
			break;
		}
	}
};




// set parent scene if this is sub scene
SceneBase.prototype.setParent = function(parent_scene) {
	if(this.parent) throw new Error("already set parent");
	this.parent = parent_scene;
};

SceneBase.prototype.resetParent = function() {
	this.parent = null;
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
	scene.setParent(this);
	this.scenes[name] = scene;
};
SceneBase.prototype.changeSubScene = function() {
	var args = Array.prototype.slice.call(arguments); // to convert array object
	this._reserved_next_scene = args;

	// immediately if no sub scene is set
	if (!this.current_scene) {
		this.changeNextSubSceneIfReserved();
	}
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
	this._fade_in_duration = duration || 30;
	this._fade_in_color = color || 'white';

	// start fade in immediately
	this._startFadeIn();
};
SceneBase.prototype._startFadeIn = function() {
	this._quitFadeOut();
	this._fade_in_start_frame_count = this.frame_count;
};

SceneBase.prototype._quitFadeIn = function() {
	this._fade_in_duration = null;
	this._fade_in_color = null;
	this._fade_in_start_frame_count = null;
};
SceneBase.prototype.isInFadeIn = function() {
	return this._fade_in_start_frame_count !== null ? true : false;
};


SceneBase.prototype.setFadeOut = function(duration, color) {
	duration = typeof duration !== "undefined" ? duration : 30;
	this._fade_out_duration = duration;
	this._fade_out_color = color || 'black';
};
SceneBase.prototype.startFadeOut = function() {
	if(!this.isSetFadeOut()) return;

	this._quitFadeIn();
	this._fade_out_start_frame_count = this.frame_count;
};

SceneBase.prototype._quitFadeOut = function() {
	this._fade_out_duration = null;
	this._fade_out_color = null;
	this._fade_out_start_frame_count = null;
};
SceneBase.prototype.isInFadeOut = function() {
	return this._fade_out_start_frame_count !== null ? true : false;
};
SceneBase.prototype.isSetFadeOut = function() {
	return this._fade_out_duration && this._fade_out_color ? true : false;
};

// play bgm after some wait counts
SceneBase.prototype.setWaitToStartBGM = function(bgm_name, wait_count) {
	if(!wait_count) wait_count = 0;
	this._wait_to_start_bgm_name = bgm_name;
	this._wait_to_start_bgm_duration = wait_count;
	this._wait_to_start_bgm_start_frame_count = this.frame_count;

};



SceneBase.prototype.x = function(val) {
	if (typeof val !== 'undefined') { this._x = val; }
	return this._x;
};
SceneBase.prototype.y = function(val) {
	if (typeof val !== 'undefined') { this._y = val; }
	return this._y;
};
SceneBase.prototype.root = function() {
	if (this.parent) {
		return this.parent.root();
	}
	else {
		return this;
	}
};


/*
*******************************
* UI view object class
*******************************
*/

var UI = function(scene) {
	ObjectBase.apply(this, arguments);

};
Util.inherit(UI, ObjectBase);

module.exports = SceneBase;

