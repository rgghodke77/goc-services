var express = require("express");
const GamesController = require("../controllers/GamesController");

var router = express.Router();

router.post("/getGames", GamesController.gamesList);
router.post("/mergeGame", GamesController.mergeGame);
router.post("/mergeRole", GamesController.mergeRole);
router.post("/getRoles", GamesController.getRoles);
router.post("/uploadImage", GamesController.uploadImage);
router.post("/mergeTeam", GamesController.mergeTeam);
router.post("/getTeams", GamesController.getTeams);
router.post("/getMyTeam", GamesController.getMyTeam);
router.post("/getUserForCreateTeam", GamesController.getUserForCreateTeam);
router.post("/deleteTeam", GamesController.deleteTeam);
router.post("/deletePlayer", GamesController.deletePlayer);
router.post("/wildSearchPlayers", GamesController.wildSearchPlayers);
router.post("/forgetPasswordOtp", GamesController.forgetPasswordOtp);
router.post("/resetPassword", GamesController.resetPassword);

module.exports = router;