'use strict';

var Core = function(canvas) {
	this.ctx = canvas.getContext('2d');

	this.width = Number(canvas.getAttribute('width'));
	this.height = Number(canvas.getAttribute('height'));

	this.current_scene = null;
	this.scenes = {};

	this.frame_count = 0;

	this.request_id = null;

	this.key_down_map = {};
};
Core.prototype.init = function () {
	this.current_scene = null;
	this.frame_count = 0;

	this.request_id = null;

	this.key_down_map = {};
};
Core.prototype.isRunning = function () {
	return this.request_id ? true : false;
};
Core.prototype.startRun = function () {
	if(this.isRunning()) return;

	this.run();
};
Core.prototype.run = function(){
	//this.handleGamePad();

	var current_scene = this.currentScene();
	if(current_scene) {
		current_scene.beforeDraw();

		// clear already rendered canvas
		this.clearCanvas();

		current_scene.draw();
		current_scene.afterDraw();
	}

	/*

	if(Config.DEBUG) {
		this._renderFPS();
	}

	// SEを再生
	this.runPlaySound();

	// 押下されたキーを保存しておく
	this.before_keyflag = this.keyflag;
	*/

	// 経過フレーム数更新
	this.frame_count++;

	// 次の描画タイミングで再呼び出ししてループ
	this.request_id = requestAnimationFrame(this.run.bind(this));
};
Core.prototype.currentScene = function() {
	if(this.current_scene === null) {
		return;
	}

	return this.scenes[this.current_scene];
};

Core.prototype.addScene = function(name, scene) {
	this.scenes[name] = scene;
};
Core.prototype.changeScene = function(name) {
	this.current_scene = name;
	this.currentScene().init();
};
Core.prototype.clearCanvas = function() {
	this.ctx.clearRect(0, 0, this.width, this.height);
};
Core.prototype.handleKeyDown = function(e) {
	var keycode = e.keyCode;
	if(!this.key_down_map[keycode]) {
		this.key_down_map[keycode] = 0;
	}

	this.key_down_map[keycode]++;
	e.preventDefault();
};
Core.prototype.handleKeyUp = function(e) {
	this.key_down_map[e.keyCode] = 0;
	e.preventDefault();
};
Core.prototype.isKeyDown = function(keycode) {
	return this.key_down_map[keycode] > 0 ? true : false;
};
Core.prototype.isKeyPush = function(keycode) {
	return this.key_down_map[keycode] === 1 ? true : false;
};

module.exports = Core;
