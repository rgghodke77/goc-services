var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PlayerSchema = new Schema({
	playerName: {type: String, required: true},
	playerRole: {type: String},
	mobile: {type: Number,required: true},
	teamId: { type: Schema.ObjectId, ref: "Team", required: true },
	userId: { type: Schema.ObjectId, ref: "User", required: true },
	captain: { type: Boolean,default: 0 },
	status: {type: Boolean,default: 1},
}, {timestamps: true});

module.exports = mongoose.model("Player", PlayerSchema);