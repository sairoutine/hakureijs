'use strict';

// TODO: add _isStartPrintLetter, isPausePrintLetter method

// default typography speed
var TYPOGRAPHY_SPEED = 10;
// default chara position
var POSITION = 0;

var Util = require("../util");
var BaseClass = require("./serif_abolished_notifier_base");

var ScenarioManager = function (core, option) {
	this.core = core;

	option = option || {};
	this._typography_speed      = "typography_speed" in option ? option.typography_speed : TYPOGRAPHY_SPEED;
	this._criteria_function_map = "criteria"         in option ? option.criteria : {};

	// event handler
	this._event_to_callback = {
		printend: function () {},
	};

	this._timeoutID = null;

	// serif scenario
	this._script = null;

	// where serif has progressed
	this._progress = null;

	// chara
	this._current_talking_pos  = null; // which chara is talking
	this._pos_to_chara_id_map = {};
	this._pos_to_exp_id_map = {};

	// background
	this._is_background_changed = false;
	this._current_bg_image_name  = null;

	// junction
	this._current_junction_list = [];

	// option
	this._current_option = {};

	// letter data to print
	this._current_message_letter_list = [];
	this._current_message_sentenses_num = null;
	this._current_message_max_length_letters = null;

	// current printed sentences
	this._letter_idx = 0;
	this._sentences_line_num = 0;
	this._current_printed_sentences = [];
};
Util.inherit(ScenarioManager, BaseClass);

ScenarioManager.prototype.init = function (script) {
	if(!script) throw new Error("set script arguments to use scenario_manager class");

	if (this._timeoutID) this._stopPrintLetter();

	this._script = script.slice(); // shallow copy

	this._progress = -1;

	// chara
	this._current_talking_pos  = null;
	this._pos_to_chara_id_map = {};
	this._pos_to_exp_id_map = {};

	// background
	this._is_background_changed = false;
	this._current_bg_image_name  = null;

	// junction
	this._current_junction_list = [];

	// option
	this._current_option = {};

	// letter data to print
	this._current_message_letter_list = [];
	this._current_message_sentenses_num = null;
	this._current_message_max_length_letters = null;

	// current printed sentences
	this._letter_idx = 0;
	this._sentences_line_num = 0;
	this._current_printed_sentences = [];
};
ScenarioManager.prototype.on = function (event, callback) {
	this._event_to_callback[event] = callback;

	return this;
};
ScenarioManager.prototype.removeEvent = function (event) {
	this._event_to_callback[event] = function(){};

	return this;
};




ScenarioManager.prototype.start = function (progress) {
	if(!this._script) throw new Error("start method must be called after instance was initialized.");

	if (this.isEnd()) return;

	this._progress = progress || 0;

	this._setupCurrentSerifScript();
};


ScenarioManager.prototype.next = function (choice) {
	// chosen serif junction
	choice = choice || 0;

	if (this.isEnd()) return false;

	this._progress++;

	this._chooseNextSerifScript(choice);

	this._setupCurrentSerifScript();

	return true;
};
ScenarioManager.prototype._chooseNextSerifScript = function (choice) {
	var script = this._script[this._progress];

	var type = script.type || "serif";

	var chosen_serifs;
	if (type === "serif") {
		// do nothing
	}
	else if (type === "junction_serif") {
		chosen_serifs = script.serifs[choice];
		// delete current script and insert new chosen serif list
		Array.prototype.splice.apply(this._script, [this._progress, 1].concat(chosen_serifs));
	}
	else if (type === "criteria_serif") {
		var criteria_name = script.criteria;
		var argument_list = script.arguments;
		choice = this._execCriteriaFunction(criteria_name, argument_list);
		chosen_serifs = script.serifs[choice];

		// delete current script and insert new chosen serif list
		Array.prototype.splice.apply(this._script, [this._progress, 1].concat(chosen_serifs));

		// check criteria recursively
		this._chooseNextSerifScript();
	}
	else {
		throw new Error("Unknown serif script type: " + type);
	}
};

ScenarioManager.prototype._execCriteriaFunction = function (criteria_name, argument_list) {
	var criteria_function = this._criteria_function_map[criteria_name];

	if(!criteria_function) throw new Error(criteria_name + " criteria does not exists");

	return criteria_function.apply({}, [this.core].concat(argument_list));
};



ScenarioManager.prototype.isStart = function () {
	return this._progress > -1;
};
ScenarioManager.prototype.isEnd = function () {
	return this._progress === this._script.length - 1;
};



ScenarioManager.prototype.isPrintLetterEnd = function () {
	var letter_length = this._current_message_letter_list.length;
	return this._letter_idx >= letter_length ? true : false;
};


ScenarioManager.prototype._setupCurrentSerifScript = function () {
	var script = this._script[this._progress];

	this._setupChara(script);
	this._setupBackground(script);
	this._setupJunction(script);
	this._setupOption(script);

	this._saveSerifPlayed(script);

	if(script.serif) {
		this._setupSerif(script);
	}
	else {
		// If serif is empty, show chara without talking and next
		if(!this.isEnd()) {
			this.next();
		}
	}
};
ScenarioManager.prototype._setupChara = function(script) {
	var pos   = script.pos;
	var chara = script.chara;
	var exp   = script.exp;

	if (!pos) pos = POSITION;

	this._current_talking_pos  = pos;
	this._pos_to_chara_id_map[this._current_talking_pos] = chara;
	this._pos_to_exp_id_map[this._current_talking_pos]   = exp;
};

ScenarioManager.prototype._setupBackground = function(script) {
	var background = script.background;

	this._is_background_changed = false;

	if(background && this._current_bg_image_name !== background) {
		this._is_background_changed = true;
		this._current_bg_image_name  = background;
	}
};

ScenarioManager.prototype._setupJunction = function(script) {
	var junction_list = script.junction;
	this._current_junction_list = junction_list || [];
};

ScenarioManager.prototype._setupOption = function(script) {
	this._current_option = script.option || {};
};

ScenarioManager.prototype._saveSerifPlayed = function(script) {
	var id = script.id;
	var is_save = script.save;

	if (!is_save) return;

	if (typeof id === "undefined") throw new Error("script save property needs id property");

	this.core.save_manager.scenario.incrementPlayedCount(id);
};


ScenarioManager.prototype._setupSerif = function (script) {
	var message = script.serif;

	// cancel already started message
	this._stopPrintLetter();

	// setup letter data to print
	this._current_message_letter_list = message.split("");

	var sentences = message.split("\n");

	// count max length of sentence
	this._current_message_max_length_letters = 0;
	for (var i = 0, len = sentences.length; i < len; i++) {
		if(this._current_message_max_length_letters < sentences[i].length) {
			this._current_message_max_length_letters = sentences[i].length;
		}
	}

	// count newline of current message
	this._current_message_sentenses_num = sentences.length;

	// clear current printed sentences
	this._letter_idx = 0;
	this._sentences_line_num = 0;
	this._current_printed_sentences = [];

	// start message
	this._startPrintLetter();
};
ScenarioManager.prototype._startPrintLetter = function () {
	this._printLetter();

	if (!this.isPrintLetterEnd()) {
		this._timeoutID = setTimeout(Util.bind(this._startPrintLetter, this), this._typography_speed);
	}
	else {
		this._timeoutID = null;
	}
};

ScenarioManager.prototype._stopPrintLetter = function () {
	if(this._timeoutID !== null) {
		clearTimeout(this._timeoutID);
		this._timeoutID = null;
	}
};

ScenarioManager.prototype._printLetter = function () {
	if (this.isPrintLetterEnd()) return;

	var current_message_letter_list = this._current_message_letter_list;

	// get A letter to add
	var letter = current_message_letter_list[this._letter_idx++];

	if (letter === "\n") {
		this._sentences_line_num++;
	}
	else {
		// initialize if needed
		if(!this._current_printed_sentences[this._sentences_line_num]) {
			this._current_printed_sentences[this._sentences_line_num] = "";
		}

		// print A letter
		this._current_printed_sentences[this._sentences_line_num] += letter;
	}
	// If printing has finished, call printend callback.
	if (this.isPrintLetterEnd()) {
		this._event_to_callback.printend();
	}
};

ScenarioManager.prototype.resumePrintLetter = function () {
	this._startPrintLetter();
};
ScenarioManager.prototype.pausePrintLetter = function () {
	this._stopPrintLetter();
};

ScenarioManager.prototype.getCurrentPrintedSentences = function () {
	return this._current_printed_sentences;
};

ScenarioManager.prototype.getCurrentSentenceNum = function () {
	return this._current_message_sentenses_num;
};

ScenarioManager.prototype.getCurrentMaxLengthLetters = function () {
	return this._current_message_max_length_letters;
};

ScenarioManager.prototype.isBackgroundChanged = function () {
	return this._is_background_changed;
};

ScenarioManager.prototype.getCurrentBackgroundImageName = function () {
	return this._current_bg_image_name;
};

ScenarioManager.prototype.getCurrentOption = function () {
	return this._current_option;
};

ScenarioManager.prototype.getCurrentCharaNameByPosition = function (pos) {
	pos = pos || POSITION;
	return this._pos_to_chara_id_map[pos];
};

ScenarioManager.prototype.getCurrentCharaExpressionByPosition = function (pos) {
	pos = pos || POSITION;
	return this._pos_to_exp_id_map[pos];
};

ScenarioManager.prototype.isCurrentTalkingByPosition = function (pos) {
	return this._current_talking_pos === pos;
};

ScenarioManager.prototype.isCurrentSerifExistsJunction = function () {
	return this._current_junction_list.length > 0;
};

ScenarioManager.prototype.getCurrentJunctionList = function () {
	return this._current_junction_list;
};




module.exports = ScenarioManager;
