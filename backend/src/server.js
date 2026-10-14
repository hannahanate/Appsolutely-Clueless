const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const tripRoutes = require("./routes/trips");
const activityRoutes = require("./routes/activities");
const expenseRoutes = require("./routes/expenses");
const packingRoutes = require("./routes/packing");
const flightRoutes = require("./routes/flights");

app.use("/api/trips", tripRoutes);
app.use("/api", activityRoutes);
app.use("/api", expenseRoutes);
app.use("/api", packingRoutes);
app.use("/api", flightRoutes);

// Api check
app.get("/api/check", (req, res) => {
    res.json({
        status: "OK",
        message: "Travel app backend is working"
    });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});