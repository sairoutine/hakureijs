'use strict';

var DebugManager = function (core) {
	this.core = core;
	this.dom = null; // debug menu area

	this.is_debug_mode = false; // default: false


	this._is_showing_collision_area = false; // default: false

	this._variables = {};
};

DebugManager.prototype.setOn = function (dom) {
	this.is_debug_mode = true;
	this.dom = dom;
};
DebugManager.prototype.setOff = function () {
	this.is_debug_mode = false;
	this.dom = null;
};

DebugManager.prototype.set = function (name, value) {
	if(!this.is_debug_mode) return;

	this._variables[name] = value;
};
DebugManager.prototype.get = function (name) {
	if(!this.is_debug_mode) return null;

	return this._variables[name];
};



// add text menu
DebugManager.prototype.addMenuText = function (text) {
	if(!this.is_debug_mode) return;

	// create element
	var dom = window.document.createElement('pre');
	dom.textContent = text;

	// add element
	this.dom.appendChild(dom);
};

// add button menu
DebugManager.prototype.addMenuButton = function (button_value, func) {
	if(!this.is_debug_mode) return;

	var core = this.core;

	// create element
	var input = window.document.createElement('input');

	// set attributes
	input.setAttribute('type', 'button');
	input.setAttribute('value', button_value);
	input.onclick = function () {
		func(core);
	};

	// add element
	this.dom.appendChild(input);
};

// add select pull down menu
DebugManager.prototype.addMenuSelect = function (button_value, pulldown_list, func) {
	if(!this.is_debug_mode) return;

	var core = this.core;

	// create element
	var input = window.document.createElement('input');

	// select tag
	var select = window.document.createElement("select");

	// label
	var option_label = document.createElement("option");
	option_label.setAttribute("value", "");
	option_label.appendChild(document.createTextNode(button_value));
	select.appendChild(option_label);

	// add event
	select.onchange = function () {
		if(select.value === "") return;
		func(core, select.value);
	};

	// set attributes
	for (var i = 0, len = pulldown_list.length; i < len; i++) {
		var opt = pulldown_list[i];
		var value = opt.value;
		var name = name in opt ? opt.name : value;

		var option = document.createElement("option");
		option.setAttribute("value", value);
		option.appendChild( document.createTextNode(name) );
		select.appendChild(option);
	}

	// add element
	this.dom.appendChild(select);
};

DebugManager.prototype.addGitLatestCommitInfo = function (user_name, repo_name, branch) {
	if(!this.is_debug_mode) return;

	branch = branch || "master";

	var core = this.core;

	// create element
	var dom = window.document.createElement('pre');

	// add element
	this.dom.appendChild(dom);

	var git_api_url = "https://api.github.com/repos/" + user_name + "/" + repo_name + "/branches/" + branch;

	// fetch git info
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		if(xhr.status !== 200) {
			return;
		}

		var json_text = xhr.response;

		var json;
		if (json_text) {
			json = JSON.parse(json_text);
		}
		else {
			throw new Error("Can't parse git lastest commit info");
		}

		dom.textContent =
			//"sha: " + json.commit.sha + "\n" +
			//"author: " + json.commit.commit.author.name + "\n" +
			"last update date: " + (new Date(json.commit.commit.author.date)) + "\n" +
			//"message: " + json.commit.commit.message + "\n" +
			""
		;
	};

	xhr.open('GET', git_api_url, true);
	xhr.send(null);
};










// show collision area of object instance
DebugManager.prototype.setShowingCollisionAreaOn = function () {
	if(!this.is_debug_mode) return null;
	this._is_showing_collision_area = true;
};
DebugManager.prototype.setShowingCollisionAreaOff = function () {
	if(!this.is_debug_mode) return null;
	this._is_showing_collision_area = false;
};
DebugManager.prototype.isShowingCollisionArea = function () {
	if(!this.is_debug_mode) return false;
	return this._is_showing_collision_area;
};

module.exports = DebugManager;
