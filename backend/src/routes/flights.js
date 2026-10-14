const express = require("express");
const router = express.Router();

const flights = require("../data/flights");
const trips = require("../data/data");

// Flight parameters
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

// Checking that all important fields are filled
function validateFlight(body) {
    for (const field of requiredFields) {
        if (
            typeof body[field] !== "string" ||
            body[field].trim() === ""
        ) {
            return `${field} is required, please fill the info`;
        }
    }

    //optional flight info
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
            return `${field} must be in writing or left empty`;
        }
    }

    return null;
}

// getting flight info
router.get("/trips/:tripId/flights", (req, res) => {
    const tripId = Number(req.params.tripId);

    const tripExists = trips.some(
        trip => trip.id === tripId
    );

    if (!Number.isInteger(tripId) || !tripExists) {
        return res.status(404).json({
            message: "Trip was not found"
        });
    }

    const tripFlights = flights.filter(
        flight => flight.tripId === tripId
    );

    return res.json(tripFlights);
});

// Adding flight info to the trip
router.post("/trips/:tripId/flights", (req, res) => {
    const tripId = Number(req.params.tripId);

    const tripExists = trips.some(
        trip => trip.id === tripId
    );

    if (!Number.isInteger(tripId) || !tripExists) {
        return res.status(404).json({
            message: "Trip was not found"
        });
    }

    // if validation fails
    const validationError = validateFlight(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const newFlight = {
        id: flights.length + 1,

        tripId,
        airline: req.body.airline.trim(),
        flightNumber: req.body.flightNumber.trim(),
        departureCity: req.body.departureCity.trim(),
        departureAirport: req.body.departureAirport.trim(),
        departureDate: req.body.departureDate.trim(),
        departureTime: req.body.departureTime.trim(),
        arrivalCity: req.body.arrivalCity.trim(),
        arrivalAirport: req.body.arrivalAirport.trim(),
        arrivalDate: req.body.arrivalDate.trim(),
        arrivalTime: req.body.arrivalTime.trim(),

        layoverCity: req.body.layoverCity?.trim() || null,
        layoverAirport: req.body.layoverAirport?.trim() || null,
        layoverDuration: req.body.layoverDuration?.trim() || null
    };

    flights.push(newFlight);

    return res.status(201).json(newFlight);
});

// edit flight info
router.put("/flights/:id", (req, res) => {
    const id = Number(req.params.id);

    const flight = flights.find(
        flight => flight.id === id
    );

    if (!Number.isInteger(id) || !flight) {
        return res.status(404).json({
            message: "Flight was not found"
        });
    }

    const validationError = validateFlight(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    flight.airline = req.body.airline.trim();
    flight.flightNumber = req.body.flightNumber.trim();
    flight.departureCity = req.body.departureCity.trim();
    flight.departureAirport = req.body.departureAirport.trim();
    flight.departureDate = req.body.departureDate.trim();
    flight.departureTime = req.body.departureTime.trim();
    flight.arrivalCity = req.body.arrivalCity.trim();
    flight.arrivalAirport = req.body.arrivalAirport.trim();
    flight.arrivalDate = req.body.arrivalDate.trim();
    flight.arrivalTime = req.body.arrivalTime.trim();

    flight.layoverCity = req.body.layoverCity?.trim() || null;
    flight.layoverAirport = req.body.layoverAirport?.trim() || null;
    flight.layoverDuration = req.body.layoverDuration?.trim() || null;

    return res.json(flight);
});

// delete flight
router.delete("/flights/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = flights.findIndex(
        flight => flight.id === id
    );

    if (!Number.isInteger(id) || index === -1) {
        return res.status(404).json({
            message: "Flight was not found"
        });
    }

    const deletedFlight = flights.splice(index, 1)[0];

    return res.json({
        message: "Flight info deleted successfully",
        flight: deletedFlight
    });
});

module.exports = router;
