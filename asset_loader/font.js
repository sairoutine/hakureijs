'use strict';

var FontLoader = function() {
	this.is_done = false;
};
FontLoader.prototype.init = function() {
	this.is_done = false;
};
FontLoader.prototype.isAllLoaded = function() {
	return this.is_done;
};

FontLoader.prototype.notifyLoadingDone = function() {
	this.is_done = true;
};

module.exports = FontLoader;
