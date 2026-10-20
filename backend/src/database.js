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

// create packing list table if it does not exist
db.exec(`
    CREATE TABLE IF NOT EXISTS PackingItem (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tripId INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        quantity INTEGER NOT NULL DEFAULT 1
            CHECK (quantity >= 1),
        packed INTEGER NOT NULL DEFAULT 0
            CHECK (packed IN (0, 1)),
        FOREIGN KEY (tripId) REFERENCES Trip(id) ON DELETE CASCADE
    );
`);

console.log("Connected to SQLite database:", dbPath);

module.exports = db;
