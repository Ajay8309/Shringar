const pool = require("../config");

const {ErrorHandler} = require("../helpers/error");

const getProductReviews = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.user_id;

    try {
        const reviewExist = await pool.query(
            `
            SELECT EXISTS (SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2) AS review_exists
            `,
            [id, user_id]
        );

        const reviews = await pool.query(
            `
            SELECT users.fullname as name, reviews.* FROM reviews
            JOIN users ON users.user_id = reviews.user_id
            WHERE product_id = $1
            `,
            [id]
        );

        res.status(200).json({
            reviewExist: reviewExist.rows[0].review_exists,
            reviews: reviews.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

const createproductReviews = async (req, res) => {
    const { product_id, content, rating } = req.body;
    const user_id = req.user.id;
    const date = new Date();

    try {
        const existingReview = await pool.query(
            `
            SELECT * FROM reviews
            WHERE user_id = $1 AND product_id = $2
            `,
            [user_id, product_id]
        );

        if (existingReview.rows.length > 0) {
            return res.status(400).json({ error: 'Review already exists for this user and product' });
        }

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
    const { content, rating, id } = req.body;

    try {
        const result = await pool.query(
            `
            UPDATE reviews SET content = $1, rating = $2 WHERE id = $3 RETURNING *
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