
const express = require("express");
const router = express.Router();

const db = require("../database");

// getting items
router.get("/trips/:tripId/packing", (req, res) => {
    const tripId = Number(req.params.tripId);

    try {
        const trip = db.prepare(
            "SELECT id FROM Trip WHERE id = ?"
        ).get(tripId);

        if (!Number.isInteger(tripId) || tripId <= 0 || !trip) {
            return res.status(404).json({
                message: "Trip not found"
            });
        }

        const items = db.prepare(
            "SELECT * FROM PackingItem WHERE tripId = ? ORDER BY id"
        ).all(tripId);

        res.json(items);
    } catch (error) {
        console.error("Error getting packing items:", error);
        res.status(500).json({
            message: "Failed to load packing items"
        });
    }
});

// add new packing item
router.post("/trips/:tripId/packing", (req, res) => {
    const tripId = Number(req.params.tripId);
    const { name, category = null, quantity = 1 } = req.body;

    if (!Number.isInteger(tripId) || tripId <= 0) {
        return res.status(400).json({
            message: "Incorrect trip ID"
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

    if (category !== null && typeof category !== "string") {
        return res.status(400).json({
            message: "Please write a category"
        });
    }

    try {
        const trip = db.prepare(
            "SELECT id FROM Trip WHERE id = ?"
        ).get(tripId);

        if (!trip) {
            return res.status(404).json({
                message: "Trip was not found"
            });
        }

        const result = db.prepare(`
            INSERT INTO PackingItem (tripId, name, category, quantity, packed)
            VALUES (?, ?, ?, ?, 0)
        `).run(
            tripId,
            name.trim(),
            category?.trim() || null,
            quantity
        );

        const newItem = db.prepare(
            "SELECT * FROM PackingItem WHERE id = ?"
        ).get(result.lastInsertRowid);

        res.status(201).json(newItem);
    } catch (error) {
        console.error("Error adding packing item:", error);
        res.status(500).json({
            message: "Failed to add packing item"
        });
    }
});

// edit items
router.put("/packing/:id", (req, res) => {
    const id = Number(req.params.id);
    const { name, category = null, quantity, packed } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Incorrect packing item ID"
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

    if (category !== null && typeof category !== "string") {
        return res.status(400).json({
            message: "Please write a category"
        });
    }

    if (packed !== undefined && typeof packed !== "boolean") {
        return res.status(400).json({
            message: "Item packed must be true or false"
        });
    }

    try {
        const item = db.prepare(
            "SELECT * FROM PackingItem WHERE id = ?"
        ).get(id);

        if (!item) {
            return res.status(404).json({
                message: "Packing item was not found"
            });
        }

        db.prepare(`
            UPDATE PackingItem
            SET name = ?, category = ?, quantity = ?, packed = ?
            WHERE id = ?
        `).run(
            name.trim(),
            category?.trim() || null,
            quantity,
            packed === undefined ? item.packed : (packed ? 1 : 0),
            id
        );

        const updatedItem = db.prepare(
            "SELECT * FROM PackingItem WHERE id = ?"
        ).get(id);

        res.json(updatedItem);
    } catch (error) {
        console.error("Error updating packing item:", error);
        res.status(500).json({
            message: "Failed to update packing item"
        });
    }
});

// marking item packed or not
router.patch("/packing/:id", (req, res) => {
    const id = Number(req.params.id);
    const { packed } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Incorrect packing item ID"
        });
    }

    if (typeof packed !== "boolean") {
        return res.status(400).json({
            message: "Item packed must be true or false"
        });
    }

    try {
        const result = db.prepare(
            "UPDATE PackingItem SET packed = ? WHERE id = ?"
        ).run(packed ? 1 : 0, id);

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Packing item was not found"
            });
        }

        const updatedItem = db.prepare(
            "SELECT * FROM PackingItem WHERE id = ?"
        ).get(id);

        res.json(updatedItem);
    } catch (error) {
        console.error("Error changing packing status:", error);
        res.status(500).json({
            message: "Failed to update packing status"
        });
    }
});

// delete item
router.delete("/packing/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Incorrect packing item ID"
        });
    }

    try {
        const item = db.prepare(
            "SELECT * FROM PackingItem WHERE id = ?"
        ).get(id);

        if (!item) {
            return res.status(404).json({
                message: "Packing item was not found"
            });
        }

        db.prepare(
            "DELETE FROM PackingItem WHERE id = ?"
        ).run(id);

        res.json({
            message: "Item was deleted successfully",
            item
        });
    } catch (error) {
        console.error("Error deleting packing item:", error);
        res.status(500).json({
            message: "Failed to delete packing item"
        });
    }
});

module.exports = router;
