const pool = require("../config/index");


const getAllUsersDb = async () => {
    const {rows:users} = await pool.query(
        `select * from users`
    );
    return users;
};

const createUserDb = async ({ username, password, email, fullname }) => {
    const { rows: user } = await pool.query(
        `
        INSERT INTO users(username, password, email, fullname)
        VALUES ($1, $2, $3, $4)
        RETURNING user_id, username, email, fullname
        `,
        [username, password, email, fullname]
    );
    return user[0];
};


const getUserByIdDb = async (id) => {
    const {rows:user} = await pool.query(
        `select users.*, cart.id as cart_id from users 
        left join cart on cart.user_id = users.user_id where users.user_id = $1`,
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
    const {rows:user} = await pool.query(
        `
        select users.*, cart.id as cart_id from users
        left join cart on cart.user_id = users.user_id where users.email = $1
        `,
        [email]
    );
    return user[0];
}

const updateUserDb = async (
    {
       username, 
       email,
       fullname,
       id,
       address,
       city,
       state,
       country,
    })=>{
        const {rows:user} = await pool.query(
            `
            UPDATE users set username = $1, email = $2, fullname = $3, address = $4, city = $5, 
            state = $6, country = $7 where user_id = $8 returning username, email, fullname, user_id,
            address, city, country, state
            `,
            [ username, email ,fullname, id, address,city, state, country]
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
            // createUserGoogleDb,
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

