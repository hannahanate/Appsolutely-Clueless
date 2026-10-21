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

// create packing list table if it doesnt exist
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

//create flights table if it doesnt exist
db.exec(`
    CREATE TABLE IF NOT EXISTS Flight (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tripId INTEGER NOT NULL,
        airline TEXT NOT NULL,
        flightNumber TEXT NOT NULL,
        departureCity TEXT NOT NULL,
        departureAirport TEXT NOT NULL,
        departureDate TEXT NOT NULL,
        departureTime TEXT NOT NULL,
        arrivalCity TEXT NOT NULL,
        arrivalAirport TEXT NOT NULL,
        arrivalDate TEXT NOT NULL,
        arrivalTime TEXT NOT NULL,
        layoverCity TEXT,
        layoverAirport TEXT,
        layoverDuration TEXT,
        FOREIGN KEY (tripId) REFERENCES Trip(id) ON DELETE CASCADE
    );
`);

// Create a table for expenses belonging to a trip
db.exec(`
    CREATE TABLE IF NOT EXISTS Budget (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tripId INTEGER NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL CHECK (amount > 0),
        currency TEXT NOT NULL DEFAULT '€',
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (tripId) REFERENCES Trip(id) ON DELETE CASCADE
    );
`);
//add a total budget to each trip if it does not exist yet
const tripColumns = db.prepare("PRAGMA table_info(Trip)").all();

if (!tripColumns.some((column) => column.name === "totalBudget")) {
    db.exec(`
        ALTER TABLE Trip
        ADD COLUMN totalBudget REAL NOT NULL DEFAULT 0
        CHECK (totalBudget >= 0);
    `);
}

console.log("Connected to SQLite database:", dbPath);

module.exports = db;
