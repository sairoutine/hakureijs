'use strict';

// typography speed
var TYPOGRAPHY_SPEED = 10;

var Util = require("./util");

var SerifManager = function () {
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

SerifManager.prototype.init = function (script) {
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

	if(!this.is_end()) {
		this.next(); // start
	}
};

SerifManager.prototype.isEnd = function () {
	return this._progress === this._script.length - 1;
};

SerifManager.prototype.next = function () {
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
		this.next();
	}
};

SerifManager.prototype._showBackground = function(script) {
	this._is_background_changed = false;
	if(script.background && this._background_image_name !== script.background) {
		this._is_background_changed = true;
		this._background_image_name  = script.background;
	}
};

SerifManager.prototype._showChara = function(script) {
	var pos = script.pos;

	if (pos) {
		// NOTE: for deprecated pos setting
		if (pos === "left")  pos = 0;
		if (pos === "right") pos = 1;

		this._pos  = pos;

		this._chara_id_list[pos] = script.chara;
		this._exp_id_list[pos]   = script.exp;
	}
};

SerifManager.prototype._setOption = function(script) {
	this._option = script.option || {};

	// for deprecated script "font_color"
	if (script.font_color) {
		this._option = Util.shallowCopyHash(this.option);
		this._option.font_color = script.font_color;
	}
};

SerifManager.prototype._printMessage = function (message) {
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
SerifManager.prototype.isWaitingNext = function () {
	return this.isEndPrinting() && !this.isEnd();
};

SerifManager.prototype.isEndPrinting = function () {
	var char_length = this._char_list.length;
	return this._char_idx >= char_length ? true : false;
};

SerifManager.prototype._startPrintMessage = function () {
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

SerifManager.prototype._cancelPrintMessage = function () {
	if(this._timeoutID !== null) {
		clearTimeout(this._timeoutID);
		this._timeoutID = null;
	}
};

SerifManager.prototype.startPrintMessage = function () {
	this._is_enable_printing_message = true;
};
SerifManager.prototype.cancelPrintMessage = function () {
	this._is_enable_printing_message = false;
};

SerifManager.prototype.isBackgroundChanged = function () {
	return this._is_background_changed;
};
SerifManager.prototype.getBackgroundImageName = function () {
	return this._background_image_name;
};

SerifManager.prototype.getImageName = function (pos) {
	pos = pos || 0;
	return(this._chara_id_list[pos] ? this._chara_id_list[pos] + "_" + this._exp_id_list[pos] : null);
};
SerifManager.prototype.isTalking = function (pos) {
	return this._pos === pos ? true : false;
};
SerifManager.prototype.getOption = function () {
	return this._option;
};
SerifManager.prototype.lines = function () {
	return this._printing_lines;
};
SerifManager.prototype.getSerifRowsCount = function () {
	// TODO: only calculate once
	var serif = this._script[this._progress].serif;
	return( (serif.match(new RegExp("\n", "g")) || []).length + 1 );
};




// NOTE: deprecated
SerifManager.prototype.right_image = function () {
	var pos = 1; // means right

	return this.getImageName(pos);
};
// NOTE: deprecated
SerifManager.prototype.left_image = function () {
	var pos = 0; // means left

	return this.getImageName(pos);
};
// NOTE: deprecated
SerifManager.prototype.is_right_talking = function () {
	var pos = 1; // means right

	return this.isTalking(pos);
};
// NOTE: deprecated
SerifManager.prototype.is_left_talking = function () {
	var pos = 0; // means left

	return this.isTalking(pos);
};
// NOTE: deprecated
SerifManager.prototype.font_color = function () {
	return this._option.font_color;
};
// NOTE: deprecated
SerifManager.prototype.is_end = function () {
	return this.isEnd();
};
// NOTE: deprecated
SerifManager.prototype.is_background_changed = function () {
	return this.isBackgroundChanged();
};
// NOTE: deprecated
SerifManager.prototype.background_image = function () {
	return this.getBackgroundImageName();
};

module.exports = SerifManager;
