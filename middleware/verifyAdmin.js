const {ErrorHandler} = require("../helpers/error");

module.exports = (req, res, next) => {
    const {roles} = req.user;
    if(roles && roles.includes("admin")) {
        req.user = {
            ...req.user, 
            roles,
        };
        console.log("kuch toh hua hai kuch ho rhaa hai:");
        console.log(req.user);
        return next();
    }else {
        throw new ErrorHandler(401, "require Admin role");
    }
};


