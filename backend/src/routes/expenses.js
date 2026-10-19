const express = require("express");
const router = express.Router();

const db = require("../database");


//get all expenses per trip
router.get("/trips/:tripId/budget", (req,res) => {
    const tripId = Number(req.params.tripId);

    //read info from db
    const expenses = db.prepare(
        "SELECT * FROM Budget WHERE tripId = ?"
    ).all(tripId);

    res.json(expenses);
});

//add expense
router.post("/trips/:tripId/budget", (req,res) => {
    const tripId = Number(req.params.tripId);

    const {description, amount,currency,category,date}= req.body;

    if(!description|| amount === undefined || amount === null || amount === "" || !currency || !category || !date){
        return res.status(400).json({
            message: "Please fill all fields"
        });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0){
        return res.status(400).json({
            message: "Amount must be over 0"
        });
    }

    //saving values to db
    try {
        const result = db.prepare(`
            INSERT INTO Budget
            (tripId, description, amount, currency, category, date)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            tripId,
            description,
            Number(amount),
            currency,
            category,
            date
        );

        //adding new expense
        const newExpense = db.prepare(
            "SELECT * FROM Budget WHERE id = ?"
        ).get(result.lastInsertRowid);

        res.status(201).json(newExpense);
    } catch (error) {
        if (error.code === "ERR_SQLITE_CONSTRAINT_FOREIGNKEY") {
            return res.status(400).json({
                message: "Trip does not exist"
            });
        }

        console.error(error);
        res.status(500).json({
            message: "Error adding expense"
        });
    }
});

//edit expense
router.put("/budget/:id", (req,res) => {
    const id = Number(req.params.id);

    //read info from db
    const expense = db.prepare(
        "SELECT * FROM Budget WHERE id = ?"
    ).get(id);

    if(!expense){
        return res.status(404).json({
            message:"Expense was not found"
        });
    }

    const fields= [
        "description",
        "amount",
        "currency",
        "category",
        "date"
    ];

    const updates = fields.filter(
        field => req.body[field] !== undefined
    );

    if (updates.includes("amount")) {
        const amount = req.body.amount;

        if (
            amount === "" ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0
        ) {
            return res.status(400).json({
                message: "Amount must be higher than 0"
            });
        }
    }

    if (updates.length === 0) {
        return res.json(expense);
    }

    const setClause = updates
        .map(field => `"${field}" = ?`)
        .join(", ");

    const values = updates.map(field =>
        field === "amount"
            ? Number(req.body[field])
            : req.body[field]
    );

    //edit info to db
    db.prepare(
        `UPDATE Budget SET ${setClause} WHERE id = ?`
    ).run(...values, id);

    //save info to db
    const updatedExpense = db.prepare(
        "SELECT * FROM Budget WHERE id = ?"
    ).get(id);

    res.json(updatedExpense);
});

//delete expense
router.delete("/budget/:id", (req,res) => {
    const id = Number(req.params.id);

    //delete from db
    const result = db.prepare(
        "DELETE FROM Budget WHERE id = ?"
    ).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            message: "Expense was not found"
        });
    }

    res.json({
        message: "Expense deleted"
    });
});
module.exports = router;