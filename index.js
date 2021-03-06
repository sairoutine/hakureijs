'use strict';
var Hakurei = {
	// deprecated namespaces
	util: require("./util"),
	core: require("./core"),
	shader_program: require("./shader_program"),
	constant: require("./util").assign(require("./constant/button"), {
		button: require("./constant/button"),
	}),
	serif_manager: require("./manager/scenario"),
	save_manager: require("./manager/save"),
	manager: {
		save: require("./manager/save"),
		scenario: require("./manager/scenario"),
	},
	scene: {
		base:    require("./scene/base"),
		loading: require("./scene/loading"),
		movie:   require("./scene/movie"),
	},
	object: {
		base: require("./object/base"),
		point: require("./object/point"),
		sprite: require("./object/sprite"),
		sprite3d: require("./object/sprite3d"),
		pool_manager: require("./object/pool_container"),
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

	// recommended namespaces
	Util: require("./util"),
	Core: require("./core"),
	ShaderProgram: require("./shader_program"),
	Log: require("./log"),
	Constant: {
		Button: require("./constant/button"),
	},
	Manager: {
		Save: require("./manager/save"),
		Scenario: require("./manager/scenario"),
		Time: require("./manager/time"),
		Input: require("./manager/input/index"),
	},
	Scene: {
		Base:    require("./scene/base"),
		Loading: require("./scene/loading"),
		Movie:   require("./scene/movie"),
	},
	Object: {
		Base: require("./object/base"),
		Point: require("./object/point"),
		Sprite: require("./object/sprite"),
		Sprite3d: require("./object/sprite3d"),
		Container: require("./object/container"),
		PoolManager: require("./object/pool_container"), // deprecated
		PoolManager3d: require("./object/pool_manager3d"),
		PoolContainer: require("./object/pool_container"),
		UIParts: require("./object/ui_parts"),
		UI: {
			Base:            require("./object/ui/base"),
			Text:            require("./object/ui/text"),
			Spinner:         require("./object/ui/spinner"),
			Group:           require("./object/ui/group"),
			Image:           require("./object/ui/image"),
		},
	},
	AssetLoader: {
		Image: require("./asset_loader/image"),
		Audio: require("./asset_loader/audio"),
		Font:  require("./asset_loader/font"),
	},
	Storage: {
		Base: require("./storage/base"),
		Save: require("./storage/save"),
	},
	Master: {
		RepositoryGenerator: require("./master/repository_generator"),
	},

};
module.exports = Hakurei;
