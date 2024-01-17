
const wishlistService = require("../services/wishlist.service");
const cartService = require("../services/cart.service");

const createWishlist = async (req, res) => {
    const user_id = req.user.user_id;
    const wishlist = await wishlistService.createWishlist(user_id);
    res.status(200).json(wishlist);
};

const getWishlist = async (req, res) => {
    const  wishlist_id  = req.user.wishlist_id;
    // const {wishlist_id} = req.body;
    // console.log("Inside get wishlist");
    // console.log(req.user);
    try {
        const wishlist = await wishlistService.getWishlist(wishlist_id); 
        res.status(200).json({items:wishlist});
       
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

// const getCart = async (req, res) => {
//     const userId = req.user.userId;

//     const cart = await cartService.getCart(userId);
//     res.json({items: cart});
// };

const addItem = async (req, res) => {
    const wishlist_id = req.user.wishlist_id;
    const cart_id = req.user.cart_id;
    const { product_id } = req.body; 
    // console.log(req.user);
    const wishlist = await wishlistService.addItemToWishlist({ product_id, wishlist_id, cart_id });
    res.status(200).json({ data: wishlist });
    // console.log(wishlist);
};


const deleteItem = async (req, res) => {
    const {product_id } = req.body; 
    const wishlist_id = req.user.wishlist_id;
    console.log(wishlist_id);
    const wishlist = await wishlistService.deleteItemFromWishlist({ wishlist_id, product_id });
    res.status(200).json(wishlist);
};

const addWishlistItemToCart = async (req, res) => {
    const cart_id = req.user.cart_id;

    const cart = await cartService.addItem({...req.body, cart_id});
    res.status(200).json({data : cart});
};

const isInWishlist = async (req, res) => {
    const {product_id } = req.body; 
    const wishlist_id = req.user.wishlist_id;
//    console.log(product_id);
    //   console.log(wishlist_id);
    const wishlist = await wishlistService.isInWishlist({wishlist_id, product_id});
    // console.log(wishlist);
    res.status(200).json({wishlist});
    
}

module.exports = {
    getWishlist,
    addItem,
    deleteItem,
    addWishlistItemToCart,
    createWishlist,
    isInWishlist
};
