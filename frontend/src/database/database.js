import * as SQLite from 'expo-sqlite';

// Open the local database
const dbConnection = SQLite.openDatabaseAsync('travelPlanner.db');

// Create all database tables
export async function initDatabase() {
  const db = await dbConnection;

  // allowing relationships between tables
  await db.execAsync('PRAGMA foreign_keys = ON;');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Trip (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      destination TEXT NOT NULL,
      bookingRef TEXT,
      startDate TEXT,
      endDate TEXT
    );

    CREATE TABLE IF NOT EXISTS Flight (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER NOT NULL,
      airline TEXT,
      flightNumber TEXT,
      departureCity TEXT,
      departureAirport TEXT,
      departureDate TEXT,
      departureTime TEXT,
      arrivalCity TEXT,
      arrivalAirport TEXT,
      arrivalDate TEXT,
      arrivalTime TEXT,
      layoverCity TEXT,
      layoverAirport TEXT,
      layoverDuration TEXT,
      FOREIGN KEY (tripId) REFERENCES Trip(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Accommodation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      city TEXT,
      checkInDate TEXT,
      checkOutDate TEXT,
      checkInTime TEXT,
      checkOutTime TEXT,
      bookingRef TEXT,
      notes TEXT,
      FOREIGN KEY (tripId) REFERENCES Trip(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER NOT NULL,
      name TEXT NOT NULL,
      date TEXT,
      time TEXT,
      location TEXT,
      FOREIGN KEY (tripId) REFERENCES Trip(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Budget (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      currency TEXT,
      category TEXT,
      date TEXT,
      FOREIGN KEY (tripId) REFERENCES Trip(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS PackingItem (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      packed INTEGER NOT NULL DEFAULT 0
        CHECK (packed IN (0, 1)),
      FOREIGN KEY (tripId) REFERENCES Trip(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS TravelDiary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER NOT NULL,
      title TEXT,
      text TEXT,
      date TEXT,
      photo TEXT,
      FOREIGN KEY (tripId) REFERENCES Trip(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Bucketlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER NOT NULL,
      place TEXT NOT NULL,
      description TEXT,
      visited INTEGER NOT NULL DEFAULT 0
        CHECK (visited IN (0, 1)),
      FOREIGN KEY (tripId) REFERENCES Trip(id) ON DELETE CASCADE
    );
  `);
}

/* TRIP */

// Add a new trip
export async function addTrip(
  name,
  destination,
  startDate = null,
  endDate = null,
  bookingRef = null
) {
  const db = await dbConnection;

  const result = await db.runAsync(
    `INSERT INTO Trip (name, destination, startDate, endDate, bookingRef)
     VALUES (?, ?, ?, ?, ?);`,
    name,
    destination,
    startDate,
    endDate,
    bookingRef
  );

  return result.lastInsertRowId;
}

// Get all trips
export async function getTrips() {
  const db = await dbConnection;
  return await db.getAllAsync(
    'SELECT * FROM Trip ORDER BY startDate;'
  );
}

// Get one trip by its ID
export async function getTripById(tripId) {
  const db = await dbConnection;
  return await db.getFirstAsync(
    'SELECT * FROM Trip WHERE id = ?;',
    tripId
  );
}

// Delete a trip and its related records
export async function deleteTrip(tripId) {
  const db = await dbConnection;
  return await db.runAsync(
    'DELETE FROM Trip WHERE id = ?;',
    tripId
  );
}


/* FLIGHT */

// Add a flight to a trip
export async function addFlight(tripId, flight) {
  const db = await dbConnection;

  const result = await db.runAsync(
    `INSERT INTO Flight (
      tripId, airline, flightNumber,
      departureCity, departureAirport, departureDate, departureTime,
      arrivalCity, arrivalAirport, arrivalDate, arrivalTime,
      layoverCity, layoverAirport, layoverDuration
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    tripId,
    flight.airline ?? null,
    flight.flightNumber ?? null,
    flight.departureCity ?? null,
    flight.departureAirport ?? null,
    flight.departureDate ?? null,
    flight.departureTime ?? null,
    flight.arrivalCity ?? null,
    flight.arrivalAirport ?? null,
    flight.arrivalDate ?? null,
    flight.arrivalTime ?? null,
    flight.layoverCity ?? null,
    flight.layoverAirport ?? null,
    flight.layoverDuration ?? null
  );

  return result.lastInsertRowId;
}

// Get all flights for a trip
export async function getFlightsByTrip(tripId) {
  const db = await dbConnection;
  return await db.getAllAsync(
    'SELECT * FROM Flight WHERE tripId = ? ORDER BY departureDate;',
    tripId
  );
}


/* ACCOMMODATION */

// Add accommodation to a trip
export async function addAccommodation(tripId, accommodation) {
  const db = await dbConnection;

  const result = await db.runAsync(
    `INSERT INTO Accommodation (
      tripId, name, address, city,
      checkInDate, checkOutDate, checkInTime, checkOutTime,
      bookingRef, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    tripId,
    accommodation.name,
    accommodation.address ?? null,
    accommodation.city ?? null,
    accommodation.checkInDate ?? null,
    accommodation.checkOutDate ?? null,
    accommodation.checkInTime ?? null,
    accommodation.checkOutTime ?? null,
    accommodation.bookingRef ?? null,
    accommodation.notes ?? null
  );

  return result.lastInsertRowId;
}

// Get accommodation for a trip
export async function getAccommodationsByTrip(tripId) {
  const db = await dbConnection;
  return await db.getAllAsync(
    'SELECT * FROM Accommodation WHERE tripId = ? ORDER BY checkInDate;',
    tripId
  );
}


/* ACTIVITY */

// Add an activity to a trip
export async function addActivity(tripId, activity) {
  const db = await dbConnection;

  const result = await db.runAsync(
    `INSERT INTO Activity (tripId, name, date, time, location)
     VALUES (?, ?, ?, ?, ?);`,
    tripId,
    activity.name,
    activity.date ?? null,
    activity.time ?? null,
    activity.location ?? null
  );

  return result.lastInsertRowId;
}

// Get activities for a trip
export async function getActivitiesByTrip(tripId) {
  const db = await dbConnection;
  return await db.getAllAsync(
    'SELECT * FROM Activity WHERE tripId = ? ORDER BY date, time;',
    tripId
  );
}


/* BUDGET */

// Add a budget entry to a trip
export async function addBudgetEntry(tripId, budget) {
  const db = await dbConnection;

  const result = await db.runAsync(
    `INSERT INTO Budget (
      tripId, description, amount, currency, category, date
    ) VALUES (?, ?, ?, ?, ?, ?);`,
    tripId,
    budget.description ?? null,
    budget.amount,
    budget.currency ?? null,
    budget.category ?? null,
    budget.date ?? null
  );

  return result.lastInsertRowId;
}

// Get budget entries for a trip
export async function getBudgetEntriesByTrip(tripId) {
  const db = await dbConnection;
  return await db.getAllAsync(
    'SELECT * FROM Budget WHERE tripId = ? ORDER BY date;',
    tripId
  );
}


/* PACKING LIST */

// Add an item to a trip's packing list
export async function addPackingItem(tripId, item) {
  const db = await dbConnection;

  const result = await db.runAsync(
    `INSERT INTO PackingItem (tripId, name, category, quantity, packed)
     VALUES (?, ?, ?, ?, ?);`,
    tripId,
    item.name,
    item.category ?? null,
    item.quantity ?? 1,
    item.packed ? 1 : 0
  );

  return result.lastInsertRowId;
}

// Get packing items for a trip
export async function getPackingItemsByTrip(tripId) {
  const db = await dbConnection;
  return await db.getAllAsync(
    'SELECT * FROM PackingItem WHERE tripId = ? ORDER BY name;',
    tripId
  );
}

// Mark a packing item as packed or unpacked
export async function updatePackingItemStatus(itemId, packed) {
  const db = await dbConnection;
  return await db.runAsync(
    'UPDATE PackingItem SET packed = ? WHERE id = ?;',
    packed ? 1 : 0,
    itemId
  );
}


/* TRAVEL DIARY */

// Add a diary entry, with an optional picture location
export async function addDiaryEntry(tripId, entry) {
  const db = await dbConnection;

  const result = await db.runAsync(
    `INSERT INTO TravelDiary (tripId, title, text, date, photo)
     VALUES (?, ?, ?, ?, ?);`,
    tripId,
    entry.title ?? null,
    entry.text ?? null,
    entry.date ?? null,
    entry.photo ?? null
  );

  return result.lastInsertRowId;
}

// Get diary entries for a trip
export async function getDiaryEntriesByTrip(tripId) {
  const db = await dbConnection;
  return await db.getAllAsync(
    'SELECT * FROM TravelDiary WHERE tripId = ? ORDER BY date;',
    tripId
  );
}


/* BUCKET LIST */

// Add a place to a trip's bucket list
export async function addBucketlistItem(tripId, item) {
  const db = await dbConnection;

  const result = await db.runAsync(
    `INSERT INTO Bucketlist (tripId, place, description, visited)
     VALUES (?, ?, ?, ?);`,
    tripId,
    item.place,
    item.description ?? null,
    item.visited ? 1 : 0
  );

  return result.lastInsertRowId;
}

// Get bucket-list items for a trip
export async function getBucketlistByTrip(tripId) {
  const db = await dbConnection;
  return await db.getAllAsync(
    'SELECT * FROM Bucketlist WHERE tripId = ? ORDER BY place;',
    tripId
  );
}

// Mark a bucket-list place as visited or not visited
export async function updateBucketlistStatus(itemId, visited) {
  const db = await dbConnection;
  return await db.runAsync(
    'UPDATE Bucketlist SET visited = ? WHERE id = ?;',
    visited ? 1 : 0,
    itemId
  );
}