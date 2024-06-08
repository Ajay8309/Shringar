const paymentService = require("../services/payment.service");


const makePayment = async (req, res) => {
    try {
        const { amount, email } = req.body;
        const order = await paymentService.payment(amount, email);
        res.status(200).json(order);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

module.exports = {
    makePayment
};