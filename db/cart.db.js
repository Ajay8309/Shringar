const pool = require("../config/index");

const createCartDb = async (userId) => {
    const {rows:cart} = await pool.query(
        `INSERT INTO cart(user_id) values ($1) returning cart.id`,
        [userId]
    );
    return cart[0];
};

const getCartDb = async (userId) => {
    const cart = await pool.query(
        `
        SELECT
            products.*,
            cart_item.quantity,
            round((products.price * cart_item.quantity)::NUMERIC, 2) AS subtotal,
            material_type.name AS material_type_name,
            product_category.name AS category_name
        FROM
            users
        JOIN
            cart ON users.user_id = cart.user_id
        JOIN
            cart_item ON cart.id = cart_item.cart_id
        JOIN
            products ON products.product_id = cart_item.product_id
        LEFT JOIN
            material_type ON products.material_id = material_type.id
        LEFT JOIN
            product_category ON products.category_id = product_category.id
        WHERE
            users.user_id = $1
        `,
        [userId]
    );
    return cart.rows;
};


// Adding product to the cart 
const addItemDb = async ({cart_id, product_id, quantity}) => {
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

// deleteing item from cart

const deleteItemDb = async ({cart_id, product_id}) => {
    const {rows:results} = await pool.query(
        `
        delete from cart_item where cart_id = $1 AND product_id = $2 returning *
        `,
        [cart_id, product_id]
    );
    return results[0];
};

const increaseItemQuantityDb = async({cart_id, product_id}) => {
   await pool.query(
        `
        update cart_item set quantity = quantity + 1 where cart_item.cart_id =$1 
        AND cart_item.product_id = $2 returning *
        `,
        [cart_id, product_id]
    );

    const {rows:results} = await pool.query(
        `
        SELECT products.*, cart_item.quantity,
        round((products.price * cart_item.quantity) :: numeric, 2) as subtotal
        from cart_item join products 
        on cart_item.product_id = products.product_id
        where cart_item.cart_id = $1 
        `,
        [cart_id]
    );
    return results;
}


const decreaseItemQuantityDb = async({cart_id, product_id}) => {
    await pool.query(
         `
         update cart_item set quantity = quantity -1 where cart_item.cart_id =$1 
         AND cart_item.product_id = $2 returning *
         `,
         [cart_id, product_id]
     );

     const {rows:results} = await pool.query(
        `
        SELECT products.*, cart_item.quantity,
        round((products.price * cart_item.quantity) :: numeric, 2) as subtotal
        from cart_item join products 
        on cart_item.product_id = products.product_id
        where cart_item.cart_id = $1 
        `,
        [cart_id]
    );
    return results;
 };
 
 const emptyCartDb = async (cart_id) => {
    return await pool.query(
        `delete from cart_item where cart_id = $1`, [cart_id]
    );
 };

 module.exports = {
    createCartDb,
    getCartDb,
    addItemDb,
    increaseItemQuantityDb,
    decreaseItemQuantityDb,
    emptyCartDb,
    deleteItemDb
 }



// CREATE TABLE public.cart
// (
//     id SERIAL NOT NULL,
//     user_id integer UNIQUE NOT NULL,
//     PRIMARY KEY (id),
//     FOREIGN KEY (user_id)
//         REFERENCES public.users (user_id)
//         ON DELETE SET NULL
// );

// -- Create a cart_item table
// CREATE TABLE public.cart_item
// (
//     id SERIAL NOT NULL,
//     cart_id integer NOT NULL,
//     product_id integer NOT NULL,
//     quantity integer NOT NULL CHECK (quantity > 0),
//     PRIMARY KEY (id),
//     UNIQUE (cart_id, product_id),
//     FOREIGN KEY (cart_id)
//         REFERENCES public.cart (id)
//         ON DELETE CASCADE,
//     FOREIGN KEY (product_id)
//         REFERENCES public.products (product_id)
//         ON DELETE SET NULL
// );

// -- Create a product_category table
// CREATE TABLE public.product_category
// (
//     id SERIAL NOT NULL,
//     name character varying(50) NOT NULL,
//     PRIMARY KEY (id)
// );

// -- Create a material_type table
// CREATE TABLE public.material_type
// (
//     id SERIAL NOT NULL,
//     name character varying(50) NOT NULL,
//     PRIMARY KEY (id)
// );

// -- Create a products table with category and material type
// CREATE TABLE public.products
// (
//     product_id SERIAL NOT NULL,
//     name character varying(50) NOT NULL,
//     price real NOT NULL,
//     description text NOT NULL,
//     image_url character varying,
//     category_id integer,
//     material_id integer,
//     PRIMARY KEY (product_id),
//     FOREIGN KEY (category_id)
//         REFERENCES public.product_category (id)
//         ON DELETE SET NULL,
//     FOREIGN KEY (material_id)
//         REFERENCES public.material_type (id)
//         ON DELETE SET NULL
// );
