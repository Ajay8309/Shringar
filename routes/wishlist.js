const router = require("express").Router();
const {
  getWishlist,
  addItem, 
  deleteItem, 
  addWishlistItemToCart, 
  isInWishlist
  // createWishlist
} = require("../controllers/wishlist.controller");
const verifyToken = require("../middleware/verifyToken");


// router.route("/:id").post(createWishlist);

router.use(verifyToken);

router.route("/").get(getWishlist);

router.route("/add").post(addItem);

router.route("/delete").delete(deleteItem);

router.route("/check").get(isInWishlist);

router.route("/to-cart").post(addWishlistItemToCart);


module.exports = router;