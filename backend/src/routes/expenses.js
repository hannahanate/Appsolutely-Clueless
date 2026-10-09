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

//edit expense
router.put("/budget/:id", (req,res) => {
    const id = Number(req.params.id);

    const expense= expenses.find(expense => expense.id === id);

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

    for (const field of fields){
        if (req.body[field] !== undefined){
            expense[field] = req.body[field ];
        }
    }

    if (!Number.isFinite(Number(expense.amount))||
        Number()
    ){
        return res.status(400).json({
            message: "Amount must be a number greater than zero"
        });
    }

    expense.amount = Number(expense.amount);

    res.json(expense);
});

//delete expense
router.delete("/budget/:id", (req,res) => {
    const id = Number(req.params.id);

    const index = expenses.findIndex(
        expense => expense.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Expense does not exist"
        });
    }

    expenses.splice(index, 1);

    res.json({
        message: "Expense deleted"
    });
});
module.exports = router;