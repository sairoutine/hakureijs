'use strict';

var SceneLoading = require('../scene/loading');

var SceneManager = function (core) {
	this._current_scene = null;
	// next scene which changes next frame run
	this._reserved_next_scene_name_and_arguments = null;
	this._scenes = {};

	// add default scene
	this.addScene("loading", new SceneLoading(core));
};
SceneManager.prototype.init = function () {
	this._current_scene = null;
	// next scene which changes next frame run
	this._reserved_next_scene_name_and_arguments = null;
};

SceneManager.prototype.beforeRun = function () {
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

	// immediately if no scene is set
	if (!this._current_scene) {
		this._changeNextSceneIfReserved();
	}
};
SceneManager.prototype._changeNextSceneIfReserved = function() {
	if(this._reserved_next_scene_name_and_arguments) {
		// TODO: exec in scene manager
		if (this.currentScene() && this.currentScene().isSetFadeOut() && !this.currentScene().isInFadeOut()) {
			this.currentScene().startFadeOut();
		}
		else if (this.currentScene() && this.currentScene().isSetFadeOut() && this.currentScene().isInFadeOut()) {
			// waiting for quiting fade out
		}
		else {
			// change next scene
			this._current_scene = this._reserved_next_scene_name_and_arguments.shift();
			var current_scene = this.currentScene();
			current_scene.init.apply(current_scene, this._reserved_next_scene_name_and_arguments);

			this._reserved_next_scene_name_and_arguments = null;
		}
	}
};
SceneManager.prototype.changeSceneWithLoading = function(scene, assets) {
	if(!assets) assets = {};
	this.changeScene("loading", assets, scene);
};
module.exports = SceneManager;
