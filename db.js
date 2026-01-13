require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    dateStrings: true, // Return dates as strings to avoid timezone conversion issues
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
});

module.exports = connection;