const express = require("express");
const router = express.Router();
const db = require("../database");

// get activity for one trip
router.get("/trips/:tripId/activities", (req, res) => {
    const tripId = Number(req.params.tripId);

    //read info from db
    const activities = db.prepare(
        "SELECT * FROM Activity WHERE tripId = ?"
    ).all(tripId);

    res.json(activities);
});

// create activity
router.post("/trips/:tripId/activities", (req,res) => {
    const tripId = Number(req.params.tripId);

    const {name, date, time, location, notes} = req.body;

    if (!name || !date){
        return res.status(400).json({
            message: "Date and name for activity is required"
        });
    }

    //save info to db
    try {
        const result = db.prepare(`
            INSERT INTO Activity
            (tripId, name, date, time, location, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            tripId,
            name,
            date,
            time || null,
            location || null,
            notes || null
        );

        //read new activity from db
        const newActivity = db.prepare(
            "SELECT * FROM Activity WHERE id = ?"
        ).get(result.lastInsertRowid);

        res.status(201).json(newActivity);
    } catch (error) {
        if (error.code === "ERR_SQLITE_CONSTRAINT_FOREIGNKEY") {
            return res.status(400).json({
                message: "Error finding the trip"
            });
        }

        console.error(error);
        res.status(500).json({
            message: "Problem adding activity"
        });
    }
});

//edit activity
router.put("/activities/:id", (req,res) => {
    const id = Number(req.params.id);

    //read info from db before editing
    const activity = db.prepare(
        "SELECT * FROM Activity WHERE id = ?"
    ).get(id);

    if(!activity){
        return res.status(404).json({
            message: "Activity was not found"
        });
    }

    const fields = ["name", "date", "time", "location"];
    
    const updates = fields.filter(
        field => req.body[field] !== undefined
    );

    //checking name and date
    if (
        updates.includes("name") && !req.body.name ||
        updates.includes("date") && !req.body.date
    ) {
        return res.status(400).json({
            message: "Please fill in name and date"
        });
    }

    if (updates.length === 0) {
        return res.json(activity);
    }

    const setClause = updates
        .map(field => `"${field}" = ?`)
        .join(", ");

    const values = updates.map(field => req.body[field]);

    //edit info to db
    db.prepare(
        `UPDATE Activity SET ${setClause} WHERE id = ?`
    ).run(...values, id);

    //read new info from db
    const updatedActivity = db.prepare(
        "SELECT * FROM Activity WHERE id = ?"
    ).get(id);

    res.json(updatedActivity);
});

//delete activity
router.delete("/activities/:id", (req,res) => {
    const id = Number(req.params.id);

    //delete from db
    const result = db.prepare(
        "DELETE FROM Activity WHERE id = ?"
    ).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            message: "Activity was not found"
        });
    }

    res.json({
        message: "Activity was deleted"
    });
});
module.exports = router;