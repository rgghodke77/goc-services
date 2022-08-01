const UserModel = require("../models/UserModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");

/**
 * User registration.
 *
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.register = [
	// Validate fields.
	body("firstName").isLength({ min: 1 }).trim().withMessage("First name must be specified.")
		.isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
	body("lastName").isLength({ min: 1 }).trim().withMessage("Last name must be specified.")
		.isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
	body("mobile").isLength({ min: 10 }).trim().withMessage("Mobile number must be 10 characters or greater.")
		.isNumeric().withMessage("Mobile number has non-numeric characters."),
	body("gameId").isLength({ min: 1 }).trim().withMessage("Game must be selected."),
	body("roleId").isLength({ min: 1 }).trim().withMessage("Role must be selected."),
	body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters or greater."),
	(req, res) => {
		try {
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				//hash input password
				
					bcrypt.hash(req.body.password,10,function(err, hash) {
						// generate OTP for confirmation
						let otp = utility.randomNumber(4);
						// Create User object with escaped and trimmed data
						if(!req.body._id){
							var user = new UserModel(
								{
									firstName: req.body.firstName,
									lastName: req.body.lastName,
									password: hash,
									gender:req.body.gender?req.body.gender:'',
									mobile:req.body.mobile,
									gameId:req.body.gameId,
									roleId:req.body.roleId,
								}
							);
							
								// Save user.
								user.save(function (err) {
									if (err) { return apiResponse.ErrorResponse(res, err); }
									let userData = {
										_id: user._id,
										firstName: user.firstName,
										lastName: user.lastName,
										mobile: user.mobile
									};
									return apiResponse.successResponseWithData(res,"Registration Success.", userData);
								});
						} else{
							UserModel.update(
								{_id:req.body._id},
								{
									$set:{
										firstName: req.body.firstName,
										lastName: req.body.lastName,
										password: hash,
										gender:req.body.gender?req.body.gender:'',
										mobile:req.body.mobile,
										gameId:req.body.gameId,
										roleId:req.body.roleId,
										status:req.body.status
									}
								}
							)
							.then((user)=>{                
								if(user !== null){
									return apiResponse.successResponseWithData(res, "Operation success", user);
								}else{
									return apiResponse.successResponseWithData(res, "Operation success", {});
								}
							});
						}
					});
					
					
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
	body("mobile").isLength({ min: 10 }).trim().withMessage("Mobile number must be 10 characters or greater.")
		.isNumeric().withMessage("Mobile number has non-numeric characters."),
	body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified."),
	body("platform").isLength({ min: 1 }).trim().withMessage("Platform must be selected."),
	//sanitizeBody("email").escape(),
	//sanitizeBody("password").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				UserModel
				// .aggregate([

					
				// 	// Join with user_role table
				// 	{
				// 		$lookup:{
				// 			from: "Role", 
				// 			localField: "roleId", 
				// 			foreignField: "_id",
				// 			as: "user_role"
				// 		}
				// 	},
				// 	{   $unwind:"$user_role" },
				
				// 	// define some conditions here 
				// 	{
				// 		$match:{
				// 			$and:[{mobile : req.body.mobile}]
				// 		}
				// 	},
				
				// 	// define which fields are you want to fetch
				// 	{   
				// 		$project:{
				// 			_id : 1,
				// 			firstName : 1,
				// 			lastName : 1,
				// 			mobile : 1,
				// 			password:1,
				// 			role : "$user_role.role",
				// 		} 
				// 	}
				// ])
				 .findOne({mobile : req.body.mobile})
				.then(user => {
					//console.log(user)
					if (user) {
						//Compare given password with db's hash.
						bcrypt.compare(req.body.password,user.password,function (err,same) {
							if(same){
								//Check account confirmation.
									if(user.status) {
										let userData = {
											_id: user._id,
											firstName: user.firstName,
											lastName: user.lastName,
											mobile: user.mobile,
										};
										//Prepare JWT token for authentication
										const jwtPayload = userData;
										const jwtData = {
											expiresIn: process.env.JWT_TIMEOUT_DURATION,
										};
										const secret = process.env.JWT_SECRET;
										//Generated JWT token with Payload and secret.
										userData.token = jwt.sign(jwtPayload, secret, jwtData);
										return apiResponse.successResponseWithData(res,"Login Success.", userData);
									}
								else{
									return apiResponse.unauthorizedResponse(res, "Account is not active. Contact to admin for activate your account");
								}
							}else{
								return apiResponse.unauthorizedResponse(res, "Mobile or Password wrong.");
							}
						});
					}else{
						return apiResponse.unauthorizedResponse(res, "Mobile or Password wrong.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

	exports.getUsers = [
		//verifyUser,
		function (req, res) {
			
			try {
				UserModel.find()
				.then((users)=>{                
					if(users !== null){
						return apiResponse.successResponseWithData(res, "Operation success", users);
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

/**
 * Verify Confirm otp.
 *
 * @param {string}      email
 * @param {string}      otp
 *
 * @returns {Object}
 */
exports.verifyConfirm = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("otp").isLength({ min: 1 }).trim().withMessage("OTP must be specified."),
	//sanitizeBody("email").escape(),
	//sanitizeBody("otp").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				var query = {email : req.body.email};
				UserModel.findOne(query).then(user => {
					if (user) {
						//Check already confirm or not.
						if(!user.isConfirmed){
							//Check account confirmation.
							if(user.confirmOTP == req.body.otp){
								//Update user as confirmed
								UserModel.findOneAndUpdate(query, {
									isConfirmed: 1,
									confirmOTP: null 
								}).catch(err => {
									return apiResponse.ErrorResponse(res, err);
								});
								return apiResponse.successResponse(res,"Account confirmed success.");
							}else{
								return apiResponse.unauthorizedResponse(res, "Otp does not match");
							}
						}else{
							return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
						}
					}else{
						return apiResponse.unauthorizedResponse(res, "Specified email not found.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * Resend Confirm otp.
 *
 * @param {string}      email
 *
 * @returns {Object}
 */
exports.resendConfirmOtp = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	//sanitizeBody("email").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				var query = {email : req.body.email};
				UserModel.findOne(query).then(user => {
					if (user) {
						//Check already confirm or not.
						if(!user.isConfirmed){
							// Generate otp
							let otp = utility.randomNumber(4);
							// Html email body
							let html = "<p>Please Confirm your Account.</p><p>OTP: "+otp+"</p>";
							// Send confirmation email
							mailer.send(
								constants.confirmEmails.from, 
								req.body.email,
								"Confirm Account",
								html
							).then(function(){
								user.isConfirmed = 0;
								user.confirmOTP = otp;
								// Save user.
								user.save(function (err) {
									if (err) { return apiResponse.ErrorResponse(res, err); }
									return apiResponse.successResponse(res,"Confirm otp sent.");
								});
							});
						}else{
							return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
						}
					}else{
						return apiResponse.unauthorizedResponse(res, "Specified email not found.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];