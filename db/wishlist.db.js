const pool = require("../config/index");

const createWishlistDb = async (userId) => {
    const {rows:wishlist} = await pool.query(
        `INSERT INTO wishlist(user_id) values ($1)
        returning wishlist.id
        `,
        [userId]
    );
    return wishlist[0];
};

const getWishlistDb = async (wishlist_id) => {
    const results = await pool.query(
        `
        SELECT
            wishlist_item.*,
            products.*,
            material_type.name AS material_type_name,
            product_category.name AS category_name
        FROM
            wishlist_item
        JOIN
            products ON wishlist_item.product_id = products.product_id
        LEFT JOIN
            material_type ON products.material_id = material_type.id
        LEFT JOIN
            product_category ON products.category_id = product_category.id
        WHERE
            wishlist_item.wishlist_id = $1
        `,
        [wishlist_id]
    );

    return results.rows;
};

const addItemToWishlistDb = async ({ product_id, wishlist_id, cart_id }) => {
    await pool.query(
        `
        INSERT INTO wishlist_item(wishlist_id, product_id, cart_id)
        VALUES ($1, $2, $3) ON CONFLICT (wishlist_id, product_id)
        DO NOTHING
        `,
        [wishlist_id, product_id, cart_id]
    );

    const results = await pool.query(
        `
        SELECT
            p.*,
            mt.name AS material_type_name,
            pc.name AS category_name,
            wi.cart_id
        FROM
            wishlist_item wi
        JOIN
            products p ON wi.product_id = p.product_id
        LEFT JOIN
            material_type mt ON p.material_id = mt.id
        LEFT JOIN
            product_category pc ON p.category_id = pc.id
        WHERE
            wi.wishlist_id = $1
            AND wi.product_id = $2
        `,
        [wishlist_id, product_id]
    );

    return results.rows;
};


const deleteItemFromWishlistDb = async ({ wishlist_id, product_id }) => {
    const { rows: results } = await pool.query(
        `
        DELETE FROM wishlist_item WHERE wishlist_id = $1 AND product_id = $2 RETURNING *
        `,
        [wishlist_id, product_id]
    );
    return results[0];
};

const addWishlistItemToCartDb = async ({cart_id, product_id, quantity}) => {
    await pool.query(
        `
        INSERT INTO cart_item(cart_id, product_id, quantity)
        VALUES ($1, $2, $3) ON CONFLICT (cart_id, product_id)
        DO UPDATE set quantity = cart_item.quantity + 1 returning *
        `,
        [cart_id, product_id, quantity]
    );

    const results = await pool.query(
        `
        select products.*, cart_item.quantity, round((products.price * cart_item.quantity)
        :: numeric, 2)
        as subtotal from cart_item join products on cart_item.product_id = products.product_id 
        where cart_item.cart_id = $1
        `,
        [cart_id]
    );
    return results.rows;
};



module.exports = {
    createWishlistDb,
    getWishlistDb,
    addItemToWishlistDb,
    deleteItemFromWishlistDb,
    addWishlistItemToCartDb,
};