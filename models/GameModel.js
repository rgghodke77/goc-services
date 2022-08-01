var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var GameSchema = new Schema({
	gameName: {type: String, required: true},
	status: {type: Boolean,default: 1},
}, {timestamps: true});

module.exports = mongoose.model("Game", GameSchema);