const jwt = require("jsonwebtoken");
const apiResponse = require("../helpers/apiResponse");
const verifyUser = (req,res,next)=>{
    const token = (req.headers.authorization).split(" ");
     try{
        const verifyUser = jwt.verify(token[1], process.env.JWT_SECRET);
        
        if(verifyUser){
            next();
        }
    } catch(err) {
        return apiResponse.unauthorizedResponse(res, "Unauthorized user");
    }

 }

 module.exports = verifyUser;