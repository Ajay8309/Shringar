const pool = require("../config/index");

const createOrderDb = async ({
    cartId,
    amount,
    itemTotal,
    userId,
    ref,
    paymentMethod,
}) => {
    const { rows: order } = await pool.query(
        `
        INSERT INTO orders(user_id, status, amount, total, ref, payment_method)
        VALUES ($1, 'complete', $2, $3, $4, $5)
        RETURNING *a
        `,
        [userId, amount, itemTotal, ref, paymentMethod]
    );

    await pool.query(
        `
        INSERT INTO order_item(order_id, product_id, quantity)
        SELECT $1, product_id, quantity FROM cart_item WHERE cart_id = $2
        `,
        [order[0].order_id, cartId]
    );
};

const getAllOrdersDb = async ({userId, limit, offset}) => {
    const {rowCount} = await pool.query(
        `
        SELECT * from orders WHERE orders.user_id = $1
        `,
        [userId]
    );

    const orders = await pool.query(
        `
        SELECT orders_id, user_id, status, date::date, amount, total
        from orders WHERE orders.user_id = $1 order by order_id desc limit $2 offset $3
        `,
        [userId, limit, offset]
    );

    return {items: orders.rows, total: rowCount}
}

const getOrderDb = async ({id, userId}) => {
    const {rows: order} = await pool.query(
        `
        SELECT products.*, order_item.quantity from orders 
        join orders_items=
        on order_item.order_id = orders.order_id
        join products
        on products.product_id = order_item.product_id
        where orders.order_id = $1 AND orders.user_id = $2
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
