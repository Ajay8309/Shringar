const cartService = require("../services/cart.service");


const getCart = async (req, res) => {
    const userId = req.user.userId;

    const cart = await cartService.getCart(userId);
    res.json({items: cart});
};


const addItem = async (req, res) => {
    const cart_id = req.user.cart_id;

    const cart = await cartService.addItem({...req.body, cart_id});
    res.status(200).json({data : cart});
};

const deleteItem = async (req, res) => {
    const {product_id} = req.body;
    const cart_id = req.user.cart_id;

    const data = await cartService.removeItem({cart_id, product_id});
    res.status(200).json(data);
};

const increaseItemQuantity = async (req, res) => {
    const {product_id} = req.body;
    const cart_id = req.user.cart_id;

    const cart = await cartService.increaseQuantity({cart_id, product_id});
    res.json(cart);
}

const decreaseItemQuantity = async (req, res) => {
    const {product_id} = req.body;
    const cart_id = req.user.cart_id;

    const cart = await cartService.decreaseItemQuantity({cart_id, product_id});
    res.json(cart);
}

module.exports = {
    getCart, 
    addItem, 
    increaseItemQuantity,
    decreaseItemQuantity, 
    deleteItem,
};