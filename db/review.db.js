const pool = require("../config/index");


const getReviewDb = async ({product_id, userId}) => {
    // check if any review exist
    const reviewExist = await pool.query(
        `
        SELECT EXISTS (SELECT * FROM reviews where product_id = $1 AND user_id = $2)
        `,
        [product_id, userId]
    );
     
    // get reviews associated with products
    const reviews = await pool.query(
        `
        SELECT users.fullname as name , reviews.* from reviews
        join users
        on users.user_id = reviews.user_id
        WHERE product_id = $1
        `,
        [product_id ]
    );
    return {reviewExist: reviewExist.rows[0].exists, reviews: reviews.rows,};
};

const createReviewDb = async ({product_id, content, rating, user_id}) => {
    const {rows: review} = await pool.query(
        `
        INSERT INTO reviews(user_id, product_id, content, rating)
        VALUES($1, $2, $3, $4) retrning *
        ,
        `,
        [product_id, content, rating, user_id]
    );
    return review[0];
};

const updateReviewDb = async ({content, rating, id}) => {
    const {rows:review} = await pool.query(
        `
        UPDATE reviews set content = $1, rating = $2 where id = $3 returning *
        `,
        [content, rating, id]
    );
    return review[0];
};


module.exports = {
    getReviewDb,
    createReviewDb, 
    updateReviewDb,
};
