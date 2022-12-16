var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LeagueSchema = new mongoose.Schema({
    leagueName:{type:String,require:true},
    leagueDesc:{type:String,require:true},
    leaguePoster:{type:String,default:'defaultLeague.jpg',require:false},
    numberOfPlayers:{type:Number,require:true},
    numberOfOvers:{type:Number,require:true},
    entryFees:{type:Number,require:true},
    leagueAddress:{type:String,require:true},
    startDate:{type:Date,require:true},
    endDate:{type:Date,require:true},
    league1Prices:{type:Number,require:true},
    league2Prices:{type:Number,require:true},
    leagueMom:{type:Number,require:false},
    leagueMot:{type:Number,require:false},
    leagueRules:{type:String,require:true},
    status: {type: Number,default: 1}, // 1- upcoming, 2-ongoing, 3-completed
    gameId: { type: Schema.ObjectId, ref: "Game", required: true },

},{timestamps: true});

module.exports = mongoose.model("League",LeagueSchema);