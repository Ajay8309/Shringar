const orderService = require("../services/order.service");
const cartService = require("../services/cart.service");

const createOrder = async (req, res) => {
    const {amount, itemTotal, paymentMethod, ref} = req.body;
    const user_id = req.user.id;
    const cartId = req.user.cart_id;

    const newOrder = await orderService.createOrder({
        cartId, 
        amount, 
        itemTotal, 
        user_id,
        paymentMethod, 
        ref,
    });

    await cartService.emptyCart(cartId);
    res.status(201).json(newOrder);
};

const getOrder = async (req, res) => {
    const {id} = req.params;
    const user_id = req.user.user_id;

    const order = await orderService.getOrderById({id, user_id});
    res.json(order);
};

const getAllOrders = async (req, res) => {
    const {page = 1} = req.query;
    const user_id = req.user.id;

    const orders = await orderService.getAllOrders(user_id, page);
    res.json(orders);
}

module.exports = {
    getAllOrders, 
    getOrder, 
    createOrder,
};