const pool = require("../config/index");

const createWishlistDb = async (userId) => {
    const {rows:wishlist} = await pool.query(
        `INSERT INTO wishlist(user_id) values ($1)
        returning wishlist.id
        `
    );
};

const getWishlistDb = async (userId) => {
    const wishlist = await pool.query(
        `
        SELECT
            products.*,
            material_type.name AS material_type_name,
            product_category.name AS category_name
        FROM
            users
        JOIN
            wishlist ON users.user_id = wishlist.user_id
        JOIN
            wishlist_item ON wishlist.id = wishlist_item.wishlist_id
        JOIN
            products ON products.product_id = wishlist_item.product_id
        LEFT JOIN
            material_type ON products.material_id = material_type.id
        LEFT JOIN
            product_category ON products.category_id = product_category.id
        WHERE
            users.user_id = $1
        `,
        [userId]
    );
    return wishlist.rows;
};


const addItemToWishlistDb = async ({ wishlist_id, product_id }) => {
    await pool.query(
        `
        INSERT INTO wishlist_item(wishlist_id, product_id)
        VALUES ($1, $2) ON CONFLICT (wishlist_id, product_id)
        DO NOTHING
        `,
        [wishlist_id, product_id]
    );

    const results = await pool.query(
        `
        SELECT
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


const deleteItemFromWishlistDb = async ({ wishlist_id, product_id }) => {
    const { rows: results } = await pool.query(
        `
        DELETE FROM wishlist_item WHERE wishlist_id = $1 AND product_id = $2 RETURNING *
        `,
        [wishlist_id, product_id]
    );
    return results[0];
};

const addWishlistItemToCartDb = async (wishlist_id, product_id, user_id) => {
    // Check if the same item exists in the user's cart
    const existingCartItem = await pool.query(
        `
        SELECT * FROM cart_item
        WHERE cart_id = (SELECT id FROM cart WHERE user_id = $1)
        AND product_id = $2
        `,
        [user_id, product_id]
    );

    if (existingCartItem.rowCount === 0) {
        // Item is not in the cart, so add it with quantity 1
        await pool.query(
            `
            INSERT INTO cart_item (cart_id, product_id, quantity)
            VALUES ((SELECT id FROM cart WHERE user_id = $1), $2, 1)
            `,
            [user_id, product_id]
        );
    } else {
        // Item is already in the cart, so increase its quantity by 1
        await pool.query(
            `
            UPDATE cart_item
            SET quantity = quantity + 1
            WHERE cart_id = (SELECT id FROM cart WHERE user_id = $1)
            AND product_id = $2
            `,
            [user_id, product_id]
        );
    }
};


module.exports = {
    createWishlistDb,
    getWishlistDb,
    addItemToWishlistDb,
    deleteItemFromWishlistDb,
    addWishlistItemToCartDb,
};