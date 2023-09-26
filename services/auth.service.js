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
// const mail = require("./mail.service");

const {OAuth2Client} = require("google-auth-library");
const crypto = require("crypto");
const moment = require("moment");
const {logger} = require("../utils/logger");