require("dotenv").config();

const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

db.connect((error) => {

    if (error) {
        console.error(
            "❌ MySQL connection failed:",
            error.message
        );
        return;
    }

    console.log("✅ MySQL connected successfully");
    console.log(
        "📦 Database:",
        process.env.DB_NAME
    );
});

module.exports = db;