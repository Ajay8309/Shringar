const {ErrorHandler} = require("../helpers/error");

const unKnownEndpoint = (Request, Response) => {
     throw new ErrorHandler(401, "unknown endpoint");
}

module.exports = unKnownEndpoint;