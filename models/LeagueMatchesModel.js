var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LeagueMatchesSchema = new mongoose.Schema({
    leagueId:{type:Schema.ObjectId,ref: "LeagueTeam", required: true},
    teamAId:{type:Schema.ObjectId,ref: "LeagueTeam", required: true},
    teamBId:{type:Schema.ObjectId,ref: "LeagueTeam", required: true},
    teamAName:{type:String, ref : "LeagueTeam", required: true},
    teamBName:{type: String,ref: "LeagueTeam", required: true},
    MatchDate : {type:Date,required:true},


    status : {type: Boolean , required : true,}// 0-league matches scheduled,1- league matches done, 2-knockouts(second round) done, 3-completed
},{timestamps: true});

module.exports = mongoose.model("LeagueMatch",LeagueMatchesSchema);