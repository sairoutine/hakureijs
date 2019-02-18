'use strict';
var Util = require("../util");

// per frame
var FPS_CALCULATION_INTERVAL = 60;

var DebugManager = function (core) {
	this.core = core;
	this.dom = null; // debug menu area

	this.is_debug_mode = false; // default: false

	this._collision_area_color = null;

	this._is_showing_fps = false; // default: false

	this._variables = {};

	// total drawed count
	this._draw_count = 0;

	// Time when FPS was calculated last time(millisecond)
	this._before_time = 0;

	// calculated current fps
	this._fps = 0;
};
DebugManager.prototype.init = function () {
	this._draw_count = 0;
	this._before_time = 0;
	this._fps = 0;
};
DebugManager.prototype.setOn = function (dom) {
	this.is_debug_mode = true;
	this.dom = dom;
};
DebugManager.prototype.setOff = function () {
	this.is_debug_mode = false;
	this.dom = null;
};

DebugManager.prototype.set = function (name, value) {
	if(!this.is_debug_mode) return;

	this._variables[name] = value;
};
DebugManager.prototype.get = function (name) {
	if(!this.is_debug_mode) return null;

	return this._variables[name];
};

DebugManager.prototype.calculateFps = function () {
	this._draw_count++;

	if(this.isShowingFps()) {
		this._calculateFps();
	}
};

DebugManager.prototype._calculateFps = function () {
	if((this._draw_count % FPS_CALCULATION_INTERVAL) !== 0) return;

	var newTime = this.core.now();

	if(this._before_time) {
		this._fps = Math.floor(1000 * FPS_CALCULATION_INTERVAL / (newTime - this._before_time));
	}

	this._before_time = newTime;
};

DebugManager.prototype.renderFps = function () {
	if(this.isShowingFps()) {
		this._renderFps();
	}
};

DebugManager.prototype._renderFps = function () {
	var ctx = this.core.ctx;
	ctx.save();
	ctx.fillStyle = 'red';
	ctx.textAlign = 'left';
	ctx.font = "16px 'sans-serif'";
	ctx.fillText("FPS: " + this._fps, this.core.width - 70, this.core.height - 10);
	ctx.restore();
};

// add text menu
DebugManager.prototype.addMenuText = function (text) {
	if(!this.is_debug_mode) return;

	// create element
	var dom = window.document.createElement('pre');
	dom.textContent = text;

	// add element
	this.dom.appendChild(dom);
};
// add <br> tag
DebugManager.prototype.addNewLine = function () {
	if(!this.is_debug_mode) return;

	// create element
	var dom = window.document.createElement('br');

	// add element
	this.dom.appendChild(dom);
};

// add image
DebugManager.prototype.addMenuImage = function (image_path) {
	if(!this.is_debug_mode) return;

	// create element
	var dom = window.document.createElement('img');
	dom.src = image_path;

	// add element
	this.dom.appendChild(dom);
};


// add button menu
DebugManager.prototype.addMenuButton = function (button_value, func) {
	if(!this.is_debug_mode) return;

	var core = this.core;

	// create element
	var input = window.document.createElement('input');

	// set attributes
	input.setAttribute('type', 'button');
	input.setAttribute('value', button_value);
	input.onclick = function () {
		func(core);
	};

	// add element
	this.dom.appendChild(input);
};

// add select pull down menu
DebugManager.prototype.addMenuSelect = function (button_value, pulldown_list, func) {
	if(!this.is_debug_mode) return;

	var core = this.core;

	// select tag
	var select = window.document.createElement("select");

	// label
	var option_label = document.createElement("option");
	option_label.setAttribute("value", "");
	option_label.appendChild(document.createTextNode(button_value));
	select.appendChild(option_label);

	// add event
	select.onchange = function () {
		if(select.value === "") return;
		func(core, select.value);
	};

	// set attributes
	for (var i = 0, len = pulldown_list.length; i < len; i++) {
		var opt = pulldown_list[i];
		var value = opt.value;
		var name = name in opt ? opt.name : value;

		var option = document.createElement("option");
		option.setAttribute("value", value);
		option.appendChild( document.createTextNode(name) );
		select.appendChild(option);
	}

	// add element
	this.dom.appendChild(select);
};

DebugManager.prototype.addGitLatestCommitInfo = function (user_name, repo_name, branch) {
	if(!this.is_debug_mode) return;

	branch = branch || "master";

	// create element
	var dom = window.document.createElement('pre');

	// add element
	this.dom.appendChild(dom);

	var git_api_url = "https://api.github.com/repos/" + user_name + "/" + repo_name + "/branches/" + branch;

	// fetch git info
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		if(xhr.status !== 200) {
			return;
		}

		var json_text = xhr.response;

		var json;
		if (json_text) {
			json = JSON.parse(json_text);
		}
		else {
			throw new Error("Can't parse git lastest commit info");
		}

		dom.textContent =
			//"sha: " + json.commit.sha + "\n" +
			//"author: " + json.commit.commit.author.name + "\n" +
			"last update date: " + (new Date(json.commit.commit.author.date)) + "\n" +
			//"message: " + json.commit.commit.message + "\n" +
			""
		;
	};

	xhr.open('GET', git_api_url, true);
	xhr.send(null);
};

// TODO: decide where to move this function
var base64toBlob = function(base64) {
	var tmp = base64.split(',');
	var data = atob(tmp[1]);
	var mime = tmp[0].split(':')[1].split(';')[0];
	var buf = new Uint8Array(data.length);
	for (var i = 0; i < data.length; i++) {
		buf[i] = data.charCodeAt(i);
	}
	// generate blob data
	var blob = new Blob([buf], { type: mime });
	return blob;
};

DebugManager.prototype.addCaputureImageButton = function (button_value, filename) {
	if(!this.is_debug_mode) return;

	var canvas_dom = this.core.canvas_dom;

	this.addMenuButton(button_value, function () {
		var current_filename = filename;

		// default filename is unixtime
		if(typeof filename === "undefined") {
			var date = new Date();
			current_filename = Math.floor(date.getTime() / 1000);
		}

		var base64 = canvas_dom.toDataURL("image/png");

		var blob = base64toBlob(base64);
		Util.downloadBlob(blob, current_filename + ".png");
	});
};

var READ_TYPE_TO_FILEREADER_FUNCTION_NAME = {
	array_buffer: "readAsArrayBuffer",
	binary_string: "readAsBinaryString",
	text: "readAsText",
	data_url: "readAsDataURL",
};


// add upload button
DebugManager.prototype.addUploadFileButton = function (value, func, read_type) {
	if(!this.is_debug_mode) return;

	if(typeof read_type === "undefined") read_type = "array_buffer";

	if(!READ_TYPE_TO_FILEREADER_FUNCTION_NAME[read_type]) throw new Error("Unknown read_type: " + read_type);

	// add text
	var dom = window.document.createElement('pre');
	dom.style.display = "inline"; // unable to insert br
	dom.textContent = value;
	this.dom.appendChild(dom);

	// create element
	var input = window.document.createElement('input');

	// set attributes
	input.setAttribute('type', 'file');

	var reader_func_name = READ_TYPE_TO_FILEREADER_FUNCTION_NAME[read_type];
	var core = this.core;

	input.onchange = function (e) {
		if(!input.value) return;


		var file = e.target.files[0]; // FileList object
		var reader = new FileReader();
		var type = file.type;

		reader.onload = function (e) {
			var result = e.target.result;
			func(core, type, result);
		};

		reader[reader_func_name](file);
	};

	// occur onchange event if same file is set
	input.onclick = function (e) {
		input.value = null;
	};

	// add element
	this.dom.appendChild(input);
};



// show collision area of object instance
DebugManager.prototype.setShowingCollisionAreaOn = function (color) {
	if(!this.is_debug_mode) return null;
	color = color || "white";
	this._collision_area_color = color;
};
DebugManager.prototype.setShowingCollisionAreaOff = function () {
	if(!this.is_debug_mode) return null;
	this._collision_area_color = null;
};
DebugManager.prototype.isShowingCollisionArea = function () {
	if(!this.is_debug_mode) return false;
	return this._collision_area_color ? true : false;
};
DebugManager.prototype.collisionAreaColor = function () {
	if(!this.is_debug_mode) return null;
	return this._collision_area_color;
};

// show fps
DebugManager.prototype.setShowingFpsOn = function () {
	if(!this.is_debug_mode) return null;
	this._is_showing_fps = true;
};
DebugManager.prototype.setShowingFpsOff = function () {
	if(!this.is_debug_mode) return null;
	this._is_showing_fps = false;
};
DebugManager.prototype.isShowingFps = function () {
	if(!this.is_debug_mode) return false;
	return this._is_showing_fps;
};

module.exports = DebugManager;
