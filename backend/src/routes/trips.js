const express = require("express");
const router = express.Router();

const trips = require("../data/data");

// get all trips
router.get("/", (req, res) => {
    res.json(trips);
});

// get one trip
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

// create trip
router.post("/", (req,res) => {
    console.log("Received body:", req.body);

    const {name, destination, startDate, endDate, notes} = req.body;

    if (!name || !destination || !startDate || !endDate) {
        return res.status(400).json({
            message: "Please fill out name, destination, start date and end date."
        });
    }

    const newTrip = {
        id: trips.length + 1,
        name,
        destination,
        startDate,
        endDate,
        notes: notes || ""
    };

    trips.push(newTrip);
    res.status(201).json(newTrip);
});

// edit trip
router.put("/:id", (req,res) => {
    const id = Number(req.params.id);

    const trip = trips.find(trip => trip.id === id);

    // does trip exist
    if (!trip) {
        return res.status(404).json({
            message: "Trip was not found"
        });
    }

    const {name, destination, startDate, endDate, notes} = req.body;

    trip.name = name || trip.name;
    trip.destination = destination || trip.destination;
    trip.startDate = startDate || trip.startDate;
    trip.endDate = endDate || trip.endDate;
    trip.notes = notes !== undefined ? notes : trip.notes;

    res.json(trip);
});

// delete trip
router.delete("/:id", (req,res) => {
    const id = Number(req.params.id);

    const tripsIndex = trips.findIndex(trip => trip.id === id);

    if (tripsIndex === -1) {
        return res.status(404).json({
            message: "Trip was not found"
        });
    }

    trips.splice(tripsIndex, 1);

    res.json({
        message: "Trip was deleted successfully!"
    });
});
module.exports = router;