'use strict';

/* TODO: create input_manager class */

var WebGLDebugUtils = require("webgl-debug");
var CONSTANT = require("./constant");
var DebugManager = require("./debug_manager");
var ImageLoader = require("./asset_loader/image");
var AudioLoader = require("./asset_loader/audio");
var FontLoader = require("./asset_loader/font");
var SceneLoading = require('./scene/loading');

var ShaderProgram = require('./shader_program');
var VS = require("./shader/main.vs");
var FS = require("./shader/main.fs");

var Core = function(canvas, options) {
	if(!options) {
		options = {};
	}

	this.canvas_dom = canvas;
	this.ctx = null; // 2D context
	this.gl  = null; // 3D context

	// WebGL 3D mode
	if(options.webgl) {
		this.gl = this.createWebGLContext(this.canvas_dom);

		// shader program
		this.sprite_3d_shader = new ShaderProgram(
			this.gl,
			// verticle shader, fragment shader
			VS, FS,
			// attributes
			[
				"aTextureCoordinates",
				"aVertexPosition",
				"aColor"
			],
			// uniforms
			[
				"uMVMatrix",
				"uPMatrix",
				"uSampler", // texture data
			]
		);
	}
	// Canvas 2D mode
	else {
		this.ctx = this.canvas_dom.getContext('2d');
	}

	this.debug_manager = new DebugManager(this);

	this.width = Number(canvas.getAttribute('width'));
	this.height = Number(canvas.getAttribute('height'));

	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run
	this.scenes = {};

	this.frame_count = 0;

	this.request_id = null;

	this.current_keyflag = 0x0;
	this.before_keyflag = 0x0;

	this.is_left_clicked  = false;
	this.is_right_clicked = false;
	this.before_is_left_clicked  = false;
	this.before_is_right_clicked = false;
	this.mouse_change_x = 0;
	this.mouse_change_y = 0;
	this.mouse_x = 0;
	this.mouse_y = 0;
	this.mouse_scroll = 0;

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

	this.is_left_clicked  = false;
	this.is_right_clicked = false;
	this.before_is_left_clicked  = false;
	this.before_is_right_clicked = false;
	this.mouse_change_x = 0;
	this.mouse_change_y = 0;
	this.mouse_x = 0;
	this.mouse_y = 0;
	this.mouse_scroll = 0;

	this.image_loader.init();
	this.audio_loader.init();
	this.font_loader.init();

	this.addScene("loading", new SceneLoading(this));
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
Core.prototype.stopRun = function () {
	if(!this.isRunning()) return;

	cancelAnimationFrame(this.request_id);

	this.request_id = null;
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
	this.before_is_left_clicked = this.is_left_clicked;
	this.before_is_right_clicked = this.is_right_clicked;

	// reset mouse wheel and mouse move
	this.mouse_scroll = 0;
	this.mouse_change_x = 0;
	this.mouse_change_y = 0;


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
		if (this.currentScene() && this.currentScene().isSetFadeOut() && !this.currentScene().isInFadeOut()) {
			this.currentScene().startFadeOut();
		}
		else if (this.currentScene() && this.currentScene().isSetFadeOut() && this.currentScene().isInFadeOut()) {
			// waiting for quiting fade out
		}
		else {
			// change next scene
			this.current_scene = this._reserved_next_scene.shift();
			var current_scene = this.currentScene();
			current_scene.init.apply(current_scene, this._reserved_next_scene);

			this._reserved_next_scene = null;
		}
	}
};
Core.prototype.changeSceneWithLoading = function(scene, assets) {
	if(!assets) assets = {};
	this.changeScene("loading", assets, scene);
};

Core.prototype.clearCanvas = function() {
	if (this.is2D()) {
		// 2D
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
	else if (this.is3D()) {
		// 3D
		this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
		this.gl.clearDepth(1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);
	}
};
Core.prototype.is2D = function() {
	return this.ctx ? true : false;
};
Core.prototype.is3D = function() {
	return this.gl ? true : false;
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
Core.prototype.handleMouseDown = function(event) {
	if ("which" in event) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
		this.is_left_clicked  = event.which === 1;
		this.is_right_clicked = event.which === 3;
	}
	else if ("button" in event) {  // IE, Opera
		this.is_left_clicked  = event.button === 1;
		this.is_right_clicked = event.button === 2;
	}
	event.preventDefault();
};
Core.prototype.handleMouseUp = function(event) {
	if ("which" in event) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
		this.is_left_clicked  = event.which === 1 ? false : this.is_left_clicked;
		this.is_right_clicked = event.which === 3 ? false : this.is_right_clicked;
	}
	else if ("button" in event) {  // IE, Opera
		this.is_left_clicked  = event.button === 1 ? false : this.is_left_clicked;
		this.is_right_clicked = event.button === 2 ? false : this.is_right_clicked;
	}
	event.preventDefault();
};
Core.prototype.isLeftClickDown = function() {
	return this.is_left_clicked;
};
Core.prototype.isLeftClickPush = function() {
	// not true if is pressed in previous frame
	return this.is_left_clicked && !this.before_is_left_clicked;
};
Core.prototype.isRightClickDown = function() {
	return this.is_right_clicked;
};
Core.prototype.isRightClickPush = function() {
	// not true if is pressed in previous frame
	return this.is_right_clicked && !this.before_is_right_clicked;
};


Core.prototype.handleMouseMove = function (d) {
	d = d ? d : window.event;
	d.preventDefault();
	this.mouse_change_x = this.mouse_x - d.clientX;
	this.mouse_change_y = this.mouse_y - d.clientY;
	this.mouse_x = d.clientX;
	this.mouse_y = d.clientY;
};
Core.prototype.mousePositionX = function () {
	return this.mouse_x;
};
Core.prototype.mousePositionY = function () {
	return this.mouse_y;
};
Core.prototype.mouseMoveX = function () {
	return this.mouse_change_x;
};
Core.prototype.mouseMoveY = function () {
	return this.mouse_change_y;
};
Core.prototype.handleMouseWheel = function (event) {
	this.mouse_scroll = event.detail ? event.detail : -event.wheelDelta/120;
};
Core.prototype.mouseScroll = function () {
	return this.mouse_scroll;
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

	var BUTTON_ID_TO_BIT_CODE = {
		0: CONSTANT.BUTTON_Z,
		1: CONSTANT.BUTTON_X,
		2: CONSTANT.BUTTON_SELECT,
		3: CONSTANT.BUTTON_START,
		4: CONSTANT.BUTTON_SHIFT,
		5: CONSTANT.BUTTON_SHIFT,
		6: CONSTANT.BUTTON_SPACE,
	};

	// button
	for (var i = 0, len = pad.buttons.length; i < len; i++) {
		if(!(i in BUTTON_ID_TO_BIT_CODE)) continue; // ignore if I don't know its button

		if(pad.buttons[i].pressed) { // pressed
			this.current_keyflag |= BUTTON_ID_TO_BIT_CODE[i];
		}
		else { // not pressed
			this.current_keyflag &= ~BUTTON_ID_TO_BIT_CODE[i];
		}
	}

	// arrow keys
	if (pad.axes[1] < -0.5) {
			this.current_keyflag |= CONSTANT.BUTTON_UP;
	}
	else {
			this.current_keyflag &= ~CONSTANT.BUTTON_UP;
	}
	if (pad.axes[1] > 0.5) {
			this.current_keyflag |= CONSTANT.BUTTON_DOWN;
	}
	else {
			this.current_keyflag &= ~CONSTANT.BUTTON_DOWN;
	}
	if (pad.axes[0] < -0.5) {
			this.current_keyflag |= CONSTANT.BUTTON_LEFT;
	}
	else {
			this.current_keyflag &= ~CONSTANT.BUTTON_LEFT;
	}
	if (pad.axes[0] > 0.5) {
			this.current_keyflag |= CONSTANT.BUTTON_RIGHT;
	}
	else {
			this.current_keyflag &= ~CONSTANT.BUTTON_RIGHT;
	}
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
	// Note: safari 10.0 has document.fonts but not occur loadingdone event
	if(window.document && window.document.fonts && !navigator.userAgent.toLowerCase().indexOf("safari")) {
		window.document.fonts.addEventListener('loadingdone', function() { self.fontLoadingDone(); });
	}
	else {
		self.fontLoadingDone();
	}

	// bind keyboard
	window.onkeydown = function(e) { self.handleKeyDown(e); };
	window.onkeyup   = function(e) { self.handleKeyUp(e); };

	// bind mouse click
	this.canvas_dom.onmousedown = function(e) { self.handleMouseDown(e); };
	this.canvas_dom.onmouseup   = function(e) { self.handleMouseUp(e); };

	// bind mouse move
	this.canvas_dom.onmousemove = function(d) { self.handleMouseMove(d); };

	// bind mouse wheel
	var mousewheelevent=(window.navi && /Firefox/i.test(window.navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
	if (this.canvas_dom.addEventListener) { //WC3 browsers
		this.canvas_dom.addEventListener(mousewheelevent, function(e) {
			var event = window.event || e;
			self.handleMouseWheel(event);
		}, false);
	}

	// unable to use right click menu.
	// not used
	// this.canvas_dom.oncontextmenu = function() { return false; };

	// bind gamepad
	if(window.Gamepad && window.navigator && window.navigator.getGamepads) {
		self.enableGamePad();
	}
};

Core.prototype.createWebGLContext = function(canvas) {
	var gl;
	try {
		gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
		gl = WebGLDebugUtils.makeDebugContext(gl);
	} catch (e) {
		throw e;
	}
	if (!gl) {
		throw new Error ("Could not initialize WebGL");
	}

	return gl;
};




module.exports = Core;
