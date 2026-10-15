//connecting database to backend
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// database path
const dbPath = path.join(__dirname,"database","data","travelPlanner.db");

// stop from creating empty database
if (!fs.existsSync(dbPath)) {
    throw new Error(`SQLite database not found at: ${dbPath}`);
}

const db = new Database(dbPath);

// key relationships
db.pragma("foreign_keys = ON");

console.log("Connected to SQLite database:", dbPath);

module.exports = db;
