'use strict';

/*
 * TODO: split load and save method by sync and async
 * TODO: compress save data
 * TODO: implement: defineColumnProperty method
 */

var Util = require("../util");

var DEFAULT_KEY = "hakurei_engine:default";

var StorageBase = function (data) {
	if(!data) data = {};
	this._data = data;
};

// save file unique key
// this constant must be overridden!
StorageBase.KEY = function() {
	return DEFAULT_KEY;
};

StorageBase.prototype.set = function(key, value) {
	this._data[key] = value;
};
StorageBase.prototype.get = function(key) {
	return this._data[key];
};
StorageBase.prototype.remove = function(key) {
	return delete this._data[key];
};
StorageBase.prototype.isEmpty = function(key) {
	return Object.keys(this._data).length === 0;
};
StorageBase.prototype.toHash = function() {
	return Util.shallowCopyHash(this._data);
};


// is Electron or NW.js ?
StorageBase.isLocalMode = function() {
	// this is Electron
	if (Util.isElectron()) {
		return true;
	}

	// TODO: NW.js
	return false;
};

StorageBase.prototype.save = function() {
	var Klass = this.constructor;
	if (Klass.isLocalMode()) {
		this._saveToLocalFile();
	}
	else {
		this._saveToWebStorage();

	}
};

StorageBase.prototype._saveToLocalFile = function() {
	var Klass = this.constructor;
	var fs = window.require('fs');

	var data = JSON.stringify(this._data);

	var dir_path = Klass._localFileDirectoryPath();

	var file_path = dir_path + Klass._localFileName(Klass.KEY());

	if (!fs.existsSync(dir_path)) {
		fs.mkdirSync(dir_path);
	}
	fs.writeFileSync(file_path, data);
};

// save file directory
StorageBase._localFileDirectoryPath = function() {
	var path = window.require('path');
	var app  = window.require('electron').remote.app;
	var base = app.getPath("appData");
	var app_name = app.getName();
	return path.join(base, app_name, 'save/');
};

StorageBase._localFileName = function(key) {
	return key + ".json";
};

StorageBase._localFilePath = function(key) {
	return this._localFileDirectoryPath() + this._localFileName(key);
};

StorageBase.prototype._saveToWebStorage = function() {
	var Klass = this.constructor;

	var key = Klass.KEY();
	var data = JSON.stringify(this._data);
	try {
		window.localStorage.setItem(key, data);
	}
	catch (e) {
	}
};

StorageBase.load = function() {
	var data;
	if (this.isLocalMode()) {
		data = this._loadFromLocalFile();
	}
	else {
		data = this._loadFromWebStorage();
	}

	var Klass = this;
	if (data) {
		// there is a storage data
		return new Klass(data);
	}
	else {
		// there is NOT a storage data
		return new Klass();
	}

};

StorageBase._loadFromLocalFile = function() {
	var fs = window.require('fs');

	var file_path = this._localFilePath(this.KEY());
	if (!fs.existsSync(file_path)) return null;

	var data = fs.readFileSync(file_path, { encoding: 'utf8' });

	var Klass = this;
	if (data) {
		return JSON.parse(data);
	}
	else {
		return null;
	}
};

StorageBase._loadFromWebStorage = function() {
	var key = this.KEY();
	var data;
	try {
		data = window.localStorage.getItem(key);
	}
	catch (e) {
	}

	var Klass = this;
	if (data) {
		return JSON.parse(data);
	}
	else {
		return null;
	}

};

StorageBase.prototype.del = function() {
	var Klass = this.constructor;
	if (Klass.isLocalMode()) {
		this._removeLocalFile();
	}
	else {
		this._removeWebStorage();
	}

	// reset this object properties
	this._data = {};
};

StorageBase.prototype._removeLocalFile = function() {
	var Klass = this.constructor;
	var fs = window.require('fs');
	var file_path = this._localFilePath(Klass.KEY());

	if (fs.existsSync(file_path)) {
		fs.unlinkSync(file_path);
	}
};

StorageBase.prototype._removeWebStorage = function() {
	var Klass = this.constructor;
	var key = Klass.KEY();
	try {
		window.localStorage.removeItem(key);
	}
	catch (e) {
	}
};

module.exports = StorageBase;
