const router = require("express").Router();
const {
  getWishlist,
  addItem, 
  deleteItem, 
  addWishlistItemToCart, 
} = require("../controllers/wishlist.controller");
const { verifyResetToken } = require("../services/auth.service");

router.use(verifyResetToken);

router.route("/").get(getWishlist);

router.route("/add").post(addItem);

router.route("/delete").delete(deleteItem);

router.route("/to-cart").post(addWishlistItemToCart);

module.exports = router;