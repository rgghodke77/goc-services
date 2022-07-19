var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
	mobile: {type: Number, required: true},
	password: {type: String, required: true},
	status: {type: Boolean,default: 1},
	gender: {type: String},
	age: {type: Number},
	gameId: { type: Schema.ObjectId, ref: "Game", required: true },
	roleId: { type: Schema.ObjectId, ref: "Role", required: true },
}, {timestamps: true});

// Virtual for user's full name
UserSchema
	.virtual("fullName")
	.get(function () {
		return this.firstName + " " + this.lastName;
	});

module.exports = mongoose.model("User", UserSchema);