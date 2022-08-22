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
router.post("/getUserForCreateTeam", GamesController.getUserForCreateTeam);

module.exports = router;