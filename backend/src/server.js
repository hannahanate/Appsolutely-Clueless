const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const tripRoutes = require("./routes/trips");
const activityRoutes = require("./routes/activities");

app.use("/api/trips", tripRoutes);
app.use("/api", activityRoutes);

// Api check
app.get("/api/check", (req, res) => {
    res.json({
        status: "OK",
        message: "Travel app backend is working"
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});