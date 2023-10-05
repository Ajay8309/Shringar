const pool = require("../config");

const {ErrorHandler} = require("../helpers/error");

const getProductReviews = async (req, res) => {
    const {product_id, user_id} = req.query;

    try {
        const reviewExist = await pool.query(
            `
            SELECT EXISTS (SELECT * FROM reviews where product_id = $1 and user_id = $2)
            `,
            [product_id, user_id]
        );

        const reviews = await pool.query(
            `
            SELECT users.fullname as name, reviews.* FROM reviews
            join users
            on users.user_id = reviews.user_id
            WHERE product_id = $1
            `,
            [product_id]
        );
        res.status(200).json({
            reviewExist: reviewExist.rows[0].exists,
            reviews: reviews.rows,
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

const createproductReviews = async (req, res) => {
    const {user_id, product_id, content, rating } = req.body;
    // const user_id = req.params.user_id;
    const date = new Date();
    // const id = 1;

    try {
        const results = await pool.query(
            `
            INSERT INTO reviews(user_id, product_id, content, rating, date)
            VALUES($1, $2, $3, $4, $5) returning *
            `,
            [user_id, product_id, content, rating, date]
        );
        res.json(results.rows);
    } catch (error) {
        res.status(500).json(error.detail);
        throw new ErrorHandler(error.statusCode, error.message);
    }
};



const updateProductReview = async (req, res) => {
    const {content, rating, id} = req.body;

    try {
        const result = await pool.query(
            `
            UPDATE reviews set content = $1, rating = $2 where id  $3 returning *
            `,
            [content, rating, id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    getProductReviews, 
    updateProductReview, 
    createproductReviews, 
};