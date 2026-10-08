const express = require("express");
const router = express.Router();

const activities = require("../data/activities");

// get activity for one trip
router.get("/trips/:tripId/activities", (req, res) => {
    const tripId = Number(req.params.tripId);

    const tripActivities = activities.filter(
        activity => activity.tripId === tripId
    );

    res.json(tripActivities);
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
    const newActivity = {
        id: activities.length + 1,
        tripId,
        name,
        date,
        time: time || "",
        location: location || "",
        notes: notes || ""
    };

    activities.push(newActivity);
    res.status(201).json(newActivity);
})
module.exports = router;