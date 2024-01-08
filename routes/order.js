const router = require("express").Router();
const {
    getAllOrders, 
    getOrder, 
    createOrder
} = require("../controllers/order.controller");

const verifyToken = require("../middleware/verifyToken");

router.route("/create").post(verifyToken, createOrder);

router.route("/").get( getAllOrders);

router.route("/:id").get(verifyToken, getOrder);

module.exports = router;