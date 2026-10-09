const express = require("express");
const router = express.Router();

const expenses = require("../data/expenses");


//get all expenses per trip
router.get("/trips/:tripId/budget", (req,res) => {
    const tripId = Number(req.params.tripId);

    const tripExpenses = expenses.filter(
        expense => expense.tripId === tripId
    );
    res.json(tripExpenses);
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

    const newExpense = {
        id: expenses.length + 1,
        tripId,
        description,
        amount: Number(amount),
        currency,
        category,
        date
    };
    expenses.push(newExpense);
    res.status(201).json(newExpense);
});

module.exports = router;