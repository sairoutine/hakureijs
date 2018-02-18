'use strict';
module.exports = {
	util: require("./util"),
	core: require("./core"),
	// constant.BUTTON_NAME is deprecated.
	constant: require("./util").assign(require("./constant/button"), {
		button: require("./constant/button"),
	}),
	serif_manager: require("./manager/serif"),
	save_manager: require("./manager/save"),
	shader_program: require("./shader_program"),
	scene: {
		base:    require("./scene/base"),
		loading: require("./scene/loading"),
		movie:   require("./scene/movie"),
	},
	object: {
		base: require("./object/base"),
		point: require("./object/point"),
		sprite: require("./object/sprite"),
		window: require("./object/window"),
		sprite3d: require("./object/sprite3d"),
		pool_manager: require("./object/pool_manager"),
		pool_manager3d: require("./object/pool_manager3d"),
		ui_parts: require("./object/ui_parts"),
	},
	asset_loader: {
		image: require("./asset_loader/image"),
		audio: require("./asset_loader/audio"),
		font:  require("./asset_loader/font"),
	},
	storage: {
		base: require("./storage/base"),
		save: require("./storage/save"),
	},

};
