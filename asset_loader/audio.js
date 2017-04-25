'use strict';

var AudioLoader = function() {
	// TODO: split bgm and sound
	this.audios = {};

	this.loading_audio_num = 0;
	this.loaded_audio_num = 0;

	this.id = 0;

	// flag which determine what sound.
	this.soundflag = 0x00;
};
AudioLoader.prototype.init = function() {
	// TODO: cancel already loading audios

	this.audios = {};

	this.loading_audio_num = 0;
	this.loaded_audio_num = 0;

	this.id = 0;

	this.soundflag = 0x00;
};

AudioLoader.prototype.loadSound = function(name, path, volume) {
	var self = this;

	if(!volume) volume = 1.0;

	self.loading_audio_num++;

	// it's done to load audio
	var onload_function = function() {
		self.loaded_audio_num++;
	};

	var audio = new Audio(path);
	audio.volume = volume;
	audio.addEventListener('canplay', onload_function);
	audio.load();
	self.audios[name] = {
		id: 1 << self.id++,
		audio: audio,
	};
};

AudioLoader.prototype.isAllLoaded = function() {
	return this.loaded_audio_num > 0 && this.loaded_audio_num === this.loading_audio_num;
};

AudioLoader.prototype.playSound = function(name) {
	this.soundflag |= this.audios[name].id;
};

AudioLoader.prototype.executePlaySound = function() {

	for(var name in this.audios) {
		if(this.soundflag & this.audios[name].id) {
			// play
			this.audios[name].audio.pause();
			this.audios[name].audio.currentTime = 0;
			this.audios[name].audio.play();

			// delete flag
			this.soundflag &= ~this.audios[name].id;

		}
	}
};




module.exports = AudioLoader;
