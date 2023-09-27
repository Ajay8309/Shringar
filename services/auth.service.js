const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    setTokenStatusDb,
    createResetTokenDb, 
    deleteResetTokenDb, 
    isValidTokenDb
} = require("../db/auth.db");

const validateUser = require("../helpers/vaidateUser");
const {ErrorHandler}= require("../helpers/error");
const {
    changeUserPassword,
    getUserByEmailDb,
    getUserByUsernameDb,
    createUserDb,
    // createUserGoogleDb
} = require("../db/user.db");

const {createCartDb} = require("../db/cart.db");
const {createWishlistDb} = require("../db/wishlist.db");
const mail = require("./mail.service");

const {OAuth2Client} = require("google-auth-library");
const crypto = require("crypto");
const moment = require("moment");
const {logger} = require("../utils/logger");
const { error } = require("console");
let curDate = moment().format();

class AuthService {

    async signUp(user) {
        try {
            const {password, email, fullname, username} = user;

            if(!email || !password || !fullname || !username) {
                throw new ErrorHandler(401, " all fields required");
            }

            if(validateUser(email, password)) {
                const salt = await bcrypt.genSalt();
                const hashedPassword = await bcrypt.hash(password, salt); 

                const userByEmail = await getUserByEmailDb(email);
                const userByUsername = await getUserByUsernameDb(username);

                if(userByEmail){
                    throw new ErrorHandler(401, "email already taken:");
                }

                if(userByUsername) {
                    throw new ErrorHandler(401, "username already taken:");
                }

                // create new user
                const newUser = await createUserDb({
                    ...user,
                    password:hashedPassword,
                });

                const {id: cart_id} = await createCartDb(newUser.user_id);

                const token = await this.signToken({
                    id: newUser.user_id,
                    roles: newUser.roles,
                    cart_id,
                });
                
                const refreshToken = await this.signRefreshToken({
                    id: newUser.user_id,
                    roles: newUser.roles,
                    cart_id,
                });

                return {
                    token,
                    refreshToken,
                    cart_id,
                }


            }else{
                throw new ErrorHandler(401, "Input validation error");
            }
        } catch (error) {
            throw new ErrorHandler(error.statusCode, error.message);
        }
    }



    async login(email, password) {
        try {
            if(!validateUser(email, password)){
                throw new ErrorHandler(403, "Invalid login");
            }

            const user = await getUserByEmailDb(email);

            if(!user){
                throw new ErrorHandler(403, "Email or Password incorrect");
            }

            if(user.google_id && !user.password) {
                throw new ErrorHandler(403, "Login with Google");
            }

            const  {
                password:dbPassword,
                user_id,
                roles,
                cart_id,
                fullname,
                username, 
            } = user;

            const isCorrectPassword = await bcrypt.compare(password, dbPassword);

            if(!isCorrectPassword){
                throw new ErrorHandler(403, "Email or password incorrect");
            }

            const token = await this.signToken({id:user_id, roles, cart_id});
            const refreshToken = await this.signRefreshToken({
                id:user_id,
                roles,
                cart_id,
            });
            return {
                token,
                refreshToken,
                user:{
                    user_id,
                    fullname,
                    username,
                }
            };
        } catch (error) {
            throw new ErrorHandler(error.statusCode, error.message);
        }
    }

    // thodaa idher udher dekh kr sikhna pdegaa

    async googleLogin(code) {

    }

    // genrate refresh token 
    async generateRefreshToken(data) {
        const payload = await this.verifyRefreshToken(data);

        const token = await this.signToken(payload);
        const refreshToken = await this.signRefreshToken(payload);

        return {
            token,
            refreshToken,
        };

    }

    async forgotPassword(email) {
        const user = await getUserByEmailDb(email);

        if(!user) {
            throw new ErrorHandler(403, "email not found");
        }else{
            try {
                await setTokenStatusDb(email);

                // create a random reset token

                var fpSalt = crypto.randomBytes(64).toString("base64");

                // token expiry

                var expireDate = moment().add(1, "h").format();

                await createResetTokenDb({email, expireDate, fpSalt});

                await mail.forgotPasswordMail(fpSalt, email);
            } catch (error) {
                throw new ErrorHandler(error.statusCode, error.message);
            }
        }
    }

    async verifyResetToken (token, email) {
        try {
            await deleteResetTokenDb(curDate);
            const isValidToken = await isValidTokenDb({
                token, email, curDate,
            });
            return isValidToken;

        } catch (error) {
            throw new ErrorHandler(error.statusCode, error.message);
        }
    }






    async signToken(data) {
        try {
            return jwt.sign(data, process.env.SECRET, {expiresIn:"60s"});
        } catch (error) {
            logger.error(error);
            throw new ErrorHandler(501, "An error occurred");
        }
    }

    async signRefreshToken(data) {
        try {
            return jwt.sign(data, process.env.REFRESH_SECRET, {expiresIn:"1h"});
        } catch (error) {
            logger.error(error);
            throw new ErrorHandler(500, error.message);
        }
    }

    async verifyRefreshToken(token) {
        try {
            const payload = jwt.verify(data, process.env.REFRESH_SECRET);
            return {
                id : payload.id,
                roles : payload.roles,
                cart_id : payload.cart_id,
            };
        } catch (error) {
            logger.error(error);
            throw new ErrorHandler(500, error.message);
        }
    }

}