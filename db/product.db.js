const pool = require("../config/index");



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

const calculatePrice = async ({ weight, material_type_name }) => {
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

    return price;
};

const createProductDb = async ({ name, weight, description, image_url, category_name, material_type_name, carat }) => {
    const price = await calculatePrice({ weight, material_type_name });

    const { rows: product } = await pool.query(
        `
        INSERT INTO products(name, price, description, image_url, weight, category_id, material_id, carat)
        VALUES ($1, $2, $3, $4, $5, (SELECT id FROM product_category WHERE name = $6), (SELECT id FROM material_type WHERE name = $7), $8)
        RETURNING *
        `,
        [name, price, description, image_url, weight, category_name, material_type_name, carat]
    );
    return product[0];
};


const updateProductDb = async ({ id, name, weight, description, image_url, category_name, material_type_name }) => {
    const existingProduct = await pool.query('SELECT * FROM products WHERE product_id = $1', [id]);
    if (existingProduct.rows.length === 0) {
        throw new Error('Product not found');
    }

    let price = existingProduct.rows[0].price;

    // Calculate price if weight and material type are provided
    if (weight !== undefined && material_type_name !== undefined) {
        price = await calculatePrice({ weight, material_type_name });
    }

    // Validate material type if provided
    let finalMaterialId = null;
    if (material_type_name !== undefined) {
        const existingMaterial = await pool.query('SELECT id FROM material_type WHERE name = $1', [material_type_name]);
        if (existingMaterial.rows.length === 0) {
            throw new Error('Invalid material type specified.');
        }
        finalMaterialId = existingMaterial.rows[0].id;
    }

    let finalCategoryId = null;
    if (category_name !== undefined) {
        // Check if the category exists
        const existingCategory = await pool.query('SELECT id FROM product_category WHERE name = $1', [category_name]);
        if (existingCategory.rows.length === 0) {
            // If category doesn't exist, create it
            const newCategory = await pool.query('INSERT INTO product_category (name) VALUES ($1) RETURNING id', [category_name]);
            if (newCategory.rows.length === 0) {
                throw new Error('Failed to create category');
            }
            finalCategoryId = newCategory.rows[0].id;
        } else {
            finalCategoryId = existingCategory.rows[0].id;
        }
    }

    // Build the SET clause dynamically based on defined values
    const setClause = [
        'name = COALESCE($2, name)',
        'price = COALESCE($3::real, price)',
        'description = COALESCE($4, description)',
        'image_url = COALESCE($5, image_url)',
        'weight = COALESCE($6, weight)',
        'category_id = COALESCE($7, category_id)',
        'material_id = COALESCE($8, material_id)'
    ];

    const setValues = [id, name, price, description, image_url, weight, finalCategoryId, finalMaterialId];

    const { rows: updatedProducts } = await pool.query(
        `UPDATE products
        SET ${setClause.join(', ')}
        WHERE product_id = $1
        RETURNING *`,
        setValues
    );

    return updatedProducts[0];
};

const getProductDb = async (id) => {
    const { rows: product } = await pool.query(
        `
        SELECT
            products.*,
            ROUND(AVG(reviews.rating), 1) AS avg_rating,
            COUNT(reviews.*) AS review_count,
            material_type.name AS material_type_name,
            product_category.name AS category_name
        FROM
            products
        LEFT JOIN
            reviews ON products.product_id = reviews.product_id
        LEFT JOIN
            material_type ON products.material_id = material_type.id
        LEFT JOIN
            product_category ON products.category_id = product_category.id
        WHERE
            products.product_id = $1
        GROUP BY
            products.product_id, material_type.name, product_category.name
        `,
        [id]
    );
    return product[0];
}



const getProductByNameDb = async (name) => {
    // Convert the search input to lowercase
    const lowerCaseName = name.toLowerCase();

    const { rows: product } = await pool.query(
        `
        SELECT
            products.*,
            ROUND(AVG(reviews.rating), 1) AS avg_rating,
            COUNT(reviews.*) AS review_count,
            material_type.name AS material_type_name,
            product_category.name AS category_name
        FROM
            products
        LEFT JOIN
            reviews ON products.product_id = reviews.product_id
        LEFT JOIN
            material_type ON products.material_id = material_type.id
        LEFT JOIN
            product_category ON products.category_id = product_category.id
        WHERE
            LOWER(products.name) = $1  -- Use LOWER() to convert stored names to lowercase for comparison
        GROUP BY
            products.product_id, material_type.name, product_category.name
        `,
        [lowerCaseName]  // Pass the lowercase search input as parameter
    );
    return product[0];
}



// get Product By category

const getProductsByCategoryDb = async (categoryName) => {
    const { rows } = await pool.query(
        `
        SELECT
            products.*,
            material_type.name AS material_type_name,
            product_category.name AS category_name
        FROM
            products
        JOIN
            product_category ON products.category_id = product_category.id
        LEFT JOIN
            material_type ON products.material_id = material_type.id
        WHERE
            product_category.name = $1
        `,
        [categoryName]
    );
    return rows;
};

// get product by material name 


const getProductsByMaterialTypeDb = async (materialType) => {
    console.log('Material Type:', materialType); 
    const { rows } = await pool.query(
        `
        SELECT
            products.*,
            material_type.name AS material_type_name,
            product_category.name AS category_name
        FROM
            products
        JOIN
            product_category ON products.category_id = product_category.id
        LEFT JOIN
            material_type ON products.material_id = material_type.id
        WHERE
            material_type.name = $1
        `,
        [materialType]
    );
    return rows;
};






const deleteProductDb = async (id) => {

     // Delete related records from cart_item table
        await pool.query(
            `DELETE FROM cart_item WHERE product_id = $1`,
            [id]
        );

        // Delete related records from reviews table
        await pool.query(
            `DELETE FROM reviews WHERE product_id = $1`,
            [id]
        );

        // Delete related records from wishlist_item table
        await pool.query(
            `DELETE FROM wishlist_item WHERE product_id = $1`,
            [id]
        );

        // Now delete the product
        const { rows } = await pool.query(
            `DELETE FROM products WHERE product_id = $1 RETURNING *`,
            [id]
        );

        return rows[0];
};

const filterProductsDb = async ({ minPrice, maxPrice, categoryName, materialType }) => {
    let query = `
        SELECT
            products.*,
            material_type.name AS material_type_name,
            product_category.name AS category_name
        FROM
            products
        JOIN
            product_category ON products.category_id = product_category.id
        LEFT JOIN
            material_type ON products.material_id = material_type.id
        WHERE 1=1`;

    const values = [];

    let paramCount = 1; // Start counting parameters from 1

    if (minPrice !== undefined && maxPrice !== undefined) {
        const minPriceNumber = parseFloat(minPrice);
        const maxPriceNumber = parseFloat(maxPrice);
        query += ` AND products.price BETWEEN $${paramCount}::numeric AND $${paramCount + 1}::numeric`;
        values.push(minPriceNumber, maxPriceNumber);
        paramCount += 2; // Increment by 2 since we used 2 parameters
    }

    if (materialType) {
        query += ` AND material_type.name = $${paramCount}::text`;
        values.push(materialType);
        paramCount += 1; // Increment by 1
    }

    if (categoryName) {
        query += ` AND product_category.name = $${paramCount}::text`;
        values.push(categoryName);
        paramCount += 1; // Increment by 1
    }

    console.log('Generated SQL query:', query);
    console.log('Parameters:', values);

    // Execute the query
    const { rows } = await pool.query(query, values);
    console.log('Database Response:', rows);
    return rows;
};

module.exports = {
    getAllProductsDb,
    createProductDb,
    getProductDb,
    getProductByNameDb,
    updateProductDb,
    deleteProductDb,
    getProductsByCategoryDb,
    getProductsByMaterialTypeDb,
    filterProductsDb
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
