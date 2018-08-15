'use strict';

var Log = function() {
	this._mode = this.ERROR;

	this._generateFunction();
};

Log.prototype.DEBUG = 0;
Log.prototype.INFO  = 1;
Log.prototype.WARN  = 2;
Log.prototype.ERROR = 3;

var ModeToFunctionMap = {};
ModeToFunctionMap[Log.prototype.DEBUG] = {
	"name": "debug",
	"logger": function () { console.log.apply(console, arguments); },
};
ModeToFunctionMap[Log.prototype.INFO] = {
	"name": "info",
	"logger": function () { console.info.apply(console, arguments); },
};
ModeToFunctionMap[Log.prototype.WARN] = {
	"name": "warn",
	"logger": function () { console.warn.apply(console, arguments); },
};
ModeToFunctionMap[Log.prototype.ERROR] = {
	"name": "error",
	"logger": function () { console.error.apply(console, arguments); },
};

Log.prototype.setMode = function (mode) {
	this._mode = mode;

	this._generateFunction();
};

Log.prototype.mode = function () {
	return this._mode;
};

// generate log function by log level
Log.prototype._generateFunction = function () {
	for (var key in ModeToFunctionMap) {
		var info = ModeToFunctionMap[key];
		var name = info.name;
		var func = info.logger;

		if (this.mode() <= key) {
			this[name] = func;
		}
		else {
			this[name] = function () {};
		}
	}
};

module.exports = new Log();
