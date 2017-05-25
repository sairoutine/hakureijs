'use strict';
var CONSTANT = require("./constant");
var ImageLoader = require("./asset_loader/image");
var AudioLoader = require("./asset_loader/audio");
var FontLoader = require("./asset_loader/font");

var Core = function(canvas) {
	this.canvas_dom = canvas;
	this.ctx = this.canvas_dom.getContext('2d');

	this.width = Number(canvas.getAttribute('width'));
	this.height = Number(canvas.getAttribute('height'));

	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run
	this.scenes = {};

	this.frame_count = 0;

	this.request_id = null;

	this.current_keyflag = 0x0;
	this.before_keyflag = 0x0;

	this.is_connect_gamepad = false;

	this.image_loader = new ImageLoader();
	this.audio_loader = new AudioLoader();
	this.font_loader = new FontLoader();
};
Core.prototype.init = function () {
	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run

	this.frame_count = 0;

	this.request_id = null;

	this.current_keyflag = 0x0;
	this.before_keyflag = 0x0;

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

	// play sound which already set to play
	this.audio_loader.executePlaySound();

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

	// play sound effects
	this.runPlaySound();
	*/

	// save key current pressed keys
	this.before_keyflag = this.current_keyflag;

	this.frame_count++;

	// tick
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
Core.prototype.changeScene = function() {
	var args = Array.prototype.slice.call(arguments); // to convert array object
	this._reserved_next_scene = args;
};
Core.prototype.changeNextSceneIfReserved = function() {
	if(this._reserved_next_scene) {
		this.current_scene = this._reserved_next_scene.shift();

		var current_scene = this.currentScene();
		current_scene.init.apply(current_scene, this._reserved_next_scene);

		this._reserved_next_scene = null;
	}
};
Core.prototype.clearCanvas = function() {
	this.ctx.clearRect(0, 0, this.width, this.height);
};
Core.prototype.handleKeyDown = function(e) {
	this.current_keyflag |= this._keyCodeToBitCode(e.keyCode);
	e.preventDefault();
};
Core.prototype.handleKeyUp = function(e) {
	this.current_keyflag &= ~this._keyCodeToBitCode(e.keyCode);
	e.preventDefault();
};
Core.prototype.isKeyDown = function(flag) {
	return((this.current_keyflag & flag) ? true : false);
};
Core.prototype.isKeyPush = function(flag) {
	// not true if key is pressed in previous frame
	return !(this.before_keyflag & flag) && this.current_keyflag & flag;
};
Core.prototype._keyCodeToBitCode = function(keyCode) {
	var flag;
	switch(keyCode) {
		case 16: // shift
			flag = CONSTANT.BUTTON_SHIFT;
			break;
		case 32: // space
			flag = CONSTANT.BUTTON_SPACE;
			break;
		case 37: // left
			flag = CONSTANT.BUTTON_LEFT;
			break;
		case 38: // up
			flag = CONSTANT.BUTTON_UP;
			break;
		case 39: // right
			flag = CONSTANT.BUTTON_RIGHT;
			break;
		case 40: // down
			flag = CONSTANT.BUTTON_DOWN;
			break;
		case 88: // x
			flag = CONSTANT.BUTTON_X;
			break;
		case 90: // z
			flag = CONSTANT.BUTTON_Z;
			break;
	}
	return flag;
};
Core.prototype.handleGamePad = function() {
	if(!this.is_connect_gamepad) return;
	var pads = navigator.getGamepads();
	var pad = pads[0]; // 1Pコン

	if(!pad) return;

	this.current_keyflag = 0x00;
	this.current_keyflag |= pad.buttons[1].pressed ? CONSTANT.BUTTON_Z:      0x00;// A
	this.current_keyflag |= pad.buttons[0].pressed ? CONSTANT.BUTTON_X:      0x00;// B
	this.current_keyflag |= pad.buttons[2].pressed ? CONSTANT.BUTTON_SELECT: 0x00;// SELECT
	this.current_keyflag |= pad.buttons[3].pressed ? CONSTANT.BUTTON_START:  0x00;// START
	this.current_keyflag |= pad.buttons[4].pressed ? CONSTANT.BUTTON_SHIFT:  0x00;// SHIFT
	this.current_keyflag |= pad.buttons[5].pressed ? CONSTANT.BUTTON_SHIFT:  0x00;// SHIFT
	this.current_keyflag |= pad.buttons[6].pressed ? CONSTANT.BUTTON_SPACE:  0x00;// SPACE
	//this.current_keyflag |= pad.buttons[8].pressed ? 0x04 : 0x00;// SELECT
	//this.current_keyflag |= pad.buttons[9].pressed ? 0x08 : 0x00;// START

	this.current_keyflag |= pad.axes[1] < -0.5 ? CONSTANT.BUTTON_UP:         0x00;// UP
	this.current_keyflag |= pad.axes[1] >  0.5 ? CONSTANT.BUTTON_DOWN:       0x00;// DOWN
	this.current_keyflag |= pad.axes[0] < -0.5 ? CONSTANT.BUTTON_LEFT:       0x00;// LEFT
	this.current_keyflag |= pad.axes[0] >  0.5 ? CONSTANT.BUTTON_RIGHT:      0x00;// RIGHT
};

Core.prototype.fullscreen = function() {
	var mainCanvas = this.canvas_dom;
	if (mainCanvas.requestFullscreen) {
		mainCanvas.requestFullscreen();
	}
	else if (mainCanvas.msRequestuestFullscreen) {
		mainCanvas.msRequestuestFullscreen();
	}
	else if (mainCanvas.mozRequestFullScreen) {
		mainCanvas.mozRequestFullScreen();
	}
	else if (mainCanvas.webkitRequestFullscreen) {
		mainCanvas.webkitRequestFullscreen();
	}
};

// it is done to load fonts
Core.prototype.fontLoadingDone = function() {
	this.font_loader.notifyLoadingDone();
};

Core.prototype.setupEvents = function() {
	if(!window) return;

	var self = this;

	// setup WebAudio
	window.AudioContext = (function(){
		return window.AudioContext || window.webkitAudioContext;
	})();

	// setup requestAnimationFrame
	window.requestAnimationFrame = (function(){
		return window.requestAnimationFrame	||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame	||
			function(callback) { window.setTimeout(callback, 1000 / 60); };
	})();


	// If the browser has `document.fonts`, wait font loading.
	if(window.document && window.document.fonts) {
		window.document.fonts.addEventListener('loadingdone', function() { self.fontLoadingDone(); });
	}
	else {
		self.fontLoadingDone();
	}

	// bind keyboard
	window.onkeydown = function(e) { self.handleKeyDown(e); };
	window.onkeyup   = function(e) { self.handleKeyUp(e); };

	// bind gamepad
	if(window.Gamepad && window.navigator && window.navigator.getGamepads) {
		self.enableGamePad();
	}
};


module.exports = Core;
