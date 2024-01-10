const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    setTokenStatusDb,
    createResetTokenDb, 
    deleteResetTokenDb, 
    isValidTokenDb,
} = require("../db/auth.db"); 

const validateUser = require("../helpers/validateUser");
const {ErrorHandler}= require("../helpers/error");
const {
    changeUserPasswordDb,
    getUserByEmailDb,
    getUserByUsernameDb,
    createUserDb,
    // createUserGoogleDb
} = require("../db/user.db");

const {createCartDb} = require("../db/cart.db");
const {createWishlistDb} = require("../db/wishlist.db");
const mail = require("./mail.service");

// const {OAuth2Client} = require("google-auth-library");
const crypto = require("crypto");
const moment = require("moment");
const {logger} = require("../utils/logger");
// const { error } = require("console");
let curDate = moment().format();

class AuthService {

    async signUp(user) {
        try {
            // destructure kiya hai user kee data ko ....controller kee code ko dekhne pr
            // thodaa idea lagg jayegaa
            const {email, password, fullname, username} = user;
            // agar kuch missing hai toh error denaa hai
          
            if(!email || !password || !fullname || !username ) {
                throw new ErrorHandler(401, " all fields required");
            }

            if(validateUser(email, password)) {
                // salt create kiyaa jisee hum humare password kee saath mixup krenge and 
                // kuch secure hashPassword create krenge 
                const salt = await bcrypt.genSalt();
                const hashedPassword = await bcrypt.hash(password, salt); 
                
                //  email and username paas krke check kiyaa hai ki koi iss 
                // email yaa username see already user exist krtaa hai kyaa
                // console.log('Username:', username);
                // console.log('Email:', email);

                

                const userByEmail = await getUserByEmailDb(email);
                const userByUsername = await getUserByUsernameDb(username);

                // agr exist krtaa hai toh below error diyaa

                if(userByEmail){
                    throw new ErrorHandler(401, "email already taken:");
                }

                if(userByUsername) {
                    throw new ErrorHandler(401, "username already taken:");
                }
                
                // agr exist nahi krtaa toh naya user create kiyaa 
                // and jo password create kiyaa thaa vo and baaki saari details as it is daaldi
                // create new user
                const newUser = await createUserDb({
                    ...user,
                    password:hashedPassword,
                });

                // create cart Db
                // nayee user kee liyee naya cart db bnaya
                const {id: cart_id} = await createCartDb(newUser.user_id);

                // create wishlist Db
                // nayee user kee liye naya wishlist db bnaya
                const {id: wishlist_id} = await createWishlistDb(newUser.user_id);

                // yee below tokens humnee jwt see bnayee hai
                
                const token = await this.signToken({
                    id: newUser.user_id,
                    roles: newUser.roles,
                    cart_id,
                    wishlist_id,
                });
                
                const refreshToken = await this.signRefreshToken({
                    id: newUser.user_id,
                    roles: newUser.roles,
                    cart_id,
                    wishlist_id,
                });

                return {
                    token,
                    refreshToken,
                    user : {
                        user_id : newUser.user_id,
                        fullname : newUser.fullname,
                        username : newUser.username,
                        email : newUser.email,
                        wishlist_id: newUser.wishlist_id,
                    } 
                }


            }else{
                throw new ErrorHandler(401, "Input validation error");
            }
        } catch (error) {
            throw new ErrorHandler(error.statusCode, error.message); // this is line 117
        }
    }



    async login(email, password) {
        try {
        //   console.log("Received login request with email:", email);
          if (!validateUser(email, password)) {
            throw new ErrorHandler(403, "Invalid login");
          }
    
          const user = await getUserByEmailDb(email);
          
          if (!user) {
              throw new ErrorHandler(403, "Email or password incorrect.");
            }
            
            if (user.google_id && !user.password) {
                throw new ErrorHandler(403, "Login in with Google");
            }
            
            const {
                password: dbPassword,
                user_id,
                roles,
                cart_id,
                wishlist_id,
                fullname,
                username,
            } = user;
            // console.log(user);
          const isCorrectPassword = await bcrypt.compare(password, dbPassword);
    
          if (!isCorrectPassword) {
            throw new ErrorHandler(403, "Email or password incorrect.");
          }
    
          const token = await this.signToken({ id: user_id, roles, cart_id, wishlist_id });
          const refreshToken = await this.signRefreshToken({
            id: user_id,
            roles,
            cart_id,
            wishlist_id,
          });
    
          console.log("Login successful. Sending token.");
    
          return {
            token,
            refreshToken,
            user: {
              user_id,
              fullname,
              username,
            },
          };
        } catch (error) {
          console.error("Error during login:", error);
          throw new ErrorHandler(error.statusCode, error.message);
        }
      }
    // thodaa idher udher dekh kr sikhna pdegaa

    // async googleLogin(code) {

    // }

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

    if (user) {
      try {
        await setTokenStatusDb(email);

        //Create a random reset token
        var fpSalt = crypto.randomBytes(64).toString("base64");

        //token expires after one hour
        var expireDate = moment().add(1, "h").format();

           await createResetTokenDb({ email, expireDate, fpSalt });

        await mail.forgotPasswordMail(fpSalt, email);
      } catch (error) {p2
        throw new ErrorHandler(error.statusCode, error.message);
      }
    } else {
      throw new ErrorHandler(400, "Email not found");
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
    
    
    async resetPassword (password, password2, token, email) {
        const isValidPassword =  typeof password === "string" && password.trim().length >= 6;

        if(password != password2){
            throw new ErrorHandler(400, "password does not match:");
        }

        if(!isValidPassword){
            throw new ErrorHandler(400, "password length must be atleast 6 charcters");
        }

        try {
            const isTokenValid = await isValidTokenDb({
                token,
                email,
                curDate,
            });

            if(!isTokenValid) {
                throw new ErrorHandler(400, "token not found try again");
            }


            await setTokenStatusDb(email);

            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);

            await changeUserPasswordDb(hashedPassword, email);
            await mail.resetPasswordMail(email);
        } catch (error) {
            throw new ErrorHandler(error.statusCode, error.message);
        }
    }


    // verifyGoogleId token will come here which is required for google login





    async signToken(data) {
        try {
            return jwt.sign(data, process.env.SECRET, {expiresIn:"1h"});
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
            const payload = jwt.verify(token, process.env.REFRESH_SECRET);
            return {
                id : payload.id,
                roles : payload.roles,
                cart_id : payload.cart_id,
                wishlist_id: payload.wishlist_id,
            };
        } catch (error) {
            logger.error(error);
            throw new ErrorHandler(500, error.message);
        }
    }

}

module.exports = new AuthService();