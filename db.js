require("dotenv").config();

const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "smart_food_planner",
    port: Number(process.env.DB_PORT) || 3306
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
    console.log("📦 Database: smart_food_planner");
});

module.exports = db;