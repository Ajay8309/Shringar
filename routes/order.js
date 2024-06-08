const router = require("express").Router();
const {
    getAllOrders, 
    getOrder, 
    createOrder, 
    getAll
} = require("../controllers/order.controller");

const verifyToken = require("../middleware/verifyToken");

// want endpoint for all the orders to admin

router.route("/getAll").get(verifyToken, getAll);

router.route("/create").post(verifyToken, createOrder);

router.route("/").get(verifyToken, getAllOrders);

router.route("/:id").get(verifyToken, getOrder);

module.exports = router;