var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var TeamSchema = new Schema({
	teamName: {type: String, required: true},
	teamLogo: {type: String,default: 'logo.png'},
	teamSlogan: {type: String,default: 'Teamwork makes the dream work!'},
	gameId: { type: Schema.ObjectId, ref: "Game", required: true },
	createdBy: { type: Schema.ObjectId, ref: "User", required: true },
	status: {type: Boolean,default: 1},
}, {timestamps: true});

module.exports = mongoose.model("Team", TeamSchema);