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
	// cancel already playing bgms if init method is called by re-init
	this.stopAllBGM();

	// TODO: cancel already playing sound?
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

	if(typeof volume === 'undefined') volume = 1.0;


	// it's done to load sound
	var onload_function = function() {
		self.loaded_audio_num++;
	};

	var audio = new window.Audio(path);
	audio.volume = volume;
	audio.addEventListener('canplay', onload_function);
	audio.addEventListener("error", function () {
		throw new Error("Audio Element error. code: " + audio.error.code + ", message: " + audio.error.message);
	});
	audio.load();
	self.sounds[name] = {
		audio: audio,
	};
};

AudioLoader.prototype.loadBGM = function(name, path, volume, loopStart, loopEnd) {
	if (!this.audio_context) return;

	var self = this;
	self.loading_audio_num++;

	if(typeof volume === 'undefined') volume = 1.0;

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
	if (!this.audio_context) return;
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

AudioLoader.prototype.playSoundByDataURL = function(dataurl, volume) {
	if(!window || !window.Audio) return;

	if(typeof volume === 'undefined') volume = 1.0;

	var audio = new window.Audio();
	audio.volume = volume;
	audio.src = dataurl;
	audio.addEventListener('canplay', function () {
		audio.play();
	});
	audio.addEventListener("error", function () {
		throw new Error("Audio Element error. code: " + audio.error.code + ", message: " + audio.error.message);
	});
	audio.load();
};



AudioLoader.prototype.playBGM = function(name) {
	// stop playing bgm
	this.stopAllBGM();

	this.addBGM(name);
};
AudioLoader.prototype.addBGM = function(name) {
	if (!this.audio_context) return;
	if (this.isPlayingBGM(name)) {
		this.stopBGM(name);
	}

	this._audio_source_map[name] = this._createSourceNodeAndGainNode(name);
	this._audio_source_map[name].source_node.start(0);
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

	// NOTE: not use AudioBufferSourceNode's stop method
	// because it creates noises.
	this.fadeOutBGM(0.1, name);

	if (name in this._audio_source_map) {
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
AudioLoader.prototype.fadeOutAllBGM = function (fadeout_time) {
	for (var bgm_name in this._audio_source_map) {
		this.fadeOutBGM(fadeout_time, bgm_name);
	}
};

AudioLoader.prototype.fadeOutBGM = function (fadeout_time, bgm_name) {
	if (!this.audio_context) return;
	if(typeof bgm_name === "undefined") {
		return this.fadeOutAllBGM(fadeout_time);
	}

	var map = this._audio_source_map[bgm_name];

	if (!map) return;

	var audio_gain = map.gain_node;

	var gain = audio_gain.gain;
	var startTime = this.audio_context.currentTime;
	gain.setValueAtTime(gain.value, startTime); // for old browser
	var endTime = startTime + fadeout_time;
	gain.linearRampToValueAtTime(0, endTime);
};

AudioLoader.prototype.muteAllBGM = function () {
	for (var bgm_name in this._audio_source_map) {
		this.muteBGM(bgm_name);
	}
};

AudioLoader.prototype.muteBGM = function (bgm_name) {
	if (!this.audio_context) return;
	if(typeof bgm_name === "undefined") {
		return this.muteAllBGM();
	}

	var map = this._audio_source_map[bgm_name];

	if (!map) return;

	var audio_gain = map.gain_node;

	// mute
	audio_gain.gain.setValueAtTime(0, this.audio_context.currentTime);
};
AudioLoader.prototype.unMuteAllBGM = function () {
	for (var bgm_name in this._audio_source_map) {
		this.unMuteBGM(bgm_name);
	}
};

AudioLoader.prototype.unMuteBGM = function (bgm_name) {
	if (!this.audio_context) return;
	if(typeof bgm_name === "undefined") {
		return this.unMuteAllBGM();
	}

	var map = this._audio_source_map[bgm_name];

	if (!map) return;

	var audio_gain = map.gain_node;

	var data = this.bgms[bgm_name];
	audio_gain.gain.setValueAtTime(data.volume, this.audio_context.currentTime);
};

AudioLoader.prototype.unMuteWithFadeInAllBGM = function (fadein_time) {
	for (var bgm_name in this._audio_source_map) {
		this.unMuteWithFadeInBGM(fadein_time, bgm_name);
	}
};

AudioLoader.prototype.unMuteWithFadeInBGM = function (fadein_time, bgm_name) {
	if (!this.audio_context) return;
	if(typeof bgm_name === "undefined") {
		return this.unMuteWithFadeInAllBGM(fadein_time);
	}

	var map = this._audio_source_map[bgm_name];

	if (!map) return;

	var data = this.bgms[bgm_name];

	var audio_gain = map.gain_node;

	var gain = audio_gain.gain;
	var startTime = this.audio_context.currentTime;
	gain.setValueAtTime(gain.value, startTime); // for old browser
	var endTime = startTime + fadein_time;
	gain.linearRampToValueAtTime(data.volume, endTime);
};









// create AudioBufferSourceNode and GainNode instance
AudioLoader.prototype._createSourceNodeAndGainNode = function(name) {
	if (!this.audio_context) return;
	var self = this;
	var data = self.bgms[name];

	var source = self.audio_context.createBufferSource();
	source.buffer = data.audio;

	if("loopStart" in data || "loopEnd" in data) { source.loop = true; }
	if(data.loopStart) { source.loopStart = data.loopStart; }
	if(data.loopEnd)   { source.loopEnd = data.loopEnd; }

	var audio_gain = self.audio_context.createGain();
	audio_gain.gain.setValueAtTime(data.volume, self.audio_context.currentTime);

	source.connect(audio_gain);

	audio_gain.connect(self.audio_context.destination);
	source.start = source.start || source.noteOn;
	source.stop  = source.stop  || source.noteOff;

	return {
		source_node: source,
		gain_node: audio_gain,
	};
};

AudioLoader.prototype.progress = function() {
	// avoid division by zero
	if (this.loading_audio_num === 0) return 1;

	return this.loaded_audio_num / this.loading_audio_num;
};


module.exports = AudioLoader;
