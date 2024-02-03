// Package
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

// Custom Objects
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

// Global variables
const port = 8080;
const database = "wanderlust";
const MONGO_URL = `mongodb://127.0.0.1:27017/${database}`;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.engine("ejs", ejsMate);

async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then((res) => {
    console.log("Successfully connected to Database");
  })
  .catch((err) => {
    console.log(err);
  });

// ROUTES

// 1. Root Route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// 2. Listing
app.use("/listings", listings);

// 3. Reviews
app.use("/listings/:id/reviews", reviews);

// 404 Error handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Error handling Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(port, () => {
  console.log(`Server is listening to http://localhost:${port}`);
});
