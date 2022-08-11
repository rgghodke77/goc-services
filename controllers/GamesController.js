 const Book = require("../models/BookModel");
const Game = require("../models/GameModel");
const Role = require("../models/RoleModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
var verifyUser = require('../middlewares/authentication')

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
	function (req, res) {
		
		try {
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
		} catch (err) {
			//throw error in json response with status 500. 
            console.log(err)
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
exports.mergeRole = [
    //verifyUser,
	function (req, res) {
		
		try {
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
            Role.find()
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