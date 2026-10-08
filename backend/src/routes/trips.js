const express = require("express");
const router = express.Router();

const trips = require("../data/data");

// GET all trips
router.get("/", (req, res) => {
    res.json(trips);
});

// GET one trip
router.get("/:id", (req, res) => {
    const id = Number(req.params.id);

    const trip = trips.find(trip => trip.id === id);

    if (!trip) {
        return res.status(404).json({
            message: "Trip not found"
        });
    }

    res.json(trip);
});

module.exports = router;