const express = require("express");
const router = express.Router();

const db = require("../database");

// Required flight fields
const requiredFields = [
    "airline",
    "flightNumber",
    "departureCity",
    "departureAirport",
    "departureDate",
    "departureTime",
    "arrivalCity",
    "arrivalAirport",
    "arrivalDate",
    "arrivalTime"
];

// Validate flight information
function validateFlight(body) {
    for (const field of requiredFields) {
        if (
            typeof body[field] !== "string" ||
            body[field].trim() === ""
        ) {
            return `${field} is required, please fill the info`;
        }
    }

    const optionalFields = [
        "layoverCity",
        "layoverAirport",
        "layoverDuration"
    ];

    for (const field of optionalFields) {
        if (
            body[field] !== undefined &&
            body[field] !== null &&
            typeof body[field] !== "string"
        ) {
            return `${field} must be text or left empty`;
        }
    }

    return null;
}

// Get all flights belonging to a trip
router.get("/trips/:tripId/flights", (req, res) => {
    const tripId = Number(req.params.tripId);

    if (!Number.isInteger(tripId)) {
        return res.status(400).json({
            message: "Invalid trip ID"
        });
    }

    try {
        const tripExists = db.prepare(
            "SELECT id FROM Trip WHERE id = ?"
        ).get(tripId);

        if (!tripExists) {
            return res.status(404).json({
                message: "Trip was not found"
            });
        }

        const tripFlights = db.prepare(`
            SELECT *
            FROM Flight
            WHERE tripId = ?
            ORDER BY id ASC
        `).all(tripId);

        return res.json(tripFlights);
    } catch (error) {
        console.error("Error getting flights:", error);

        return res.status(500).json({
            message: "Could not get flights"
        });
    }
});

// Add a flight to a trip
router.post("/trips/:tripId/flights", (req, res) => {
    const tripId = Number(req.params.tripId);

    if (!Number.isInteger(tripId)) {
        return res.status(400).json({
            message: "Invalid trip ID"
        });
    }

    const validationError = validateFlight(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    try {
        const tripExists = db.prepare(
            "SELECT id FROM Trip WHERE id = ?"
        ).get(tripId);

        if (!tripExists) {
            return res.status(404).json({
                message: "Trip was not found"
            });
        }

        const insertFlight = db.prepare(`
            INSERT INTO Flight (
                tripId,
                airline,
                flightNumber,
                departureCity,
                departureAirport,
                departureDate,
                departureTime,
                arrivalCity,
                arrivalAirport,
                arrivalDate,
                arrivalTime,
                layoverCity,
                layoverAirport,
                layoverDuration
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = insertFlight.run(
            tripId,
            req.body.airline.trim(),
            req.body.flightNumber.trim(),
            req.body.departureCity.trim(),
            req.body.departureAirport.trim(),
            req.body.departureDate.trim(),
            req.body.departureTime.trim(),
            req.body.arrivalCity.trim(),
            req.body.arrivalAirport.trim(),
            req.body.arrivalDate.trim(),
            req.body.arrivalTime.trim(),
            req.body.layoverCity?.trim() || null,
            req.body.layoverAirport?.trim() || null,
            req.body.layoverDuration?.trim() || null
        );

        const newFlight = db.prepare(
            "SELECT * FROM Flight WHERE id = ?"
        ).get(Number(result.lastInsertRowid));

        return res.status(201).json(newFlight);
    } catch (error) {
        console.error("Error adding flight:", error);

        return res.status(500).json({
            message: "Could not save flight"
        });
    }
});

// Edit a flight
router.put("/flights/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            message: "Invalid flight ID"
        });
    }

    const validationError = validateFlight(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    try {
        const flightExists = db.prepare(
            "SELECT id FROM Flight WHERE id = ?"
        ).get(id);

        if (!flightExists) {
            return res.status(404).json({
                message: "Flight was not found"
            });
        }

        db.prepare(`
            UPDATE Flight
            SET
                airline = ?,
                flightNumber = ?,
                departureCity = ?,
                departureAirport = ?,
                departureDate = ?,
                departureTime = ?,
                arrivalCity = ?,
                arrivalAirport = ?,
                arrivalDate = ?,
                arrivalTime = ?,
                layoverCity = ?,
                layoverAirport = ?,
                layoverDuration = ?
            WHERE id = ?
        `).run(
            req.body.airline.trim(),
            req.body.flightNumber.trim(),
            req.body.departureCity.trim(),
            req.body.departureAirport.trim(),
            req.body.departureDate.trim(),
            req.body.departureTime.trim(),
            req.body.arrivalCity.trim(),
            req.body.arrivalAirport.trim(),
            req.body.arrivalDate.trim(),
            req.body.arrivalTime.trim(),
            req.body.layoverCity?.trim() || null,
            req.body.layoverAirport?.trim() || null,
            req.body.layoverDuration?.trim() || null,
            id
        );

        const updatedFlight = db.prepare(
            "SELECT * FROM Flight WHERE id = ?"
        ).get(id);

        return res.json(updatedFlight);
    } catch (error) {
        console.error("Error updating flight:", error);

        return res.status(500).json({
            message: "Could not update flight"
        });
    }
});

// Delete a flight
router.delete("/flights/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            message: "Invalid flight ID"
        });
    }

    try {
        const flight = db.prepare(
            "SELECT * FROM Flight WHERE id = ?"
        ).get(id);

        if (!flight) {
            return res.status(404).json({
                message: "Flight was not found"
            });
        }

        db.prepare(
            "DELETE FROM Flight WHERE id = ?"
        ).run(id);

        return res.json({
            message: "Flight info deleted successfully",
            flight
        });
    } catch (error) {
        console.error("Error deleting flight:", error);

        return res.status(500).json({
            message: "Could not delete flight"
        });
    }
});

module.exports = router;
