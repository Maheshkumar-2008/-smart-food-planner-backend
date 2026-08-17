require("dotenv").config();

const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

pool.getConnection((error, connection) => {

    if (error) {
        console.error(
            "MySQL connection failed:",
            error.message
        );
        return;
    }

    console.log("MySQL connected successfully");
    console.log(
        "Database:",
        process.env.DB_NAME
    );

    connection.release();
});

module.exports = pool;