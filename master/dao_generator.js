'use strict';
/*
	{
		id:          "number",
		type:        "number",
		name:        "string",
		imageName:   "string",
		soundName:   "string",
		description: "string",
	},
	{
		pk: "id"
	},
*/

// static class
var MasterDAOGenerator = {};
MasterDAOGenerator.exec = function (type_info, option) {
	if (!type_info || typeof type_info !== "object") throw new Error("type_info argument must be set");

	option = option || {
		pk: null,
	};

	if (!option.pk) throw new Error("pk option must be set");

	// constructor
	var DAOClass = function (data) {
		this._data = data || {};
	};

	// properties
	for (var method_name in type_info) {
		// var type = type_info[method_name];

		// create property
		(function (method_name) {
			DAOClass.prototype[method_name] = function () {
				return this._data[method_name];
			};
		})(method_name);
	}
	return DAOClass;
};

module.exports = MasterDAOGenerator;
