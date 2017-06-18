'use strict';

var SerifManager = function () {
	this.timeoutID = null;

	// serif scenario
	this.script = null;

	// where serif has progressed
	this.progress = null;

	this.left_chara_id  = null;
	this.left_exp       = null;
	this.right_chara_id = null;
	this.right_exp      = null;

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

	this.progress = -1;
	this.timeoutID = null;
	this.left_chara_id = null;
	this.left_exp = null;
	this.right_chara_id = null;
	this.right_exp = null;
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
	return this.progress + 1 === this.script.length;
};

SerifManager.prototype.next = function () {
	this.progress++;

	var script = this.script[this.progress];

	this._showChara(script);

	this._showBackground(script);

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
	if(script.background) {
		if (this.background !== script.background) {
			this._is_background_changed = true;
		}

		this.background  = script.background;
	}
};

SerifManager.prototype._showChara = function(script) {
	if(script.pos) {
		this.pos  = script.pos;

		if(script.pos === "left") {
			this.left_chara_id = script.chara;
			this.left_exp = script.exp;
		}
		else if(script.pos === "right") {
			this.right_chara_id = script.chara;
			this.right_exp = script.exp;
		}
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

	// typography speed
	var speed = 10;

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

	self.timeoutID = setTimeout(self._startPrintMessage.bind(self), speed);
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




SerifManager.prototype.right_image = function () {
	return(this.right_chara_id ? this.right_chara_id + "_" + this.right_exp : null);
};
SerifManager.prototype.left_image = function () {
	return(this.left_chara_id ? this.left_chara_id + "_" + this.left_exp : null);
};

SerifManager.prototype.right_name = function () {
	return this.right_chara_id ? "name_" + this.right_chara_id : null;
};
SerifManager.prototype.left_name = function () {
	return this.left_chara_id ? "name_" + this.left_chara_id : null;
};
SerifManager.prototype.is_left_talking = function () {
	return this.pos === "left" ? true : false;
};
SerifManager.prototype.is_right_talking = function () {
	return this.pos === "right" ? true : false;
};
SerifManager.prototype.background_image = function () {
	return this.background;
};
SerifManager.prototype.is_background_changed = function () {
	return this._is_background_changed;
};





SerifManager.prototype.lines = function () {
	return this.printing_lines;
};

module.exports = SerifManager;
