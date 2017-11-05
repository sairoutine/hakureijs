'use strict';

var AudioLoader = function() {
	this.sounds = {};
	this.bgms = {};

	this.loading_audio_num = 0;
	this.loaded_audio_num = 0;

	// key: sound_name, value: only true
	// which determine what sound is played.
	this._reserved_play_sound_name_map = {};

	this.audio_context = null;
	if (window && window.AudioContext) {
		this.audio_context = new window.AudioContext();

		// for legacy browser
		this.audio_context.createGain = this.audio_context.createGain || this.audio_context.createGainNode;
	}

	// key: bgm name, value: playing AudioBufferSourceNode instance
	this._audio_source_map = {};
};
AudioLoader.prototype.init = function() {
	// TODO: cancel already loading bgms and sounds

	this.sounds = {};
	this.bgms = {};

	this.loading_audio_num = 0;
	this.loaded_audio_num = 0;

	this._reserved_play_sound_name_map = {};

	this._audio_source_map = {};
};

AudioLoader.prototype.loadSound = function(name, path, volume) {
	if(!window || !window.Audio) return;

	var self = this;
	self.loading_audio_num++;

	if(!volume) volume = 1.0;


	// it's done to load sound
	var onload_function = function() {
		self.loaded_audio_num++;
	};

	var audio = new window.Audio(path);
	audio.volume = volume;
	audio.addEventListener('canplay', onload_function);
	audio.load();
	self.sounds[name] = {
		audio: audio,
	};
};

AudioLoader.prototype.loadBGM = function(name, path, volume, loopStart, loopEnd) {
	if (!this.audio_context) return;

	var self = this;
	self.loading_audio_num++;

	// it's done to load audio
	var successCallback = function(audioBuffer) {
		self.loaded_audio_num++;
		self.bgms[name] = {
			audio:     audioBuffer,
			volume:    volume,
			loopStart: loopStart,
			loopEnd:   loopEnd,
		};
	};

	var errorCallback = function(error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw error;
		}
	};

	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		if(xhr.status !== 200) {
			return;
		}

		var arrayBuffer = xhr.response;

		// decode
		self.audio_context.decodeAudioData(arrayBuffer, successCallback, errorCallback);
	};

	xhr.open('GET', path, true);
	xhr.responseType = 'arraybuffer';
	xhr.send(null);
};

AudioLoader.prototype.isAllLoaded = function() {
	return this.loaded_audio_num === this.loading_audio_num;
};

AudioLoader.prototype.playSound = function(name) {
	if (!(name in this.sounds)) throw new Error("Can't find sound '" + name + "'.");

	this._reserved_play_sound_name_map[name] = true;
};

AudioLoader.prototype.executePlaySound = function() {
	for(var name in this._reserved_play_sound_name_map) {
		// play
		this.sounds[name].audio.pause();
		this.sounds[name].audio.currentTime = 0;
		this.sounds[name].audio.play();

		// delete flag
		delete this._reserved_play_sound_name_map[name];
	}
};
AudioLoader.prototype.playBGM = function(name) {
	// stop playing bgm
	this.stopAllBGM();

	this.addBGM(name);
};
AudioLoader.prototype.addBGM = function(name) {
	if (this.isPlayingBGM(name)) {
		this.stopBGM(name);
	}

	this._audio_source_map[name] = this._createSourceNode(name);
	this._audio_source_map[name].start(0);
};


// play if the bgm is not playing now
AudioLoader.prototype.changeBGM = function(name) {
	if (!this.isPlayingBGM(name)) {
		this.playBGM(name);
	}
};
AudioLoader.prototype.stopAllBGM = function() {
	for (var bgm_name in this._audio_source_map) {
		this.stopBGM(bgm_name);
	}
};
AudioLoader.prototype.stopBGMWithout = function(exclude_bgm_name) {
	for (var bgm_name in this._audio_source_map) {
		if (bgm_name !== exclude_bgm_name) {
			this.stopBGM(bgm_name);
		}
	}
};



AudioLoader.prototype.stopBGM = function(name) {
	if(typeof name === "undefined") {
		return this.stopAllBGM();
	}

	if (name in this._audio_source_map) {
		var audio_source = this._audio_source_map[name];
		audio_source.stop(0);
		delete this._audio_source_map[name];
	}
};
AudioLoader.prototype.isPlayingBGM = function(name) {
	if(typeof name === "undefined") {
		return Object.keys(this._audio_source_map).length ? true : false;
	}
	else {
		return name in this._audio_source_map ? true : false;
	}
};

// create AudioBufferSourceNode instance
AudioLoader.prototype._createSourceNode = function(name) {
	var self = this;
	var data = self.bgms[name];

	var source = self.audio_context.createBufferSource();
	source.buffer = data.audio;

	if("loopStart" in data || "loopEnd" in data) { source.loop = true; }
	if(data.loopStart) { source.loopStart = data.loopStart; }
	if(data.loopEnd)   { source.loopEnd = data.loopEnd; }

	var audio_gain = this.audio_context.createGain();
	audio_gain.gain.value = data.volume || 1.0;

	source.connect(audio_gain);

	audio_gain.connect(self.audio_context.destination);
	source.start = source.start || source.noteOn;
	source.stop  = source.stop  || source.noteOff;

	return source;
};

AudioLoader.prototype.progress = function() {
	return this.loaded_audio_num / this.loading_audio_num;
};


module.exports = AudioLoader;
