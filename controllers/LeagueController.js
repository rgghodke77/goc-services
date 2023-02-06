const Book = require("../models/BookModel");
const Game = require("../models/GameModel");
const Role = require("../models/RoleModel");
const Team = require("../models/TeamModel");
const Player = require("../models/PlayerModel");
const UserModel = require("../models/UserModel");
const League = require("../models/LeagueModel");
const LeagueTeam = require("../models/LeagueTeamsModel");
const { body, validationResult } = require("express-validator");
var unirest = require("unirest");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const bcrypt = require("bcrypt");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
var verifyUser = require('../middlewares/authentication')
const multer = require('multer');
const path = require('path');
var utility = require('../helpers/utility');

/**
 * Merge league.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.mergeLeague = [
	//verifyUser,
	body("leagueName").isLength({ min: 1 }).trim().withMessage("leagueName must be specified."),
	body("leagueDesc").isLength({ min: 1 }).trim().withMessage("leagueDesc must be specified."),
	body("numberOfPlayers").isLength({ min: 1 }).trim().withMessage("numberOfPlayers must be specified."),
	body("numberOfOvers").isLength({ min: 1 }).trim().withMessage("numberOfOvers must be specified."),
	body("entryFees").isLength({ min: 1 }).trim().withMessage("entryFees must be specified."),
	body("leagueAddress").isLength({ min: 1 }).trim().withMessage("leagueAddress must be specified."),
	body("startDate").isLength({ min: 1 }).trim().withMessage("startDate must be specified."),
	body("endDate").isLength({ min: 1 }).trim().withMessage("endDate must be specified."),
	body("league1Prices").isLength({ min: 1 }).trim().withMessage("leaguePrices must be specified."),
	body("league2Prices").isLength({ min: 1 }).trim().withMessage("league2Prices must be specified."),
	body("leagueRules").isLength({ min: 1 }).trim().withMessage("leagueRules must be specified."),
	function (req, res) {

		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				if (!req.body._id) {
					League.create({
						leagueName: req.body.leagueName,
						leagueDesc: req.body.leagueDesc,
						leaguePoster: req.body.leaguePoster,
						numberOfPlayers: req.body.numberOfPlayers,
						numberOfOvers: req.body.numberOfOvers,
						entryFees: req.body.entryFees,
						leagueAddress: req.body.leagueAddress,
						startDate: req.body.startDate,
						endDate: req.body.endDate,
						league1Prices: req.body.league1Prices,
						league2Prices: req.body.league2Prices,
						leagueMom: req.body.leagueMom,
						leagueMot: req.body.leagueMot,
						leagueRules: req.body.leagueRules,
						gameId: '62fb2b06de96d400169be1e9'
					})
						.then((league) => {
							if (league !== null) {
								return apiResponse.successResponseWithData(res, "Operation success", league);
							} else {
								return apiResponse.successResponseWithData(res, "Operation success", {});
							}
						});
				} else {
					League.update(
						{ _id: req.body._id },
						{
							$set: {
								leagueName: req.body.leagueName,
								leagueDesc: req.body.leagueDesc,
								leaguePoster: req.body.leaguePoster,
								numberOfPlayers: req.body.numberOfPlayers,
								numberOfOvers: req.body.numberOfOvers,
								entryFees: req.body.entryFees,
								leagueAddress: req.body.leagueAddress,
								startDate: req.body.startDate,
								endDate: req.body.endDate,
								league1Prices: req.body.league1Prices,
								league2Prices: req.body.league2Prices,
								leagueMom: req.body.leagueMom,
								leagueMot: req.body.leagueMot,
								leagueRules: req.body.leagueRules,
								// status: req.body.status,
							}
						}
					)
						.then((league) => {
							if (league !== null) {
								return apiResponse.successResponseWithData(res, "Operation success", league);
							} else {
								return apiResponse.successResponseWithData(res, "Operation success", {});
							}
						});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			console.log(err)
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

exports.leagueTeam = [

	body("leagueId").isLength({ min: 1 }).trim().withMessage("leagueId must be specified"),
	body("leagueName").isLength({ min: 1 }).trim().withMessage("leagueName must be specified"),
	body("teamId").isLength({ min: 1 }).trim().withMessage("teamId must be specified"),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error", errors.array());
			}
			else {
				if (!req.body._id) {
					let uniqueLeagueId = await League.findOne({_id: req.body.leagueId})
					if(uniqueLeagueId == null){
						return apiResponse.validationErrorWithData(res, "League doesn't exist", errors.array());

					}
					else{ 

					
					let existingTeamInLeague = await LeagueTeam.findOne({ $and: [{ _id: req.body.leagueId }, { leagueName: req.body.leagueName }] });

					if (existingTeamInLeague == null) {


						LeagueTeam.create({
							teamId: req.body.teamId,
							leagueId: req.body.leagueId,
							leagueName: req.body.leagueName
						}).then((leagueteam) => {
							if (leagueteam !== null) {
								return apiResponse.successResponseWithData(res, "Operation Success", leagueteam)
							}
							else {
								return apiResponse.successResponse(res, "Operation Success", {})
							}
						})

					}

					else{
						return apiResponse.validationErrorWithData(res, "league Name already exists", errors.array());

					}

				}
			}
		
		}
		}
		catch (err) {
			return apiResponse.ErrorResponse(res, err)
		}
	}

];

exports.getLeagues = [
	//verifyUser,
	function (req, res) {

		try {
			if (!req.body._id) {
				League.aggregate([
					// {$match : {_id : teamId}},
					{
						$project: {
							leagueName: 1,
							leagueDesc: 1,
							leaguePoster: 1,
							numberOfPlayers: 1,
							numberOfOvers: 1,
							entryFees: 1,
							leagueAddress: 1,
							startDate: 1,
							endDate: 1,
							leaguePrices: 1,
							leagueRules: 1,
							status: 1,

						}
					}
				]).then((leagueInfo) => {
					if (leagueInfo !== null) {
						return apiResponse.successResponseWithData(res, "Operation success", leagueInfo);
					}
				})
			} else {
				let leagueId = utility.generateMongoDbObjectId(req.body._id);

				Team.aggregate([
					{ $match: { _id: leagueId } },
					{
						$project: {
							leagueName: 1,
							leagueDesc: 1,
							leaguePoster: 1,
							numberOfPlayers: 1,
							numberOfOvers: 1,
							entryFees: 1,
							leagueAddress: 1,
							startDate: 1,
							endDate: 1,
							leaguePrices: 1,
							leagueRules: 1,
							status: 1,

						}
					}
				]).then((leagueInfo) => {
					if (leagueInfo !== null) {
						return apiResponse.successResponseWithData(res, "Operation success", leagueInfo);
					}
				})
			}
		} catch (err) {
			//throw error in json response with status 500. 
			console.log(err)
			return apiResponse.ErrorResponse(res, err);
		}
	}
];