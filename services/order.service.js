const {
    createOrderDb, 
    getAllOrdersDb, 
    getOrderDb,
} = require("../db/orders.db");

const {ErrorHandler} = require("../helpers/error");

class orderService {
    createOrder = async (data) => {
        try {
            return await createOrderDb(data);
        } catch (error) {
            throw new ErrorHandler(error.statusCode, error.message);
        }
    };

    getAllOrders = async (user_id, page) => {
        const limit = 5;
        const offset = (page - 1) * limit;
        try {
            return await getAllOrdersDb({user_id, limit, offset});
        } catch (error) {
            throw new ErrorHandler(error.statusCode, error.message);
        }
    };

    getOrderById = async (data) => {
        try {
            if(await getOrderDb(data)){
                return await getOrderDb(data);
            }else{
                throw new ErrorHandler(404, "order does not exist");
            }
        } catch (error) {
            throw new ErrorHandler(error.statusCode, error.message);
        }
    }
}

module.exports = new orderService();