'use strict';
var MasterDAOGenerator = require("./dao_generator");

// static class
var MasterRepositoryGenerator = {};
MasterRepositoryGenerator.exec = function (type_info, option, data_list) {
	if (!type_info || typeof type_info !== "object") throw new Error("type_info argument must be set");

	option = option || {
		pk: null,
		validate: false,
	};
	data_list = data_list || [];

	if (!option.pk) throw new Error("pk option must be set");

	// create DAO class
	var DAOClass = MasterDAOGenerator.exec(type_info, option);

	// convert hash array => instance hash and list
	var instance_hash = {};
	var instance_list = [];
	for (var i = 0, len = data_list.length; i < len; i++) {
		var data = data_list[i];

		if (!(option.pk in data)) throw new Error(option.pk + " key data does not exists in master data (index: " + i + ")");

		var pk_value = data[option.pk];

		// create instance
		var instance = new DAOClass(data);
		instance_hash[pk_value] = instance;
		instance_list[i] = instance;
	}

	// repository is static class.
	var RepositoryClass = {
	};

	// property
	RepositoryClass.DAOClass = DAOClass;

	// methods
	RepositoryClass.find = function (pk) {
		return instance_hash[pk];
	};

	RepositoryClass.all = function () {
		return instance_list;
	};


	return RepositoryClass;
};

module.exports = MasterRepositoryGenerator;
