var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LeagueMatchesSchema = new mongoose.Schema({
    teamA:{type:Schema.ObjectId,ref: "LeagueTeam", required: true},
    teamB:{type:Schema.ObjectId,ref: "LeagueTeam", required: true},
    winner:{type:Boolean,default:0},
    runnerUp:{type:Boolean,default:0},
    points:{type:Number},
    nrr:{type:Number},
    entryFeesPaid:{type:Boolean,default:0},
    transactionId:{type:String}

},{timestamps: true});

module.exports = mongoose.model("LeagueMatch",LeagueMatchesSchema);