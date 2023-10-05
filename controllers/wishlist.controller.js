
const wishlistService = require("../services/wishlist.service");
const cartService = require("../services/cart.service");

const createWishlist = async (req, res) => {
    const user_id = req.user.user_id;
    const wishlist = await wishlistService.createWishlist(user_id);
    res.status(200).json(wishlist);
};

const getWishlist = async (req, res) => {
    const { wishlist_id } = req.body;
    try {
        const wishlist = await wishlistService.getWishlist(wishlist_id);
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
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
    const cart_id = req.user.cart_id;

    const cart = await cartService.addItem({...req.body, cart_id});
    res.status(200).json({data : cart});
};

module.exports = {
    getWishlist,
    addItem,
    deleteItem,
    addWishlistItemToCart,
    createWishlist,
};
