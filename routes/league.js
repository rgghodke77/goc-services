var express = require("express");
const LeagueController = require("../controllers/LeagueController");

var router = express.Router();

router.post("/mergeLeague", LeagueController.mergeLeague);
router.post("/getLeagues", LeagueController.getLeagues);
router.post("/addTeamsToLeague", LeagueController.addTeamToLeagues);
router.post("/getTeamsFromLeague", LeagueController.getLeagueTeams);




module.exports = router;