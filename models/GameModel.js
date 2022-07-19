var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var GameSchema = new Schema({
	gameName: {type: String, required: true}
}, {timestamps: true});

module.exports = mongoose.model("Game", GameSchema);