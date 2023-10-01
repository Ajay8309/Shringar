const router = require("express").Router();

const auth = require("./auth");
const cart = require("./cart");


router.use("/auth", auth);
router.use("/cart", cart);
module.exports = router;