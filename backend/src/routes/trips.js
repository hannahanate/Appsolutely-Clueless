const express = require("express");
const router = express.Router();

const db = require("../database");

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

// get all trips from db
router.get("/", (req, res) => {
    try {
        //getting trips from db
        const trips = db.prepare("SELECT * FROM Trip ORDER BY id").all();
        //results in json
        res.json(trips);
    } catch (error) {
        console.error("Error getting all the trips:", error);
        res.status(500).json({ message: "Failed to load the trips" });
    }
});

// get one trip
router.get("/:id", (req, res) => {
    const id = Number(req.params.id);

    //validating trip id
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Incorrect trip ID" });
    }

    //getting the selected trip ID from db
    try {
        const trip = db.prepare("SELECT * FROM Trip WHERE id = ?").get(id);

        if (!trip) {
            return res.status(404).json({ message: "Trip was not found" });
        }

        //results in json
        res.json(trip);
    } catch (error) {
        console.error("Error getting the trip:", error);
        res.status(500).json({ message: "Getting the trip failed" });
    }
});


// create trip
router.post("/", (req,res) => {

    //requested fields
    const {name,destinationCity,destinationCountry,bookingRef,startDate,endDate,destinationPicture,destinationFlag} = req.body;

    if (!name || !destinationCity || !destinationCountry || !startDate || !endDate) {
        return res.status(400).json({
            message: "Please fill out name, destination city and country, start date and end date."
        });
    }

    //prepared statement for creating a new trip
    try {
        const result = db.prepare(`
            INSERT INTO Trip (
                name, destinationCity, destinationCountry,
                bookingRef, startDate, endDate,
                destinationPicture, destinationFlag
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            name,
            destinationCity,
            destinationCountry,
            bookingRef ?? null,
            startDate,
            endDate,
            destinationPicture ?? null,
            destinationFlag ?? null
        );

        //getting the newly created trip
        const newTrip = db.prepare(
            "SELECT * FROM Trip WHERE id = ?"
        ).get(result.lastInsertRowid);

        res.status(201).json(newTrip);
    } catch (error) {
        console.error("Error creating a trip:", error);
        res.status(500).json({ message: "Failed to create a new trip" });
    }
});

// edit trip
router.put("/:id", (req,res) => {
    const id = Number(req.params.id);

    // does trip exist
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Incorrect trip ID" });
    }

    //getting info from database with trip ID
    try {
        const trip = db.prepare("SELECT * FROM Trip WHERE id = ?").get(id);

        if (!trip) {
            return res.status(404).json({ message: "Trip was not found" });
        }

        const updates = fields.filter(field => req.body[field] !== undefined);

        if (updates.length === 0) {
            return res.status(400).json({
                message: "Error for the updated fields"
            });
        }

        //which fields will be updated
        const setClause = updates.map(field => `"${field}" = ?`).join(", ");
        //collecting info user added
        const values = updates.map(field => req.body[field]);

        //sending db the updating request
        db.prepare(`UPDATE Trip SET ${setClause} WHERE id = ?`)
            .run(...values, id);

        const updatedTrip = db.prepare(
            "SELECT * FROM Trip WHERE id = ?"
        ).get(id);

        res.json(updatedTrip);
    } catch (error) {
        console.error("Error updating trip:", error);
        res.status(500).json({ message: "Failed to update trip" });
    }
});


// delete trip
router.delete("/:id", (req,res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Incorrect trip ID" });
    }

    //delete the row from db with trip id
    try {
        const result = db.prepare("DELETE FROM Trip WHERE id = ?").run(id);

        if (result.changes === 0) {
            return res.status(404).json({ message: "Trip was not found" });
        }

        res.json({ message: "Trip was deleted successfully!" });
    } catch (error) {
        console.error("Error deleting trip:", error);
        res.status(500).json({ message: "Failed to delete trip" });
    }
});

module.exports = router;