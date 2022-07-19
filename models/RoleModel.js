var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var RoleSchema = new Schema({
	role: {type: String, required: true}
}, {timestamps: true});

module.exports = mongoose.model("Role", RoleSchema);