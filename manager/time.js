'use strict';

var ID = 0;

var TimeManager = function (core) {
	this.core = core;

	this.events = {};

	// フレーム数を取得する関数
	this._frame_count_getter = function () {
		return core.frame_count;
	};

};
TimeManager.prototype.init = function () {
	this.events = {};
};

TimeManager.prototype.setFrameCountFunction = function (func) {
	this._frame_count_getter = func;
};

TimeManager.prototype.setTimeout = function (callback, frame_count) {
	var current_frame_count = this._frame_count_getter();
	var execute_timing = current_frame_count + frame_count;
	var id = ++ID;

	if(!this.events[execute_timing]) {
		this.events[execute_timing] = {};
	}

	this.events[execute_timing][id] = {
		callback: callback,
	};

	return id;
};

TimeManager.prototype.clearTimeout = function (id) {
	for (var frame_count in this.events) {
		var current_events = this.events[frame_count];
		if(id in current_events) {
			delete current_events[id];
			return true;
		}
	}

	return false;
};



TimeManager.prototype.executeEvents = function () {
	var current_frame_count = this._frame_count_getter();
	var current_events = this.events[current_frame_count];

	if(!current_events) return;

	for (var id in current_events) {
		var event = current_events[id];
		event.callback();
	}

	delete this.events[current_frame_count];
};


module.exports = TimeManager;
