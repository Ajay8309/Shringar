const router = require("express").Router();

const auth = require("./auth");
const cart = require("./cart");
const user = require("./user");
const product = require("./product");


router.use("/auth", auth);
router.use("/cart", cart);
router.use("/user", user);
router.use("/products", product);

module.exports = router;