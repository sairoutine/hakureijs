'use strict';

var SceneLoading = require('../scene/loading');

var SceneManager = function (core) {
	this.core = core;

	this._current_scene = null;
	// next scene which changes next frame run
	this._reserved_next_scene_name_and_arguments = null;
	this._is_reserved_next_scene_init = true; // is scene will inited?

	this._scenes = {};

	// property for fade in
	this._fade_in_duration = null;
	this._fade_in_color = null;
	this._fade_in_start_frame_count = null;

	// property for fade out
	this._fade_out_duration = null;
	this._fade_out_color = null;
	this._fade_out_start_frame_count = null;
	this._is_fade_out_finished = false;

	// add default scene
	this.addScene("loading", new SceneLoading(core));
};
SceneManager.prototype.init = function () {
	this._current_scene = null;
	// next scene which changes next frame run
	this._reserved_next_scene_name_and_arguments = null;
	this._is_reserved_next_scene_init = true; // is scene will inited?

	// property for fade in
	this._fade_in_duration = null;
	this._fade_in_color = null;
	this._fade_in_start_frame_count = null;

	// property for fade out
	this._fade_out_duration = null;
	this._fade_out_color = null;
	this._fade_out_start_frame_count = null;
	this._is_fade_out_finished = false;
};

SceneManager.prototype.update = function () {
	// go to next scene if next scene is set
	this._changeNextSceneIfReserved();
};

SceneManager.prototype.currentScene = function() {
	if(this._current_scene === null) {
		return null;
	}

	return this._scenes[this._current_scene];
};

SceneManager.prototype.addScene = function(name, scene) {
	this._scenes[name] = scene;
};

SceneManager.prototype.changeScene = function(scene_name, varArgs) {
	if(!(scene_name in this._scenes)) throw new Error (scene_name + " scene doesn't exists.");

	var args = Array.prototype.slice.call(arguments); // to convert array object
	this._reserved_next_scene_name_and_arguments = args;
	this._is_reserved_next_scene_init = true; // scene will inited

	// immediately if no scene is set
	if (!this._current_scene) {
		this._changeNextSceneIfReserved();
	}
};
SceneManager.prototype.returnScene = function(scene_name) {
	if(!(scene_name in this._scenes)) throw new Error (scene_name + " scene doesn't exists.");

	if(!this._scenes[scene_name].isInit()) throw new Error (scene_name + " scene is not initialized. Please call init method.");

	this._reserved_next_scene_name_and_arguments = [scene_name];
	this._is_reserved_next_scene_init = false; // scene will NOT inited
};

SceneManager.prototype._changeNextSceneIfReserved = function() {
	if(!this._reserved_next_scene_name_and_arguments) return;

	if (this.isSetFadeOut() && !this._is_fade_out_finished && !this.isInFadeOut()) {
		this.startFadeOut();
	}
	else if (this.isSetFadeOut() && !this._is_fade_out_finished && this.isInFadeOut()) {
		// waiting for quiting fade out
	}
	else {
		// change next scene
		this._current_scene = this._reserved_next_scene_name_and_arguments.shift();
		var current_scene = this.currentScene();

		var argument_list = this._reserved_next_scene_name_and_arguments;
		this._reserved_next_scene_name_and_arguments = null;

		// if returnScene method is called, scene will not be inited.
		if(this._is_reserved_next_scene_init) {
			this._resetFadeOut();
			current_scene.init.apply(current_scene, argument_list);
		}

		this._is_fade_out_finished = false;
	}
};
SceneManager.prototype.changeSceneWithLoading = function(scene, assets) {
	if(!assets) assets = {};
	this.changeScene("loading", assets, scene);
};


SceneManager.prototype.setFadeIn = function(duration, color) {
	this._fade_in_duration = duration || 30;
	this._fade_in_color = color || 'white';

	// start fade in immediately
	this._startFadeIn();
};
SceneManager.prototype._startFadeIn = function() {
	this._quitFadeOut();
	this._fade_in_start_frame_count = this.core.frame_count;
};

SceneManager.prototype._quitFadeIn = function() {
	this._fade_in_start_frame_count = null;
};
SceneManager.prototype.isInFadeIn = function() {
	return this._fade_in_start_frame_count !== null ? true : false;
};
SceneManager.prototype.setFadeOut = function(duration, color) {
	duration = typeof duration !== "undefined" ? duration : 30;
	this._fade_out_duration = duration;
	this._fade_out_color = color || 'black';
};
SceneManager.prototype._resetFadeOut = function() {
	this._fade_out_duration = null;
	this._fade_out_color = null;
};

SceneManager.prototype.startFadeOut = function() {
	if(!this.isSetFadeOut()) return;

	this._quitFadeIn();
	this._fade_out_start_frame_count = this.core.frame_count;
};

SceneManager.prototype._quitFadeOut = function() {
	this._fade_out_start_frame_count = null;
};
SceneManager.prototype.isInFadeOut = function() {
	return this._fade_out_start_frame_count !== null ? true : false;
};
SceneManager.prototype.isSetFadeOut = function() {
	return this._fade_out_duration && this._fade_out_color ? true : false;
};

SceneManager.prototype.drawTransition = function() {
	var ctx = this.core.ctx;

	var alpha;
	// fade in
	if (this.isInFadeIn()) {
		ctx.save();
		// tranparent settings
		if(this.core.frame_count - this._fade_in_start_frame_count < this._fade_in_duration) {
			alpha = 1.0 - (this.core.frame_count - this._fade_in_start_frame_count) / this._fade_in_duration;
		}
		else {
			alpha = 0.0;
		}

		ctx.globalAlpha = alpha;

		// transition color
		ctx.fillStyle = this._fade_in_color;
		ctx.fillRect(0, 0, this.core.width, this.core.height);

		ctx.restore();

		// alpha === 0.0 by transparent settings so quit fade in
		// why there? because alpha === 0, _fade_in_color === null by quitFadeIn method
		if(alpha === 0) this._quitFadeIn();

	}
	// fade out
	else if (this.isInFadeOut()) {
		ctx.save();
		// tranparent settings
		if(this.core.frame_count - this._fade_out_start_frame_count < this._fade_out_duration) {
			alpha = (this.core.frame_count - this._fade_out_start_frame_count) / this._fade_out_duration;
		}
		else {
			alpha = 1.0;
		}

		ctx.globalAlpha = alpha;

		// transition color
		ctx.fillStyle = this._fade_out_color;
		ctx.fillRect(0, 0, this.core.width, this.core.height);

		ctx.restore();

		// alpha === 1.0 by transparent settings so quit fade out
		// why there? because alpha === 1, _fade_out_color === null by quitFadeOut method
		if(alpha === 1) {
			this._quitFadeOut();

			this._is_fade_out_finished = true;
		}
	}
};

module.exports = SceneManager;
