const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");

//database path
const dbPath = path.join(
    __dirname,
    "database",
    "data",
    "travelPlanner.db"
);

// stop from creating empty database
if (!fs.existsSync(dbPath)) {
    throw new Error(`SQLite database not found at: ${dbPath}`);
}

//connect to SQLite using Node's built-in module
const db = new DatabaseSync(dbPath);

//foreign key relationships
db.exec("PRAGMA foreign_keys = ON");

console.log("Connected to SQLite database:", dbPath);

module.exports = db;
