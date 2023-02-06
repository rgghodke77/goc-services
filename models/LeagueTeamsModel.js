var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LeagueTeamSchema = new mongoose.Schema({
    leagueId:{type:Schema.ObjectId,ref: "League", required: true},
    teamId:{type:Schema.ObjectId,ref: "Team", required: true},
    leagueName:{type:String,ref: "League", required: true},
    points:{type:Number},
    nrr:{type:Number},
    entryFeesPaid:{type:Boolean,default:0},
    transactionId:{type:String}

},{timestamps: true});

module.exports = mongoose.model("LeagueTeam",LeagueTeamSchema);

