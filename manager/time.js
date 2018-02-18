'use strict';

var TimeManager = function (core) {
	this.core = core;

	this.events = {};
};
TimeManager.prototype.init = function () {
	this.events = {};
};

TimeManager.prototype.setTimeout = function (callback, frame_count) {
	var current_frame_count = this.core.frame_count;
	var execute_timing = current_frame_count + frame_count;

	if(!this.events[execute_timing]) {
		this.events[execute_timing] = [];
	}

	this.events[execute_timing].push({
		callback: callback,
	});
};

TimeManager.prototype.executeEvents = function () {
	var current_frame_count = this.core.frame_count;
	var current_events = this.events[current_frame_count];

	if(!current_events) return;

	for (var i = 0, len = current_events.length; i < len; i++) {
		var event = current_events[i];
		event.callback();
	}

	delete this.events[current_frame_count];
};


module.exports = TimeManager;
