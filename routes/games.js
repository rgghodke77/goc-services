var express = require("express");
const GamesController = require("../controllers/GamesController");

var router = express.Router();

router.post("/getGames", GamesController.gamesList);
router.post("/mergeGame", GamesController.mergeGame);
router.post("/mergeRole", GamesController.mergeRole);
router.post("/getRoles", GamesController.getRoles);

module.exports = router;