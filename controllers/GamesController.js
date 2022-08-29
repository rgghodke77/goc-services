 const Book = require("../models/BookModel");
const Game = require("../models/GameModel");
const Role = require("../models/RoleModel");
const Team = require("../models/TeamModel");
const Player = require("../models/PlayerModel");
const UserModel = require("../models/UserModel");
const { body,validationResult } = require("express-validator");
var unirest = require("unirest");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");

const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
var verifyUser = require('../middlewares/authentication')
const multer = require('multer');
const path = require('path');
var utility = require('../helpers/utility')
// Book Schema
function BookData(data) {
	this.id = data._id;
	this.title= data.title;
	this.description = data.description;
	this.isbn = data.isbn;
	this.createdAt = data.createdAt;
}

/**
 * Book List.
 * 
 * @returns {Object}
 */
exports.gamesList = [
	//verifyUser,
	function (req, res) {
		try {
			Game.find().then((games)=>{
				if(games.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", games);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Book Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.mergeGame = [
    //verifyUser,
	body("gameName").isLength({ min: 1 }).trim().withMessage("gameName must be specified.")
		.isAlphanumeric().withMessage("gameName has non-alphanumeric characters."),
	function (req, res) {
		
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				if(!req.body._id){
					Game.create({gameName: req.body.gameName})
						.then((game)=>{                
							if(game !== null){
								return apiResponse.successResponseWithData(res, "Operation success", game);
							}else{
								return apiResponse.successResponseWithData(res, "Operation success", {});
							}
						});
				} else{
					Game.update(
						{_id:req.body._id},
						{
							$set:{
								gameName:req.body.gameName,
								status:req.body.status
							}
						}
					)
					.then((game)=>{                
						if(game !== null){
							return apiResponse.successResponseWithData(res, "Operation success", game);
						}else{
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
exports.mergeRole = [
    //verifyUser,
	body("role").isLength({ min: 1 }).trim().withMessage("Role must be specified.")
		.isAlphanumeric().withMessage("Role has non-alphanumeric characters."),
	function (req, res) {
		
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
			if(!req.body._id){
					Role.create({role: req.body.role})
					.then((role)=>{                
						if(role !== null){
							return apiResponse.successResponseWithData(res, "Operation success", role);
						}else{
							return apiResponse.successResponseWithData(res, "Operation success", {});
						}
					});
				} else{
					Role.update(
						{_id:req.body._id},
						{$set:{
							role:req.body.role,
							status:req.body.status
						}}
					)
					.then((role)=>{                
						if(role !== null){
							return apiResponse.successResponseWithData(res, "Operation success", role);
						}else{
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

/** Create Modify team */
exports.mergeTeam = [
    //verifyUser,
	body("teamName").isLength({ min: 1 }).trim().withMessage("teamName must be specified."),
	body("gameId").isLength({ min: 1 }).trim().withMessage("gameId must be specified."),
	body("createdBy").isLength({ min: 1 }).trim().withMessage("createdBy must be specified."),
	body("players").isArray().withMessage("Players must be array."),
	function (req, res) {
		
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
			if(!req.body._id){
				Team.create({
					teamName: req.body.teamName,
					teamLogo: req.body.teamLogo,
					gameId: req.body.gameId,
					createdBy: req.body.createdBy,
					
				})
					.then((team)=>{                
						if(team !== null){
							// return apiResponse.successResponseWithData(res, "Operation success", team);
							UserModel.findOne({_id:req.body.createdBy}).then((user)=>{
								if(user !== null){
									Player.create(
										{
											playerName:user.firstName+" "+user.lastName,
											playerRole:'',
											teamId:team._id,
											userId:req.body.createdBy,
											mobile:user.mobile,
											captain:1,
											viceCaptain:0,

										}
									).then((player)=>{
										if(player !== null){
											let teamId = team._id;
											Team.aggregate([
												{$match : {_id : utility.generateMongoDbObjectId(teamId)}},
												{ 
													$lookup:
													{
													   from: "players",
													   localField: "_id",
													   foreignField: "teamId",
													   as: "players",
													   
													}
												},
												{ $project : { 
													"players.captain" : 1,
													"players.viceCaptain" : 1,
													"players.status" : 1,
													"players.playerName" : 1,
													"players.playerRole" : 1,
													"players.mobile" : 1,
													"players._id":1,
													teamName:1,
													teamLogo:1

												 } }
											]).then((teaminfo)=>{
												if(teaminfo !== null){
													return apiResponse.successResponseWithData(res, "Operation success", {
														status:true,
														data:teaminfo,
														errorData:[]
													});
												}
											})
										}
									})
								}
							})

						}else{
							return apiResponse.successResponseWithData(res, "Operation success", {});
						}
					});
				} else {
					Team.update(
						{_id:utility.generateMongoDbObjectId(req.body._id)},
						{$set:{
							teamName: req.body.teamName,
							teamLogo: req.body.teamLogo,
							gameId: req.body.gameId,
							status:req.body.status
						}}
					)
					.then(async(team)=>{                
						if(team !== null){
							if(req.body.status !== 0){
								let players = req.body.players;
								let playerError = [];
									await players.map(async(item,i)=>{
										
											let findExistingPlayer = await Player.findOne({$and:[{mobile:item.mobile},{teamId:{$ne:utility.generateMongoDbObjectId(req.body._id)}}] });
											

											if(findExistingPlayer !== null){
												item.errorMessage = "Player is already register with other team with this mobile number"
												playerError.push(item);
												console.log(playerError)
											} else {
												let playerInfo = await Player.findOne({mobile:item.mobile});
												if(!item._id && playerInfo === null){
													let userInfo = await UserModel.findOne({mobile:item.mobile});
													if(userInfo !== null){
														console.log(userInfo)
														await Player.create({
															playerName:item.playerName,
															playerRole:item.playerRole,
															captain:item.captain,
															viceCaptain:item.viceCaptain,
															status:item.status,
															mobile:item.mobile,
															teamId:utility.generateMongoDbObjectId(req.body._id),
															userId:utility.generateMongoDbObjectId(userInfo._id),
														})
													}
												} else {
													await Player.update({_id:utility.generateMongoDbObjectId(item._id?item._id:playerInfo._id)},
													{
														$set:{
															playerName:item.playerName,
															playerRole:item.playerRole,
															captain:item.captain,
															viceCaptain:item.viceCaptain,
															status:item.status,
															mobile:item.mobile,
														}
													}
													)
												}
											}
											if(i === (players.length-1)){
											let teamId = req.body._id;
											Team.aggregate([
												{$match : {_id : utility.generateMongoDbObjectId(teamId)}},
												{ 
													$lookup:
													{
													   from: "players",
													   localField: "_id",
													   foreignField: "teamId",
													   as: "players",
													   
													}
												},
												{ $project : { 
													"players.captain" : 1,
													"players.viceCaptain" : 1,
													"players.status" : 1,
													"players.playerName" : 1,
													"players.playerRole" : 1,
													"players.mobile" : 1,
													"players._id":1,
													teamName:1,
													teamLogo:1

												 } }
											]).then((teaminfo)=>{
												if(teaminfo !== null){
													return apiResponse.successResponseWithData(res, "Operation success", {
														status:true,
														data:teaminfo,
														errorData:playerError
													});
												}
											})
												// return apiResponse.successResponseWithData(res, "Operation success", {
												// 	status:true,
												// 	errorData:playerError
												// });
											}
										
								 	})
								
							}
							//return apiResponse.successResponseWithData(res, "Operation success", team);
						}else{
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
exports.getTeams = [
    //verifyUser,
    function (req, res) {
		
		try {
			if(!req.body._id){
					Team.aggregate([
						// {$match : {_id : teamId}},
						{ 
							$lookup:
							{
							from: "players",
							localField: "_id",
							foreignField: "teamId",
							as: "players",
							
							}
						},
						{ $project : { 
							"players.captain" : 1,
							"players.viceCaptain" : 1,
							"players.status" : 1,
							"players.playerName" : 1,
							"players.playerRole" : 1,
							"players.mobile" : 1,
							"players._id":1,
							teamName:1,
							teamLogo:1

						} }
					]).then((teaminfo)=>{
						if(teaminfo !== null){
							return apiResponse.successResponseWithData(res, "Operation success", teaminfo);
						}
					})
			} else {
				let teamId = utility.generateMongoDbObjectId(req.body._id);
				
				Team.aggregate([
				   {$match : {_id : teamId}},
				   { 
						$lookup:
						{
						from: "players",
						localField: "_id",
						foreignField: "teamId",
						as: "players",
						
						}
					},
					{ $project : { 
						"players.captain" : 1,
						"players.viceCaptain" : 1,
						"players.status" : 1,
						"players.playerName" : 1,
						"players.playerRole" : 1,
						"players.mobile" : 1,
						"players._id":1,
						teamName:1,
						teamLogo:1

					} },
				]).then((teaminfo)=>{
					if(teaminfo !== null){
						return apiResponse.successResponseWithData(res, "Operation success", teaminfo);
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
exports.getUserForCreateTeam = [
    //verifyUser,
    function (req, res) {
		
		try {
						UserModel.aggregate([
						{ 
							$lookup:
							{
							from: "players",
							'let': {
								userId: '$_id'
							   },
							pipeline: [
								{
								 $match: {
								  $expr: {
								   $eq: [
									'$userId',
									'$$userId'
								   ]
								  }
								 }
								}
							],
							as: "players",
							
							}
						},
						{ $project : { 
							firstName:1,
							lastName:1,
							_id:1,
							"players.playerName":1

						} }
					]).then((users)=>{
						if(users !== null){
							return apiResponse.successResponseWithData(res, "Operation success", users.filter(dt=>dt.players.length === 0));
						}
					})
			
		} catch (err) {
			//throw error in json response with status 500. 
            console.log(err)
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
exports.getRoles = [
    //verifyUser,
    function (req, res) {
		
		try {
            Role.find({ role: { $ne: 'admin' }})
            .then((role)=>{                
				if(role !== null){
					return apiResponse.successResponseWithData(res, "Operation success", role);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
            console.log(err)
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/* delete team **/
exports.deleteTeam = [
    //verifyUser,
	body("teamId").isLength({ min: 1 }).trim().withMessage("teamId must be specified.")
		.isAlphanumeric().withMessage("teamId has non-alphanumeric characters."),
    (req, res)=> {
		
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
            Team.deleteOne({ _id: { $eq: utility.generateMongoDbObjectId(req.body.teamId) }})
            .then(async(deleteObject)=>{                
				if(deleteObject !== null){
					let deletePlayer = await Player.deleteMany({teamId:utility.generateMongoDbObjectId(req.body.teamId)});
					if(deletePlayer !== null){
						return apiResponse.successResponseWithData(res, "Operation success", deletePlayer);
					} else {
						return apiResponse.successResponseWithData(res, "Operation success", deleteObject);
					}
					
				} else{
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		}
		} catch (err) {
			//throw error in json response with status 500. 
            console.log(err)
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
/* delete player **/
exports.deletePlayer = [
    //verifyUser,
	body("playerId").isLength({ min: 1 }).trim().withMessage("playerId must be specified."),
    function (req, res) {
		
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
           Player.deleteOne({_id:{$eq:utility.generateMongoDbObjectId(req.body.playerId)}})
            .then(async(deleteObject)=>{                
				if(deleteObject !== null){
						return apiResponse.successResponseWithData(res, "Operation success", deleteObject);
					} else {
						return apiResponse.successResponseWithData(res, "Operation success", {});
					}
			});
		}
		} catch (err) {
			//throw error in json response with status 500. 
            console.log(err)
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
/* wildSearchPlayers **/
exports.wildSearchPlayers = [
    //verifyUser,
	body("searchText").isLength({ min: 1 }).trim().withMessage("searchText must be specified."),
    function (req, res) {
		
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				UserModel.aggregate([

					// Join with players table
					{
						$lookup:{
							from: "players",       // other table name
							localField: "_id",   // name of users table field
							foreignField: "userId", // name of userinfo table field
							as: "players"         // alias for userinfo table
						},
						
					},
					
					{
						$match:{
							$or:[{firstName:  {"$regex": req.body.searchText, "$options": "i"}},{lastName:  {"$regex": req.body.searchText, "$options": "i"}}]
						}
					},
				
					// define which fields are you want to fetch
					{   
						$project:{
							_id : 1,
							firstName : 1,
							lastName : 1,
							mobile : 1,
							"players._id" : 1,
							"players.playerName" : 1,
							"players.teamId" : 1,
							// team : "$team_info.teamName",
						} 
					}
				])
				.then(async(wildSearchPlayers)=>{            
				if(wildSearchPlayers !== null){
						return apiResponse.successResponseWithData(res, "Operation success", wildSearchPlayers);
					} else {
						return apiResponse.successResponseWithData(res, "Operation success", {});
					}
			});
		}
		} catch (err) {
			//throw error in json response with status 500. 
            console.log(err)
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
/* forgetPasswordOtp **/
exports.forgetPasswordOtp = [
    //verifyUser,
	body("mobile").isLength({ min: 10 }).trim().withMessage("Mobile number must be 10 characters or greater.")
		.isNumeric().withMessage("Mobile number has non-numeric characters."),
     async(req, res) => {
		
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				let userInfo = await UserModel.findOne({mobile:parseInt(req.body.mobile)});
				if(userInfo != null){
					const otp = Math.floor(1000 + Math.random() * 9000);
					UserModel.updateOne({_id:userInfo._id},{
						$set:{
							otp:otp
						}
					}).then((updateUser)=>{
						if(updateUser != null){
							var req1 = unirest("POST", process.env.FAST_SMS_API_URL);

							req1.headers({
							  "authorization": process.env.FAST_SMS_API_KEY
							});
							
							req1.form({
							  "variables_values": otp,
							  "route": "otp",
							  "numbers": userInfo.mobile,
							});
							
							req1.end(function (res1) {
							  if (res.error) throw new Error(res.error);
							
							  console.log(res1.body);
							  return apiResponse.successResponseWithData(res, "Otp is sent on your register mobile number", {validUser:true,otpSent:true,otp:otp});
							});
							
						}
					})
					
				} else {
					return apiResponse.successResponseWithData(res, "User is not exist please signup", {validUser:false,otpSent:false,otp:''});
				}
				

		}
		} catch (err) {
			//throw error in json response with status 500. 
            console.log(err)
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/** Upload Images */

const imageStorage = multer.diskStorage({
    // Destination to store image     
    destination: 'assets/images/userUploads', 
      filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() 
             + path.extname(file.originalname))
            // file.fieldname is name of the field (image)
            // path.extname get the uploaded file extension
    }
});
const imageUpload = multer({
	storage: imageStorage,
	limits: {
	  fileSize: 1000000 // 1000000 Bytes = 1 MB
	},
	fileFilter(req, file, cb) {
	  if (!file.originalname.match(/\.(png|jpg)$/)) { 
		 // upload only png and jpg format
		 return cb(new Error('Please upload a Image'))
	   }
	 cb(undefined, true)
  }
}) 
exports.uploadImage = [
	//verifyUser,
	imageUpload.single('image'),
	function (req, res) {
		
		try {
			//res.send(req.file)
			return apiResponse.successResponseWithData(res, "Operation success", req.file);
		} catch (err) {
			//throw error in json response with status 500. 
            console.log(err)
			return apiResponse.ErrorResponse(res, err);
		}
	}
]

/**
 * Book store.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.bookStore = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Book.findOne({isbn : value,user: req.user._id}).then(book => {
			if (book) {
				return Promise.reject("Book already exist with this ISBN no.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var book = new Book(
				{ title: req.body.title,
					user: req.user,
					description: req.body.description,
					isbn: req.body.isbn
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save book.
				book.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let bookData = new BookData(book);
					return apiResponse.successResponseWithData(res,"Book add Success.", bookData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Book update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.bookUpdate = [
	//auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Book.findOne({isbn : value,user: req.user._id, _id: { "$ne": req.params.id }}).then(book => {
			if (book) {
				return Promise.reject("Book already exist with this ISBN no.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var book = new Book(
				{ title: req.body.title,
					description: req.body.description,
					isbn: req.body.isbn,
					_id:req.params.id
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Book.findById(req.params.id, function (err, foundBook) {
						if(foundBook === null){
							return apiResponse.notFoundResponse(res,"Book not exists with this id");
						}else{
							//Check authorized user
							if(foundBook.user.toString() !== req.user._id){
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							}else{
								//update book.
								Book.findByIdAndUpdate(req.params.id, book, {},function (err) {
									if (err) { 
										return apiResponse.ErrorResponse(res, err); 
									}else{
										let bookData = new BookData(book);
										return apiResponse.successResponseWithData(res,"Book update Success.", bookData);
									}
								});
							}
						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Book Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.bookDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Book.findById(req.params.id, function (err, foundBook) {
				if(foundBook === null){
					return apiResponse.notFoundResponse(res,"Book not exists with this id");
				}else{
					//Check authorized user
					if(foundBook.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						//delete book.
						Book.findByIdAndRemove(req.params.id,function (err) {
							if (err) { 
								return apiResponse.ErrorResponse(res, err); 
							}else{
								return apiResponse.successResponse(res,"Book delete Success.");
							}
						});
					}
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];