var express = require("express");
var authRouter = require("./auth");
var gameRouter = require("./games");

var app = express();


app.use("/auth/", authRouter);
app.use("/games/", gameRouter);

module.exports = app;