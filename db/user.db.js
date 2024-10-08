const pool = require("../config/index");


const getAllUsersDb = async ({limit, offset}) => {
    const {rows:users} = await pool.query(
        `select * from users LIMIT $1 OFFSET $2;`, 
        [limit, offset]
    );
    return users;
};

const createUserDb = async ({ username, password, email, fullname }) => {
    const { rows: user } = await pool.query(
        `
        INSERT INTO users(username, password, email, fullname, roles)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id, username, email, fullname, roles
        `,
        [username, password, email, fullname, roles]
    );
    return user[0];
};




const getUserByIdDb = async (id) => {
    const { rows: user } = await pool.query(
        `SELECT users.*, cart.id AS cart_id, wishlist.id AS wishlist_id 
         FROM users 
         LEFT JOIN cart ON cart.user_id = users.user_id 
         LEFT JOIN wishlist ON wishlist.user_id = users.user_id
         WHERE users.user_id = $1`,
        [id]
    );
    return user[0];
}


const getUserByUsernameDb = async (username) => {
    const {rows:user} = await pool.query(
        `
        select users.*, cart.id as cart_id from users
        left join cart on cart.user_id = users.user_id where lower(users.username) = lower($1)
        `,
        [username]
    );
    return user[0];
}


const getUserByEmailDb = async (email) => {
    const { rows: user } = await pool.query(
        `
        SELECT 
    users.*, 
    cart.id AS cart_id, 
    wishlist.id AS wishlist_id 
FROM 
    users
LEFT JOIN 
    cart ON cart.user_id = users.user_id
LEFT JOIN 
    wishlist ON wishlist.user_id = users.user_id
WHERE 
    lower(users.email) = lower($1);
        `,
        [email]
    );
    return user[0];
};


const updateUserDb = async ({
    username,
    email,
    fullname,
    id,
    address,
    city,
    state,
    country,
}) => {
    const { rows: user } = await pool.query(
        `
        UPDATE users 
        SET username = $1, 
            email = $2, 
            fullname = $3, 
            address = $4, 
            city = $5, 
            state = $6, 
            country = $7 
        WHERE user_id = $8 
        RETURNING username, email, fullname, address, city, state, country
        `,
        [username, email, fullname, address, city, state, country, id]
    );
    return user[0];
};



    const deleteUserDb = async (id) => {
        const {rows:user} = await pool.query(
            `
            DELETE FROM users where user_id = $1 returning *
            `,
            [id]
        );
        return user[0];
    }
     
    // we'll take care of it later
    // const createUserGoogleDb = async ({sub, de})

    const createUserGoogleDb = async ({sub, defaultUsername, email, name}) => {
        const {rows} = await pool.query(`INSERT INTO users(google_id, username, email, fullname)
        VALUES($1, $2, $3, $4) ON CONFLICT (email)
        DO UPDATE SET google_id = $1, fullname = $4 returning *`, 
         [sub, defaultUsername, email, name]
        );
    }

    const changeUserPasswordDb = async (hashedPasssword, email) => {
        return await pool.query(
            `update users set password = $1 where email = $2`,
            [hashedPasssword, email]
            );
        }
        
        module.exports = {
            getAllUsersDb,
            getUserByIdDb,
            getUserByEmailDb,
            updateUserDb,
            createUserDb,
            createUserGoogleDb,
            deleteUserDb,
            getUserByUsernameDb,
            changeUserPasswordDb,
        };
        
   




// CREATE TABLE public.users
// (
//     user_id SERIAL NOT NULL,
//     password character varying(200),
//     email character varying(100) UNIQUE NOT NULL,
//     fullname character varying(100) NOT NULL,
//     username character varying(50) UNIQUE NOT NULL,
//     google_id character varying(100) UNIQUE,
//     roles character varying(10)[] DEFAULT '{customer}'::character varying[] NOT NULL,
//     address character varying(200),
//     city character varying(100),
//     state character varying(100),
//     country character varying(100),
//     created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
//     PRIMARY KEY (user_id)
// );

