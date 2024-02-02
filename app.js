// Requiring package
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

// Requiring custom js objects
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

// Declaring global variables
const port = 8080;
const database = "wanderlust";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.engine("ejs", ejsMate);

async function main() {
  await mongoose.connect(`mongodb://127.0.0.1:27017/${database}`);
}

main()
  .then((res) => {
    console.log("Successfully connected to Database");
  })
  .catch((err) => {
    console.log(err);
  });

// VALIDATION

// 1. Listing
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
// 2. Review
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// ROUTES

// Root Route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// 1. Listing

// 1.1. Index Route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    let listings = await Listing.find({});
    res.render("listings/index.ejs", { listings });
  })
);

// 1.2. New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// 1.3. Show Route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  })
);

// 1.4. Create Route
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    let listing = req.body.listing;
    let newListing = new Listing(listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

// 1.5. Edit Route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

// 1.6. Update Route
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = req.body.listing;
    await Listing.findByIdAndUpdate(id, { ...listing });
    res.redirect(`/listings/${id}`);
  })
);

// 1.7. Delete Route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(`Listing Deleted from Database\n\n${deletedListing}`);
    res.redirect("/listings");
  })
);

// 2. Reviews

// 2.1. Create Route
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review saved");

    res.redirect(`/listings/${id}`);
  })
);
// 2.2 Delete Route
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res, next) => {
    let { id, reviewId } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    let review = await Review.findByIdAndDelete(reviewId);

    console.log(`Review Deleted \n${review}\n\nListing Updated : ${listing}`);
    res.redirect(`/listings/${id}`);
  })
);

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
