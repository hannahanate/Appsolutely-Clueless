const express = require("express");
const router = express.Router();


const trips = require("../data/data");
const accomodation = require("../data/accomodation");

// Accomodation info
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

    //optional info
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

// getting accomodation info
router.get("/trips/:tripId/accomodation", (req, res) => {
    const tripId = Number(req.params.tripId);

    const tripExists = trips.some(
        trip => trip.id === tripId
    );

    if (!Number.isInteger(tripId) || !tripExists) {
        return res.status(404).json({
            message: "Trip was not found"
        });
    }

    const tripAccomodation = accomodation.filter(
        accomodation => accomodation.tripId === tripId
    );

    return res.json(tripAccomodation);
});

// Add accomodation info to the trip
router.post("/trips/:tripId/accomodation", (req, res) => {
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
    const validationError = validateAccomodation(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const newAccomodation = {
        id: accomodation.length + 1,

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

    accomodation.push(newAccomodation);

    return res.status(201).json(newAccomodation);
});

// edit accomodations info
router.put("/accomodation/:id", (req, res) => {
    const id = Number(req.params.id);

    const foundAccomodation = accomodation.find(
        accomodation => accomodation.id === id
    );

    if (!Number.isInteger(id) || !foundAccomodation) {
        return res.status(404).json({
            message: "Áccomodation was not found"
        });
    }

    const validationError = validateAccomodation(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    foundAccomodation.name= req.body.name.trim(),
    foundAccomodation.address= req.body.address.trim(),
    foundAccomodation.city= req.body.city.trim(),
    foundAccomodation.checkInDate= req.body.checkInDate.trim(),
    foundAccomodation.checkOutDate= req.body.checkOutDate.trim(),
    foundAccomodation.checkInTime= req.body.checkInTime.trim(),
    foundAccomodation.checkOutTime= req.body.checkOutTime.trim(),

    foundAccomodation.bookingRef= req.body.bookingRef?.trim() || null,
    foundAccomodation.notes= req.body.notes?.trim() || null

    return res.json(foundAccomodation);

});

// delete accomodation info
router.delete("/accomodation/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = accomodation.findIndex(
        accomodation => accomodation.id === id
    );

    if (!Number.isInteger(id) || index === -1) {
        return res.status(404).json({
            message: "Accomodation was not found"
        });
    }

    const deletedAccomodation = accomodation.splice(index, 1)[0];

    return res.json({
        message: "Accomodations info was deleted successfully",
        accomodation: deletedAccomodation
    });
});

module.exports = router;
