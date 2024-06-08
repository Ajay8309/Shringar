const Razorpay = require('razorpay');
const { ErrorHandler } = require('../helpers/error');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});

class paymentService {
    payment = async (amount, email) => {
        try {
            const order = await razorpay.orders.create({
                amount: amount, 
                currency: 'INR',
                receipt: `receipt_order_${Date.now()}`, 
                payment_capture: 1, 
                notes: {
                    email: email,
                }
            });
            return order;
        } catch (error) {
            throw new ErrorHandler(error.statusCode, error.message);
        }
    };
}

module.exports = new paymentService();
