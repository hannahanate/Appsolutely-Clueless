const express = require("express");
const router = express.Router();

const db = require("../database");

// Accommodation info
const requiredFields = [
    "name",
    "address",
    "city",
    "checkInDate",
    "checkOutDate",
    "checkInTime",
    "checkOutTime"
];

// Checking that all important fields are filled
function validateAccomodation(body) {
    for (const field of requiredFields) {
        if (
            typeof body[field] !== "string" ||
            body[field].trim() === ""
        ) {
            return `${field} is required, please fill the info`;
        }
    }

    // Optional info
    const optionalFields = [
        "bookingRef",
        "notes"
    ];

    for (const field of optionalFields) {
        if (
            body[field] !== undefined &&
            body[field] !== null &&
            typeof body[field] !== "string"
        ) {
            return `${field} must be in writing or left empty`;
        }
    }

    return null;
}

// Getting accommodation info
router.get("/trips/:tripId/accomodation", (req, res) => {
    const tripId = Number(req.params.tripId);

    if (!Number.isInteger(tripId) || tripId <= 0) {
        return res.status(400).json({
            message: "Invalid trip ID"
        });
    }

    const trip = db.prepare(
        "SELECT id FROM Trip WHERE id = ?"
    ).get(tripId);

    if (!trip) {
        return res.status(404).json({
            message: "Trip was not found"
        });
    }

    const tripAccomodation = db.prepare(
        "SELECT * FROM Accommodation WHERE tripId = ?"
    ).all(tripId);

    return res.json(tripAccomodation);
});

// Add accommodation info to the trip
router.post("/trips/:tripId/accomodation", (req, res) => {
    const tripId = Number(req.params.tripId);

    if (!Number.isInteger(tripId) || tripId <= 0) {
        return res.status(400).json({
            message: "Invalid trip ID"
        });
    }

    const trip = db.prepare(
        "SELECT id FROM Trip WHERE id = ?"
    ).get(tripId);

    if (!trip) {
        return res.status(404).json({
            message: "Trip was not found"
        });
    }

    // If validation fails
    const validationError = validateAccomodation(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const newAccomodation = {
        tripId,
        name: req.body.name.trim(),
        address: req.body.address.trim(),
        city: req.body.city.trim(),
        checkInDate: req.body.checkInDate.trim(),
        checkOutDate: req.body.checkOutDate.trim(),
        checkInTime: req.body.checkInTime.trim(),
        checkOutTime: req.body.checkOutTime.trim(),
        bookingRef: req.body.bookingRef?.trim() || null,
        notes: req.body.notes?.trim() || null
    };

    const result = db.prepare(`
        INSERT INTO Accommodation (
            tripId,
            name,
            address,
            city,
            checkInDate,
            checkOutDate,
            checkInTime,
            checkOutTime,
            bookingRef,
            notes
        )
        VALUES (
            @tripId,
            @name,
            @address,
            @city,
            @checkInDate,
            @checkOutDate,
            @checkInTime,
            @checkOutTime,
            @bookingRef,
            @notes
        )
    `).run(newAccomodation);

    const savedAccomodation = db.prepare(
        "SELECT * FROM Accommodation WHERE id = ?"
    ).get(Number(result.lastInsertRowid));

    return res.status(201).json(savedAccomodation);
});

// Edit accommodation info
router.put("/accomodation/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid accommodation ID"
        });
    }

    const foundAccomodation = db.prepare(
        "SELECT * FROM Accommodation WHERE id = ?"
    ).get(id);

    if (!foundAccomodation) {
        return res.status(404).json({
            message: "Accommodation was not found"
        });
    }

    const validationError = validateAccomodation(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const updatedAccomodation = {
        id,
        name: req.body.name.trim(),
        address: req.body.address.trim(),
        city: req.body.city.trim(),
        checkInDate: req.body.checkInDate.trim(),
        checkOutDate: req.body.checkOutDate.trim(),
        checkInTime: req.body.checkInTime.trim(),
        checkOutTime: req.body.checkOutTime.trim(),
        bookingRef: req.body.bookingRef?.trim() || null,
        notes: req.body.notes?.trim() || null
    };

    db.prepare(`
        UPDATE Accommodation
        SET name = @name,
            address = @address,
            city = @city,
            checkInDate = @checkInDate,
            checkOutDate = @checkOutDate,
            checkInTime = @checkInTime,
            checkOutTime = @checkOutTime,
            bookingRef = @bookingRef,
            notes = @notes
        WHERE id = @id
    `).run(updatedAccomodation);

    const savedAccomodation = db.prepare(
        "SELECT * FROM Accommodation WHERE id = ?"
    ).get(id);

    return res.json(savedAccomodation);
});

// Delete accommodation info
router.delete("/accomodation/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid accommodation ID"
        });
    }

    const foundAccomodation = db.prepare(
        "SELECT * FROM Accommodation WHERE id = ?"
    ).get(id);

    if (!foundAccomodation) {
        return res.status(404).json({
            message: "Accommodation was not found"
        });
    }

    db.prepare(
        "DELETE FROM Accommodation WHERE id = ?"
    ).run(id);

    return res.json({
        message: "Accommodation info was deleted successfully",
        accomodation: foundAccomodation
    });
});

module.exports = router;