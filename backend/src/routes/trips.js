const express = require("express");
const router = express.Router();

const db = require("../database/database");
//const trips = require("../data/data");


// get all trips
router.get("/", (req, res) => {
    const trips = db.prepare("SELECT * FROM Trip ORDER BY id").all();
    res.json(trips);
});

// get one trip
router.get("/:id", (req, res) => {
    const id = Number(req.params.id);

    const trip = db.prepare("SELECT * FROM Trip WHERE id = ?").get(id);

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

    const {name,destinationCity,destinationCountry,bookingRef,startDate,endDate,destinationPicture,destinationFlag} = req.body;

    if (!name || !destinationCity || !destinationCountry || !startDate || !endDate) {
        return res.status(400).json({
            message: "Please fill out name, destination city and country, start date and end date."
        });
    }

    const result = db.prepare(`
        INSERT INTO Trip (
            name, destinationCity, destinationCountry, bookingRef,
            startDate, endDate, destinationPicture, destinationFlag
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        name,
        destinationCity,
        destinationCountry,
        bookingRef || null,
        startDate,
        endDate,
        destinationPicture || null,
        destinationFlag || null
    );

    const newTrip = db.prepare("SELECT * FROM Trip WHERE id = ?")
        .get(result.lastInsertRowid);

    res.status(201).json(newTrip);
});

// edit trip
router.put("/:id", (req,res) => {
    const id = Number(req.params.id);

    const trip = db.prepare("SELECT * FROM Trip WHERE id = ?").get(id);

    // does trip exist
    if (!trip) {
        return res.status(404).json({
            message: "Trip was not found"
        });
    }

    const fields = [
        "name",
        "destinationCity",
        "destinationCountry",
        "bookingRef",
        "startDate",
        "endDate",
        "destinationPicture",
        "destinationFlag"
    ];

    const updates = [];
    const values = [];

    for (const field of fields) {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    }

    if (updates.length > 0) {
        db.prepare(`UPDATE Trip SET ${updates.join(", ")} WHERE id = ?`)
            .run(...values, id);
    }

    const updatedTrip = db.prepare("SELECT * FROM Trip WHERE id = ?").get(id);

    res.json(updatedTrip);
});

// delete trip

 // delete trip
router.delete("/:id", (req,res) => {
    const id = Number(req.params.id);

    const result = db.prepare("DELETE FROM Trip WHERE id = ?").run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            message: "Trip was not found"
        });
    }

    res.json({
        message: "Trip was deleted successfully!"
    });
});
module.exports = router;