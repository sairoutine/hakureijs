'use strict';

/*
 * TODO: split load and save method by sync and async
 * TODO: compress save data
 * TODO: implement: defineColumnProperty method
 */



var DEFAULT_KEY = "hakurei_engine_game";

var StorageData = function (data) {
	this._data = data;
};

// save file unique key
// this constant must be overridden!
StorageData.KEY = function() {
	return DEFAULT_KEY;
};


// is Electron or NW.js ?
StorageData.isLocalMode = function() {
	return typeof require === 'function' && typeof process === 'object' && process.title !== 'browser';
};

StorageData.prototype.save = function() {
	if (StorageData.isLocalMode()) {
		this._saveToLocalFile();
	}
	else {
		this._saveToWebStorage();

	}
};

StorageData.prototype._saveToLocalFile = function() {
	var fs = require('fs');

	var data = JSON.stringify(this._data);

	var dir_path = StorageData._localFileDirectoryPath();

	var file_path = dir_path + StorageData._localFileName(StorageData.KEY());

	if (!fs.existsSync(dir_path)) {
		fs.mkdirSync(dir_path);
	}
	fs.writeFileSync(file_path, data);
};

// save file directory
StorageData._localFileDirectoryPath = function() {
	var path = require('path');

	var base = path.dirname(process.mainModule.filename);
	return path.join(base, 'save/');
};

StorageData._localFileName = function(key) {
	return key + ".json";
};

StorageData._localFilePath = function(key) {
	return StorageData._localFileDirectoryPath() + StorageData._localFileName(key);
};

StorageData.prototype._saveToWebStorage = function() {
	var key = StorageData.KEY();
	var data = JSON.stringify(this._data);
	try {
		window.localStorage.setItem(key, data);
	}
	catch (e) {
	}
};

StorageData.load = function() {
	if (StorageData.isLocalMode()) {
		return StorageData._loadFromLocalFile();
	}
	else {
		return StorageData._loadFromWebStorage();
	}
};

StorageData._loadFromLocalFile = function() {
	var fs = require('fs');

	var file_path = this.localFilePath(StorageData.KEY());
	if (!fs.existsSync()) return null;

	var data = fs.readFileSync(file_path, { encoding: 'utf8' });

	if (data) {
		return new StorageData(JSON.parse(data));
	}
	else {
		return null;
	}
};

StorageData._loadFromWebStorage = function() {
	var key = StorageData.KEY();
	var data;
	try {
		data = window.localStorage.getItem(key);
	}
	catch (e) {
	}

	if (data) {
		return new StorageData(JSON.parse(data));
	}
	else {
		return null;
	}

};

StorageData.prototype.del = function() {
	if (StorageData.isLocalMode()) {
		this._removeLocalFile();
	}
	else {
		this._removeWebStorage();
	}
};

StorageData.prototype._removeLocalFile = function() {
	var fs = require('fs');
	var file_path = this.localFilePath(StorageData.KEY());
	if (fs.existsSync(file_path)) {
		fs.unlinkSync(file_path);
	}
};

StorageData.prototype._removeWebStorage = function() {
	var key = StorageData.KEY();
	try {
		window.localStorage.removeItem(key);
	}
	catch (e) {
	}
};

module.exports = StorageData;
