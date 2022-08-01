var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var RoleSchema = new Schema({
	role: {type: String, required: true},
	status: {type: Boolean,default: 1},
}, {timestamps: true});

module.exports = mongoose.model("Role", RoleSchema);