'use strict';

var Util = require("./util");

// typography speed
var TYPOGRAPHY_SPEED = 10;



/* TODO:
rename private method
convert method name to camel case
*/
var SerifManager = function () {
	this.timeoutID = null;

	// serif scenario
	this.script = null;

	// where serif has progressed
	this.progress = null;

	this.chara_id_list  = [];
	this.exp_id_list    = [];
	this.option = {};

	// which chara is talking, left or right
	this.pos = null;

	this._is_background_changed = false;
	this.background = null;

	this.char_list = "";
	this.char_idx = 0;

	this.is_enable_printing_message = true;

	// now printing message
	this.line_num = 0;
	this.printing_lines = [];
};

SerifManager.prototype.init = function (script) {
	if(!script) console.error("set script arguments to use serif_manager class");

	// serif scenario
	this.script = script;

	this.chara_id_list  = [];
	this.exp_id_list    = [];
	this.option = {};



	this.progress = -1;
	this.timeoutID = null;
	this.pos  = null;

	this._is_background_changed = false;
	this.background = null;


	this.char_list = "";
	this.char_idx = 0;

	this.is_enable_printing_message = true;

	this.line_num = 0;
	this.printing_lines = [];

	if(!this.is_end()) {
		this.next(); // start
	}
};


SerifManager.prototype.is_end = function () {
	return this.progress === this.script.length - 1;
};

SerifManager.prototype.next = function () {
	this.progress++;

	var script = this.script[this.progress];

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
	if(script.background && this.background !== script.background) {
		this._is_background_changed = true;
		this.background  = script.background;
	}
};

SerifManager.prototype._showChara = function(script) {
	var pos = script.pos;

	if (pos) {
		// NOTE: for depricated pos setting
		if (pos === "left")  pos = 0;
		if (pos === "right") pos = 1;

		this.pos  = pos;

		this.chara_id_list[pos] = script.chara;
		this.exp_id_list[pos]   = script.exp;
	}
};

SerifManager.prototype._setOption = function(script) {
	this.option = script.option || {};

	// for depricated script "font_color"
	if (script.font_color) {
		this.option = Util.shallowCopyHash(this.option);
		this.option.font_color = script.font_color;
	}
};

SerifManager.prototype._printMessage = function (message) {
	var self = this;

	// cancel already started message
	self._cancelPrintMessage();

	// setup to show message
	self.char_list = message.split("");
	self.char_idx = 0;

	// clear showing message
	self.line_num = 0;
	self.printing_lines = [];

	this._startPrintMessage();
};

SerifManager.prototype._startPrintMessage = function () {
	var self = this;
	var char_length = self.char_list.length;
	if (self.char_idx >= char_length) return;

	if(this.is_enable_printing_message) {
		var ch = self.char_list[self.char_idx];
		self.char_idx++;

		if (ch === "\n") {
			self.line_num++;
		}
		else {
			// initialize
			if(!self.printing_lines[self.line_num]) {
				self.printing_lines[self.line_num] = "";
			}

			// show A word
			self.printing_lines[self.line_num] = self.printing_lines[self.line_num] + ch;
		}
	}

	self.timeoutID = setTimeout(self._startPrintMessage.bind(self), TYPOGRAPHY_SPEED);
};

SerifManager.prototype._cancelPrintMessage = function () {
	var self = this;
	if(self.timeoutID !== null) {
		clearTimeout(self.timeoutID);
		self.timeoutID = null;
	}
};

SerifManager.prototype.startPrintMessage = function () {
	this.is_enable_printing_message = true;
};
SerifManager.prototype.cancelPrintMessage = function () {
	this.is_enable_printing_message = false;
};

SerifManager.prototype.is_background_changed = function () {
	return this._is_background_changed;
};
SerifManager.prototype.background_image = function () {
	return this.background;
};

SerifManager.prototype.getImageName = function (pos) {
	pos = pos || 0;
	return(this.chara_id_list[pos] ? this.chara_id_list[pos] + "_" + this.exp_id_list[pos] : null);
};
SerifManager.prototype.isTalking = function (pos) {
	return this.pos === pos ? true : false;
};
SerifManager.prototype.getOption = function () {
	return this.option;
};
SerifManager.prototype.lines = function () {
	return this.printing_lines;
};









// NOTE: depricated
SerifManager.prototype.right_image = function () {
	var pos = 1; // means right

	return this.getImageName(pos);
};
// NOTE: depricated
SerifManager.prototype.left_image = function () {
	var pos = 0; // means left

	return this.getImageName(pos);
};


// NOTE: depricated
SerifManager.prototype.is_right_talking = function () {
	var pos = 1; // means right

	return this.isTalking(pos);
};
// NOTE: depricated
SerifManager.prototype.is_left_talking = function () {
	var pos = 0; // means left

	return this.isTalking(pos);
};

// NOTE: depricated
SerifManager.prototype.font_color = function () {
	return this.option.font_color;
};




module.exports = SerifManager;
