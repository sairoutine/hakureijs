'use strict';
var CONSTANT = require("./constant");
var ImageLoader = require("./asset_loader/image");

var Core = function(canvas) {
	this.ctx = canvas.getContext('2d');

	this.width = Number(canvas.getAttribute('width'));
	this.height = Number(canvas.getAttribute('height'));

	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run
	this.scenes = {};

	this.frame_count = 0;

	this.request_id = null;

	this.key_down_map = {};
	this.is_connect_gamepad = false;

	this.image_loader = new ImageLoader();
};
Core.prototype.init = function () {
	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run

	this.frame_count = 0;

	this.request_id = null;

	this.key_down_map = {};
	this.is_connect_gamepad = false;

	this.image_loader.init();
};
Core.prototype.enableGamePad = function () {
	this.is_connect_gamepad = true;
};

Core.prototype.isRunning = function () {
	return this.request_id ? true : false;
};
Core.prototype.startRun = function () {
	if(this.isRunning()) return;

	this.run();
};
Core.prototype.run = function(){
	// get gamepad input
	this.handleGamePad();

	// go to next scene if next scene is set
	this.changeNextSceneIfReserved();

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
	this._reserved_next_scene = name;
};
Core.prototype.changeNextSceneIfReserved = function() {
	if(this._reserved_next_scene) {
		this.current_scene = this._reserved_next_scene;
		this.currentScene().init();

		this._reserved_next_scene = null;
	}
};
Core.prototype.clearCanvas = function() {
	this.ctx.clearRect(0, 0, this.width, this.height);
};
Core.prototype.handleKeyDown = function(e) {
	var keycode = e.keyCode;

	// initialize
	if(!(keycode in this.key_down_map)) {
		this.key_down_map[keycode] = 0;
	}

	this.key_down_map[keycode]++;
	e.preventDefault();
};
Core.prototype.handleKeyUp = function(e) {
	this.key_down_map[e.keyCode] = 0;
	e.preventDefault();
};
Core.prototype.handleGamePad = function() {
	if(!this.is_connect_gamepad) return;

	var pads = navigator.getGamepads();
	var pad = pads[0]; // 1P gamepad

	if(!pad) return;

	var num_to_keycode = [
		CONSTANT.BUTTON_Z,
		CONSTANT.BUTTON_X,
	];

	for (var i = 0, len = num_to_keycode.length; i < len; i++) {
		if (pad.buttons[i].pressed) {
			// initialize
			if(!(num_to_keycode[i] in this.key_down_map)) {
				this.key_down_map[ num_to_keycode[i] ] = 0;
			}

			this.key_down_map[ num_to_keycode[i] ]++;
		}
		else {
			this.key_down_map[ num_to_keycode[i] ] = 0;
		}
	}

	// up
	if(pad.axes[1] < -0.5) {
		if(!(CONSTANT.BUTTON_UP in this.key_down_map)) {
			this.key_down_map[CONSTANT.BUTTON_UP] = 0;
		}

		this.key_down_map[CONSTANT.BUTTON_UP]++;
	}
	else {
		this.key_down_map[CONSTANT.BUTTON_UP] = 0;
	}

	// down
	if(pad.axes[1] >  0.5) { 
		if(!(CONSTANT.BUTTON_UP in this.key_down_map)) {
			this.key_down_map[CONSTANT.BUTTON_DOWN] = 0;
		}

		this.key_down_map[CONSTANT.BUTTON_DOWN]++;
	}
	else {
		this.key_down_map[CONSTANT.BUTTON_DOWN] = 0;
	}

	// left
	if(pad.axes[0] < -0.5) { 
		if(!(CONSTANT.BUTTON_UP in this.key_down_map)) {
			this.key_down_map[CONSTANT.BUTTON_LEFT] = 0;
		}

		this.key_down_map[CONSTANT.BUTTON_LEFT]++;
	}
	else {
		this.key_down_map[CONSTANT.BUTTON_LEFT] = 0;
	}

	// right
	if(pad.axes[0] >  0.5) {
		if(!(CONSTANT.BUTTON_UP in this.key_down_map)) {
			this.key_down_map[CONSTANT.BUTTON_RIGHT] = 0;
		}

		this.key_down_map[CONSTANT.BUTTON_RIGHT]++;
	}
	else {
		this.key_down_map[CONSTANT.BUTTON_RIGHT] = 0;
	}
};



Core.prototype.isKeyDown = function(keycode) {
	return this.key_down_map[keycode] > 0 ? true : false;
};
Core.prototype.isKeyPush = function(keycode) {
	return this.key_down_map[keycode] === 1 ? true : false;
};

module.exports = Core;
