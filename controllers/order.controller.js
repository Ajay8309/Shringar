const orderService = require("../services/order.service");
const cartService = require("../services/cart.service");

const createOrder = async (req, res) => {
    const {amount, itemTotal, paymentMethod, ref} = req.body;
    const user_id = req.user.id;
    const cartId = req.user.cart_id;

    // console.log("UserId is" + user_id);

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
    console.log("Get all orders");
    const id = parseInt(req.params.id, 10);
    const user_id = req.user.id;
    console.log(user_id);

    const order = await orderService.getOrderById({id, user_id});
    res.json(order);
};

const getAllOrders = async (req, res) => {
   
    // console.log(req.user);
    const {page = 1} = req.query;
    const user_id = req.user.id;
    console.log("Get all orders", user_id);
    const orders = await orderService.getAllOrders({user_id, page});
    res.json(orders);
}

module.exports = {
    getAllOrders, 
    getOrder, 
    createOrder,
};