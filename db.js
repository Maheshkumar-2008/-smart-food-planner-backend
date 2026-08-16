require("dotenv").config();

const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Mahesh@250116",
    database: "smart_food_planner",
    port: 3306
});

db.connect((error) => {

    if (error) {

        console.error("MySQL connection failed:");
        console.error(error.message);

        return;
    }

    console.log("MySQL connected successfully");
});

module.exports = db;