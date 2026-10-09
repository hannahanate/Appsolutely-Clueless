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
    };

    activities.push(newActivity);
    res.status(201).json(newActivity);
});

//edit activity
router.put("/activities/:id", (req,res) => {
    const id = Number(req.params.id);

    const activity= activities.find(activity => activity.id === id);

    if(!activity){
        return res.status(404).json({
            message: "Activity was not found"
        });
    }

    const fields = ["name", "date", "time", "location"];
    for(const field of fields){
        if (req.body[field] !== undefined){
            activity[field] = req.body[field];
        }
    }
    res.json(activity);
});

//delete activity
router.delete("/activities/:id", (req,res) => {
    const id = Number(req.params.id);

    const index = activities.findIndex(activity => activity.id === id);

    if (index === -1){
        return res.status(404).json({
            message: "activity not found"
        });
    }

    activities.splice(index,1);
    res.json({
        message: "Activity was deleted suiccessfully"
    });
});
module.exports = router;