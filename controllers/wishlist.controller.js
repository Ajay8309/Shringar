
const wishlistService = require("../services/wishlist.service");

const getWishlist = async (req, res) => {
    const user_id = req.user.user_id;
    const wishlist = await wishlistService.getWishlist(user_id);
    res.status(200).json({ items: wishlist });
};

const addItem = async (req, res) => {
    const { wishlist_id, product_id } = req.body; // Assuming these values are in the request body
    const wishlist = await wishlistService.addItemToWishlist({ wishlist_id, product_id });
    res.status(200).json({ data: wishlist });
};

const deleteItem = async (req, res) => {
    const { wishlist_id, product_id } = req.body; // Assuming these values are in the request body
    const wishlist = await wishlistService.deleteItemFromWishlist({ wishlist_id, product_id });
    res.status(200).json(wishlist);
};

const addWishlistItemToCart = async (req, res) => {
    const { product_id, user_id } = req.body;
    const wishlist = await wishlistService.addWishlistItemToCart({ product_id, user_id });
    res.status(200).json(wishlist);
};

module.exports = {
    getWishlist,
    addItem,
    deleteItem,
    addWishlistItemToCart,
};
