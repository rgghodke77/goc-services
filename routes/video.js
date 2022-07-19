var express = require("express");
const VideoController = require("../controllers/VideoController");

var router = express.Router();

router.get("/", VideoController.videoList);
router.get("/:id", VideoController.bookDetail);
router.post("/", VideoController.bookStore);
router.put("/:id", VideoController.bookUpdate);
router.delete("/:id", VideoController.bookDelete);

module.exports = router;