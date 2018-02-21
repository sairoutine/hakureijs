'use strict';

// typography speed
var TYPOGRAPHY_SPEED = 10;

var Util = require("../util");
var BaseClass = require("./serif_abolished_notifier_base");

var ScenarioManager = function (option) {
	option = option || {};
	this._is_auto_start = "auto_start" in option ? option.auto_start : true;

	this._timeoutID = null;

	// serif scenario
	this._script = null;

	// where serif has progressed
	this._progress = null;

	this._chara_id_list  = [];
	this._exp_id_list    = [];
	this._option = {};

	// which chara is talking, left or right
	this._pos = null;

	this._is_background_changed = false;
	this._background_image_name = null;

	this._char_list = "";
	this._char_idx = 0;

	this._is_enable_printing_message = true;

	// now printing message
	this._line_num = 0;
	this._printing_lines = [];
};
Util.inherit(ScenarioManager, BaseClass);

ScenarioManager.prototype.init = function (script) {
	if(!script) console.error("set script arguments to use serif_manager class");

	// serif scenario
	this._script = script;

	this._chara_id_list  = [];
	this._exp_id_list    = [];
	this._option = {};



	this._progress = -1;
	this._timeoutID = null;
	this._pos  = null;

	this._is_background_changed = false;
	this._background_image_name = null;


	this._char_list = "";
	this._char_idx = 0;

	this._is_enable_printing_message = true;

	this._line_num = 0;
	this._printing_lines = [];

	if(this._is_auto_start && !this.isEnd()) {
		this.next(); // start
	}
};

ScenarioManager.prototype.setAutoStart = function (flag) {
	this._is_auto_start = flag;
};



ScenarioManager.prototype.isEnd = function () {
	return this._progress === this._script.length - 1;
};
ScenarioManager.prototype.isStart = function () {
	return this._progress > -1;
};

ScenarioManager.prototype.next = function () {
	this._progress++;

	var script = this._script[this._progress];

	this._showChara(script);

	this._showBackground(script);

	this._setOption(script);

	if(script.serif) {
		this._printMessage(script.serif);
	}
	else {
		// If serif is empty, show chara without talking and next
		if(!this.isEnd()) {
			this.next();
		}
	}
};

ScenarioManager.prototype._showBackground = function(script) {
	this._is_background_changed = false;
	if(script.background && this._background_image_name !== script.background) {
		this._is_background_changed = true;
		this._background_image_name  = script.background;
	}
};

ScenarioManager.prototype._showChara = function(script) {
	var pos = script.pos;

	// NOTE: for deprecated pos setting
	if (pos === "left")  pos = 0;
	if (pos === "right") pos = 1;

	if (!pos) pos = 0;

	this._pos  = pos;

	this._chara_id_list[pos] = script.chara;
	this._exp_id_list[pos]   = script.exp;
};

ScenarioManager.prototype._setOption = function(script) {
	this._option = script.option || {};

	// for deprecated script "font_color"
	if (script.font_color) {
		this._option = Util.shallowCopyHash(this.option);
		this._option.font_color = script.font_color;
	}
};

ScenarioManager.prototype._printMessage = function (message) {
	// cancel already started message
	this._cancelPrintMessage();

	// setup to show message
	this._char_list = message.split("");
	this._char_idx = 0;

	// clear showing message
	this._line_num = 0;
	this._printing_lines = [];

	this._startPrintMessage();
};
// is waiting to be called next?
ScenarioManager.prototype.isWaitingNext = function () {
	return this.isEndPrinting() && !this.isEnd();
};

ScenarioManager.prototype.isEndPrinting = function () {
	var char_length = this._char_list.length;
	return this._char_idx >= char_length ? true : false;
};

ScenarioManager.prototype._startPrintMessage = function () {
	var char_length = this._char_list.length;
	if (this._char_idx >= char_length) return;

	if(this._is_enable_printing_message) {
		var ch = this._char_list[this._char_idx];
		this._char_idx++;

		if (ch === "\n") {
			this._line_num++;
		}
		else {
			// initialize
			if(!this._printing_lines[this._line_num]) {
				this._printing_lines[this._line_num] = "";
			}

			// show A word
			this._printing_lines[this._line_num] = this._printing_lines[this._line_num] + ch;
		}
	}

	this._timeoutID = setTimeout(Util.bind(this._startPrintMessage, this), TYPOGRAPHY_SPEED);
};

ScenarioManager.prototype._cancelPrintMessage = function () {
	if(this._timeoutID !== null) {
		clearTimeout(this._timeoutID);
		this._timeoutID = null;
	}
};

ScenarioManager.prototype.startPrintMessage = function () {
	this._is_enable_printing_message = true;
};
ScenarioManager.prototype.cancelPrintMessage = function () {
	this._is_enable_printing_message = false;
};

ScenarioManager.prototype.isBackgroundChanged = function () {
	return this._is_background_changed;
};
ScenarioManager.prototype.getBackgroundImageName = function () {
	return this._background_image_name;
};

ScenarioManager.prototype.getImageName = function (pos) {
	pos = pos || 0;
	return(this._chara_id_list[pos] ? this.getChara(pos) + "_" + this._exp_id_list[pos] : null);
};
ScenarioManager.prototype.getChara = function (pos) {
	pos = pos || 0;
	return(this._chara_id_list[pos] ? this._chara_id_list[pos] : null);
};

ScenarioManager.prototype.isTalking = function (pos) {
	return this._pos === pos ? true : false;
};
ScenarioManager.prototype.getOption = function () {
	return this._option;
};
ScenarioManager.prototype.lines = function () {
	return this._printing_lines;
};
ScenarioManager.prototype.getSerifRowsCount = function () {
	// TODO: only calculate once
	var script = this._script[this._progress];
	if (!script) return 0;

	var serif = script.serif;
	return( (serif.match(new RegExp("\n", "g")) || []).length + 1 );
};




module.exports = ScenarioManager;
