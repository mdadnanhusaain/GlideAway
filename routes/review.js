// Packages
const express = require("express");
const router = express.Router({ mergeParams: true });

// Custom Objects
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { reviewSchema } = require("../authentication/schema.js");

// Validation
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// 1. Create Route
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    console.log(id);
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review saved");
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${id}`);
  })
);

// 2 Delete Route
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res, next) => {
    let { id, reviewId } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    let review = await Review.findByIdAndDelete(reviewId);

    console.log(`Review Deleted \n${review}\n\nListing Updated : ${listing}`);
    req.flash("deleted", "Review Deleted!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
