
const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");

//create a folder for the database file
const dataDirectory = path.join(__dirname, "data");
fs.mkdirSync(dataDirectory, { recursive: true });

//open or create the database file
const dbPath = path.join(dataDirectory, "travelPlanner.db");
const db = new DatabaseSync(dbPath);

//Allow foreign-key relationships.
db.exec("PRAGMA foreign_keys = ON");

//create the tables
db.exec(`
  CREATE TABLE IF NOT EXISTS Trip (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    destinationCity TEXT NOT NULL,
    destinationCountry TEXT NOT NULL,
    bookingRef TEXT,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    destinationPicture TEXT,
    destinationFlag TEXT
  );

  CREATE TABLE IF NOT EXISTS Activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tripId INTEGER NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    location TEXT,
    notes TEXT,
    FOREIGN KEY (tripId) REFERENCES Trip(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS Budget (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tripId INTEGER NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (tripId) REFERENCES Trip(id) ON DELETE CASCADE
  );
`);


/* Add test trips if the database is empty. */
const tripCount = db.prepare("SELECT COUNT(*) AS count FROM Trip").get();

if (tripCount.count === 0) {
    const insertTrip = db.prepare(`
        INSERT INTO Trip (
            name, destinationCity, destinationCountry,
            bookingRef, startDate, endDate,
            destinationPicture, destinationFlag
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTrip.run(
        "Italy Trip", "Rome", "Italy", null,
        "2026-07-12", "2026-07-19", null, null
    );

    insertTrip.run(
        "Paris Weekend", "Paris", "France", null,
        "2026-08-10", "2026-08-13", null, null
    );
}

module.exports = db;