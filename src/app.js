const express = require("express");
const morgan = require("morgan");
const errorHandler = require("./middlewares/errorHandler.middleware");

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));

app.use(errorHandler);

module.exports = app;
