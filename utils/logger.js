const pino = require("pino");

const logger = pino({
    level:process.env.NODE_ENV === "production" ? "info" : "debug",
    preetyPrint:process.env.NODE_ENV !== "production",
});

module.exports.logger = logger;