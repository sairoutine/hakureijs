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

	this._is_inited = false;

	this.objects = [];

	// sub scenes
	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run
	this._is_reserved_next_scene_init = true; // is scene will inited?

	this.scenes = {};

	// property for wait to start bgm
	this._wait_to_start_bgm_name = null;
	this._wait_to_start_bgm_duration = null;
	this._wait_to_start_bgm_start_frame_count = null;

	// property for background
	this._background_color = null;

	// UI view
	this.ui = new UI(this);
	this.addObject(this.ui); // TODO: draw after all objects drawed
};

SceneBase.prototype.init = function(){
	// sub scenes
	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run
	this._is_reserved_next_scene_init = true; // is scene will inited?

	// NOTE: abolished
	// this._x = 0;
	// this._y = 0;

	this.frame_count = 0;

	this._is_inited = true;

	// property for wait to start bgm
	this._wait_to_start_bgm_name = null;
	this._wait_to_start_bgm_duration = null;
	this._wait_to_start_bgm_start_frame_count = null;

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].init();
	}
};

SceneBase.prototype.update = function(){
	this.frame_count++;

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
		this.objects[i].update();
	}

	if(this.currentSubScene()) this.currentSubScene().update();
};

SceneBase.prototype.beforeDraw = function() {
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].beforeDraw();
	}

	if(this.currentSubScene()) this.currentSubScene().beforeDraw();
};

SceneBase.prototype.draw = function(){
	this._drawBackground();

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].draw();
	}
	if(this.currentSubScene()) this.currentSubScene().draw();
};

SceneBase.prototype._drawBackground = function() {
	var ctx = this.core.ctx;

	// background color
	if (this._background_color) {
		ctx.save();
		ctx.fillStyle = this._background_color;
		ctx.fillRect(0, 0, this.width, this.height);
		ctx.restore();
	}

};

SceneBase.prototype.afterDraw = function() {
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

SceneBase.prototype.isInit = function(){
	return this._is_inited;
}

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
	this._is_reserved_next_scene_init = true; // scene will inited

	// immediately if no sub scene is set
	if (!this.current_scene) {
		this.changeNextSubSceneIfReserved();
	}
};
SceneBase.prototype.returnSubScene = function(scene_name) {
	this._reserved_next_scene = [scene_name];
	this._is_reserved_next_scene_init = false; // scene will NOT inited
};

SceneBase.prototype.changeNextSubSceneIfReserved = function() {
	if(this._reserved_next_scene) {
		this.current_scene = this._reserved_next_scene.shift();
		var current_sub_scene = this.currentSubScene();

		var argument_list = this._reserved_next_scene;
		this._reserved_next_scene = null;

		// if returnSubScene method is called, scene will not be inited.
		if(this._is_reserved_next_scene_init) {
			current_sub_scene.init.apply(current_sub_scene, argument_list);
		}
	}

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
SceneBase.prototype.setBackgroundColor = function(color) {
	this._background_color = color;
};

SceneBase.prototype.setFadeIn = function(duration, color) {
	console.error("scene's setFadeIn method is deprecated.");
	return this.core.scene_manager.setFadeIn.apply(this.core.scene_manager, arguments);
};
SceneBase.prototype.isInFadeIn = function() {
	console.error("scene's isInFadeIn method is deprecated.");
	return this.core.scene_manager.isInFadeIn.apply(this.core.scene_manager, arguments);
};
SceneBase.prototype.setFadeOut = function(duration, color) {
	console.error("scene's setFadeOut method is deprecated.");
	return this.core.scene_manager.setFadeOut.apply(this.core.scene_manager, arguments);
};
SceneBase.prototype.startFadeOut = function() {
	console.error("scene's startFadeOut method is deprecated.");
	return this.core.scene_manager.startFadeOut.apply(this.core.scene_manager, arguments);
};
SceneBase.prototype.isInFadeOut = function() {
	console.error("scene's isInFadeOut method is deprecated.");
	return this.core.scene_manager.isInFadeOut.apply(this.core.scene_manager, arguments);
};
SceneBase.prototype.isSetFadeOut = function() {
	console.error("scene's isSetFadeOut method is deprecated.");
	return this.core.scene_manager.isSetFadeOut.apply(this.core.scene_manager, arguments);
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

