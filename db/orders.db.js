const pool = require("../config/index");

const createOrderDb = async ({
    cartId,
    amount,
    itemTotal,
    user_id, // Ensure userId is not null
    ref,
    paymentMethod,
}) => {
    if (user_id === null) {
        throw new Error("userId cannot be null");
    }

    const { rows: order } = await pool.query(
        `
        INSERT INTO orders(user_id, status, amount, total, ref, payment_method)
        VALUES ($1, 'complete', $2, $3, $4, $5)
        RETURNING *;
        `,
        [user_id, amount, itemTotal, ref, paymentMethod]
    );

    await pool.query(
        `
        INSERT INTO order_item(order_id, product_id, quantity)
        SELECT $1, product_id, quantity FROM cart_item WHERE cart_id = $2;
        `,
        [order[0].order_id, cartId]
    );
};




const getAllOrdersDb = async ({ user_id, limit, offset }) => {
    const { rowCount } = await pool.query(
        `
        SELECT * FROM orders WHERE user_id = $1
        `,
        [user_id]
    );

    const orders = await pool.query(
        `
        SELECT order_id, user_id, status, date::date, amount, total
        FROM orders WHERE user_id = $1 ORDER BY order_id DESC LIMIT $2 OFFSET $3
        `,
        [user_id, limit, offset]
    );

    return { items: orders.rows, total: rowCount };
};



const getOrderDb = async ({id, userId}) => {
    const {rows: order} = await pool.query(
        `
        SELECT products.*, order_item.quantity 
        FROM orders 
        JOIN order_item ON order_item.order_id = orders.order_id
        JOIN products ON products.product_id = order_item.product_id
        WHERE orders.order_id = $1 AND orders.user_id = $2
        `,
        [id, userId]
    );

    return order;
}


module.exports = {
    createOrderDb,
    getAllOrdersDb,
    getOrderDb,
};
