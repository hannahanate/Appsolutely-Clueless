const express = require("express");
const router = express.Router();

const packingItems = require("../data/packing");
const trips = require("../data/data");

// getting items
router.get("/trips/:tripId/packing", (req, res) => {
    const tripId = Number(req.params.tripId);

    const tripExists = trips.some(trip => trip.id === tripId);

    if (!tripExists) {
        return res.status(404).json({
            message: "Trip not found"
        });
    }

    const items = packingItems.filter(item => item.tripId === tripId);

    res.json(items);
});

// add new packing item
router.post("/trips/:tripId/packing", (req, res) => {
    const tripId = Number(req.params.tripId);
    const { name, category = null, quantity = 1 } = req.body;

    const tripExists = trips.some(trip => trip.id === tripId);

    if (!tripExists) {
        return res.status(404).json({
            message: "Trip was not found"
        });
    }

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
            message: "Please add name"
        });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
            message: "Number has to be more than 0"
        });
    }

    if (
        category !== null &&
        typeof category !== "string"
    ) {
        return res.status(400).json({
            message: "Please write a category"
        });
    }

    const newItem = {
        id: packingItems.length > 0
            ? Math.max(...packingItems.map(item => item.id)) + 1
            : 1,
        tripId,
        name: name.trim(),
        category: category?.trim() || null,
        quantity,
        packed: false
    };

    packingItems.push(newItem);

    res.status(201).json(newItem);
});

// edit items
router.put("/packing/:id", (req, res) => {
    const id = Number(req.params.id);
    const item = packingItems.find(item => item.id === id);

    if (!item) {
        return res.status(404).json({
            message: "Packing item was not found"
        });
    }

    const { name, category = null, quantity, packed } = req.body;

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
            message: "Please add name"
        });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
            message: "Number has to be more than 0"
        });
    }

    if (
        category !== null &&
        typeof category !== "string"
    ) {
        return res.status(400).json({
            message: "Please write a category"
        });
    }

    if (packed !== undefined && typeof packed !== "boolean") {
        return res.status(400).json({
            message: "Item packed must be true or false"
        });
    }

    item.name = name.trim();
    item.category = category?.trim() || null;
    item.quantity = quantity;

    if (packed !== undefined) {
        item.packed = packed;
    }

    res.json(item);
});

// marking item packed or not
router.patch("/packing/:id", (req, res) => {
    const id = Number(req.params.id);
    const item = packingItems.find(item => item.id === id);

    if (!item) {
        return res.status(404).json({
            message: "Packing item was not found"
        });
    }

    const { packed } = req.body;

    if (typeof packed !== "boolean") {
        return res.status(400).json({
            message: "Item packed must be true or false"
        });
    }

    item.packed = packed;

    res.json(item);
});

// delete item
router.delete("/packing/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = packingItems.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Packing item was not found"
        });
    }

    const deletedItem = packingItems.splice(index, 1)[0];

    res.json({
        message: "Item was deleted successfully",
        item: deletedItem
    });
});

module.exports = router;
