require("dotenv").config({path:__dirname + "/.env"});
const http = require("http");
const app = require("./app");
const {logger} = require("./utils/logger");

const server = http.createServer(app);

const PORT = 9001;

server.listen(PORT, () => logger.info(`Server running at port: ${PORT}`));