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
const accomodationRoutes = require("./routes/accomodation");

app.use("/api/trips", tripRoutes);
app.use("/api", activityRoutes);
app.use("/api", expenseRoutes);
app.use("/api", packingRoutes);
app.use("/api", flightRoutes);
app.use("/api", accomodationRoutes);

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