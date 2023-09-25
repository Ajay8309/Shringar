const pool = require("../config");

const getAllProductsDb = async ({limit, offset}) => {
     const {rows} = await pool.query(
        `
        SELECT
        products.*,
        product_category.name AS category_name,
        material_type.name AS material_type_name,
        trunc(avg(reviews.rating), 1) AS avg_rating,
        count(reviews.*) AS review_count
    FROM
        products
    LEFT JOIN
        reviews ON products.product_id = reviews.product_id
    LEFT JOIN
        product_category ON products.category_id = product_category.id
    LEFT JOIN
        material_type ON products.material_id = material_type.id
    GROUP BY
        products.product_id, category_name, material_type_name
    LIMIT $1 OFFSET $2;
    
        `,
        [limit, offset]
     );
     const products = [...rows].sort(() => Math.random() - 0.5);
     return products;
};

const createProductDb = async ({ name, weight, description, image_url, category_name, material_type_name }) => {
    let price;
    
    if (material_type_name === "gold") {
        const { rows: goldMaterial } = await pool.query(
            `SELECT gold_price FROM material_type WHERE name = 'gold'`
        );
        if (goldMaterial.length === 0) {
            throw new Error("Gold material type not found in the database.");
        }
        price = weight * goldMaterial[0].gold_price;
    } else if (material_type_name === "silver") {
        const { rows: silverMaterial } = await pool.query(
            `SELECT silver_price FROM material_type WHERE name = 'silver'`
        );
        if (silverMaterial.length === 0) {
            throw new Error("Silver material type not found in the database.");
        }
        price = weight * silverMaterial[0].silver_price;
    } else {
        throw new Error("Invalid material type specified.");
    }
    
    const { rows: product } = await pool.query(
        `
        INSERT INTO products(name, price, description, image_url, weight, category_id, material_id)
        VALUES ($1, $2, $3, $4, $5, (SELECT id FROM product_category WHERE name = $6), (SELECT id FROM material_type WHERE name = $7))
        RETURNING *
        `,
        [name, price, description, image_url, weight, category_name, material_type_name]
    );
    return product[0];
};


// changes are needed as changes are made in our Db
const getProductDb = async (id) => {
    const {rows: product} = await pool.query(
        `
        select products.*, round(avg(reviews.rating), 1) as avg_rating, count(reviews.*) from products
        LEFT JOIN reviews
        ON products.product_id = reviews.product_id
        where products.product_id = $1
        group by products.product_id
        
        `,
        [id]
    );
    return product[0];
}

// changes are needed here as we have made some changes in our Db

const getProductByNameDb = async (name) => {
    const {rows:product} = await pool.query(
        `
        select products.*, trunc(avg(reviews.rating),1) as avg_rating, count(reviews.*) from products
        LEFT JOIN reviews
        ON products.product_id = reviews.product_id
        where products.name = $1
        group by products.product_Id
        `,
        [name]
    );

    return product[0];
}

const updateProductDb = async ({ product_id, name, weight, description, image_url, price, category_name, material_type_name }) => {
    const { rows: product } = await pool.query(
        `
        UPDATE products
        SET name = $1, price = $2, description = $3, image_url = $4, weight = $5,
            category_id = (SELECT id FROM product_category WHERE name = $6),
            material_id = (SELECT id FROM material_type WHERE name = $7)
        WHERE product_id = $8
        RETURNING *
        `,
        [name, price, description, image_url, weight, category_name, material_type_name, product_id]
    );
    return product[0];
};





// CREATE TABLE public.reviews
// (
//     user_id integer NOT NULL,
//     content text NOT NULL,
//     rating integer NOT NULL,
//     product_id integer NOT NULL,
//     date date NOT NULL,
//     id integer NOT NULL,
//     PRIMARY KEY (user_id, product_id),
//     FOREIGN KEY (product_id)
//         REFERENCES public.products (product_id)
//         ON DELETE SET NULL,
//     FOREIGN KEY (user_id)
//         REFERENCES public.users (user_id)
//         ON DELETE SET NULL
// );
