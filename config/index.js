require("dotenv").config();
const {pool} = require("pg");

const isProduction = process.env.NODE_ENV === "production";
const database = process.env.NODE_ENV === "test"?
                process.env.POSTGRES_DB_TEST: process.env.POSTGRES_DB;


const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${database}`;

const pool = new Pool({
    connectionString,
    ssl:isProduction ? {rejectUnauthorized:false}:false,
});

module.exports = {
    query:(text, params) => pool.query(text, params),
    end:() => pool.end(),
};