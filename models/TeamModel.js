var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var TeamSchema = new Schema({
	teamName: {type: String, required: true},
	teamLogo: {type: String,default: '/images/logo.png'},
	gameId: { type: Schema.ObjectId, ref: "Game", required: true },
	createdBy: { type: Schema.ObjectId, ref: "User", required: true },
	status: {type: Boolean,default: 1},
}, {timestamps: true});

module.exports = mongoose.model("Team", TeamSchema);