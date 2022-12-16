var express = require("express");
var authRouter = require("./auth");
var gameRouter = require("./games");
var leagueRouter = require('./league');
var app = express();


app.use("/auth/", authRouter);
app.use("/games/", gameRouter);
app.use("/leagues/", leagueRouter);

module.exports = app;