const express = require("express");
const morgan = require("morgan");
const authRoutes = require("./routes/auth.route");

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/v1/auth", authRoutes);

module.exports = app;
