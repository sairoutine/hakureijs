'use strict';

// TODO:
// for travis-ci test
// for safari
// test for 0 font
// source code reviewing
// for old browser

var FontLoader = function() {
	this._isLoadedDone = false;
	this._loadedFonts  = null;
	this._fontStatues  = {};
	this._hiddenCanvas = null;
};
FontLoader.prototype.init = function() {
	this._isLoadedDone = false;
	this._loadedFonts  = null;
	this._fontStatues  = {};
};
FontLoader.prototype.isAllLoaded = function() {
	for (var name in this._fontStatues) {
		if(!this.isLoaded(name)) return false;
	}

	return true;
};

FontLoader.prototype.progress = function() {
	var all_font_num    = 0;
	var loaded_font_num = 0;
	for (var name in this._fontStatues) {
		all_font_num++;

		if(this.isLoaded(name)) loaded_font_num++;
	}
	return loaded_font_num / all_font_num;
};

FontLoader.prototype.setupEvents = function() {
	var self = this;
	if(self.canUseCssFontLoading()) {
        window.document.fonts.ready.then(function(fonts){
			self._isLoadedDone = true;
			self._loadedFonts = fonts;
        }).catch(function(error){
			throw new Error("Can't load font.");
		});
	}
	else if(self.canUseCssFont()) {
		window.document.fonts.addEventListener('loadingdone', function() {
			self._isLoadedDone = true;
			self._loadedFonts  = null;
		});
	}
	else {
		self._isLoadedDone = true;
		self._loadedFonts  = null;
	}
};

// check if it's enable to use document.fonts.ready
var _canUseCssFontLoading = window.document && window.document.fonts && window.document.fonts.ready;
FontLoader.prototype.canUseCssFontLoading = function(){
	return _canUseCssFontLoading;
};

// check if it's enable to use document.fonts's loadingdone event
// Note: safari 10.0 has document.fonts but not occur loadingdone event
FontLoader.prototype.canUseCssFont = function(){
	return window.document && window.document.fonts && !navigator.userAgent.toLowerCase().indexOf("safari");
};

FontLoader.prototype.isLoaded = function(name) {
	if (!(name in this._fontStatues)) return false;

	var status = this._fontStatues[name];

	if (status.is_loaded) return true;

	var is_loaded = this.checkFontLoaded(name);

	if (is_loaded) {
		status.is_loaded = true;
	}

	return is_loaded;
};

FontLoader.prototype.checkFontLoaded = function(name) {
    if (this.canUseCssFontLoading()) {
        if(this._loadedFonts){
            return this._loadedFonts.check('10px "'+name+'"');
        }

        return false;
    } else {
        if (!this._hiddenCanvas) {
            this._hiddenCanvas = window.document.createElement('canvas');
        }
        var context = this._hiddenCanvas.getContext('2d');
        var text = 'abcdefghijklmnopqrstuvwxyz';
        var width1, width2;
        context.font = '40px ' + name + ', sans-serif';
        width1 = context.measureText(text).width;
        context.font = '40px sans-serif';
        width2 = context.measureText(text).width;
        return width1 !== width2;
    }
};

FontLoader.prototype.loadFont = function(name, url, format) {
	if (!window.document) return false;

	this._fontStatues[name] = {
		is_loaded: false,
	};

	this._createFontFaceStyle(name, url, format);
	this._createFontLoadingDOM(name);

	return true;
};

FontLoader.prototype._createFontFaceStyle = function(name, url, format) {
    var head = window.document.getElementsByTagName('head');

	if (!head) {
		throw new Error ("Fontloader class needs head tag in html file.");
	}

    var rule;
	if (typeof format !== "undefined") {
		rule = '@font-face { font-family: "' + name + '"; src: url("' + url + '") format("' + format + '"); }';
	}
	else {
		rule = '@font-face { font-family: "' + name + '"; src: url("' + url + '"); }';
	}

    var style = window.document.createElement('style');
    style.type = 'text/css';
    head.item(0).appendChild(style);
    style.sheet.insertRule(rule, 0);
};

FontLoader.prototype._createFontLoadingDOM = function(name) {
    var div = window.document.createElement('div');
    var text = window.document.createTextNode('.');
    div.style.fontFamily = name;
    div.style.fontSize = '0px';
    div.style.color = 'transparent';
    div.style.position = 'absolute';
    div.style.margin = 'auto';
    div.style.top = '0px';
    div.style.left = '0px';
    div.style.width = '1px';
    div.style.height = '1px';
    div.appendChild(text);
    window.document.body.appendChild(div);
};





module.exports = FontLoader;
