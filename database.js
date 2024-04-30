const pg =require("pg");
require('dotenv').config();

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
console.log("db connects sucessfully!");
module.exports=db;