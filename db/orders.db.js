const pool = require("../config/index");



const getAllDb = async ({ limit, offset }) => {
    const { rows } = await pool.query(`
    SELECT 
        orders.order_id,
        orders.status,
        orders.date,
        orders.amount,
        orders.total,
        orders.ref,
        orders.payment_method,
        array_agg(json_build_object(
            'product_name', products.name,
            'product_description', products.description,
            'product_price', products.price,
            'product_image_url', products.image_url,
            'product_carat', products.carat,
            'quantity', order_item.quantity
        )) AS products,
        users.fullname AS user_fullname,
        users.email AS user_email,
        users.username AS user_username
    FROM 
        orders
    INNER JOIN 
        order_item ON orders.order_id = order_item.order_id
    INNER JOIN 
        products ON order_item.product_id = products.product_id
    INNER JOIN 
        users ON orders.user_id = users.user_id
    GROUP BY 
        orders.order_id, users.fullname, users.email, users.username
    ORDER BY 
        orders.order_id
    LIMIT $1 OFFSET $2;
    `, [limit, offset]);
    return rows;
};


const createOrderDb = async ({
    cartId,
    amount,
    itemTotal,
    user_id, 
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

const getOrderDb = async ({ id, userId }) => {
    try {
        const { rows } = await pool.query(
            `
            SELECT 
                orders.order_id,
                orders.status,
                orders.date,
                orders.amount,
                orders.total,
                orders.ref,
                orders.payment_method,
                array_agg(json_build_object(
                    'product_id', products.product_id,
                    'product_name', products.name,
                    'product_description', products.description,
                    'product_price', products.price,
                    'product_image_url', products.image_url,
                    'product_carat', products.carat,
                    'quantity', order_item.quantity
                )) AS products
            FROM 
                orders
            INNER JOIN 
                order_item ON order_item.order_id = orders.order_id
            INNER JOIN 
                products ON products.product_id = order_item.product_id
            WHERE 
                orders.order_id = $1 AND orders.user_id = $2
            GROUP BY 
                orders.order_id
            `,
            [id, userId]
        );

        if (rows.length === 0) {
            console.error('No order found with the given ID and user ID.');
            return null;
        }

        console.log('Backend order:', rows[0]); // Log the result
        return rows[0];
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
};


module.exports = {
    createOrderDb,
    getAllOrdersDb,
    getOrderDb,
    getAllDb,
};
