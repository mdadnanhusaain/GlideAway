// Package
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Custom Objects
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const User = require("./models/user.js");

// Global variables
const port = 8080;
const database = "wanderlust";
const MONGO_URL = `mongodb://127.0.0.1:27017/${database}`;
const sessionOptions = {
  secret: "mdadnanhusaain",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// MongoDB Connection
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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.engine("ejs", ejsMate);
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// MIDDLEWARES

// Flash Message
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  // console.log(res.locals.success);
  res.locals.error = req.flash("error");
  res.locals.update = req.flash("update");
  res.locals.deleted = req.flash("deleted");
  next();
});

// ROUTES

// 1. Root Route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// 2. Listing
app.use("/listings", listingRouter);

// 3. Reviews
app.use("/listings/:id/reviews", reviewRouter);

// 4. User
app.use("/", userRouter);

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
