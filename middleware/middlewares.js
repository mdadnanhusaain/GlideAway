const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../authentication/schema.js");

// Login Validation
module.exports.isLoggedIn = (req, res, next) => {
  console.log(`Current User :- ${req.user}`);
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create listing!");
    return res.redirect("/login");
  }
  next();
};

// Saving source URL
module.exports.saveRedirectUrl = async (req, res, next) => {
  try {
    if (!req.session.redirectUrl) {
      console.log(`Invalid Redirect URL:- ${req.session.redirectUrl}`);
      throw new Error();
    }
    let url = `${req.protocol}://${req.get("host")}${req.session.redirectUrl}`;
    console.log(`URL : ${url}`);
    const response = await fetch(url);
    if (response.status < 400) {
      res.locals.redirectUrl = req.session.redirectUrl;
    }
  } catch (err) {
    res.locals.redirectUrl = "/listings";
  }
  next();
};

// Owner Validation
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  console.log(
    `Listing Owner ID : ${listing.owner._id} \nCurrent user ID : ${res.locals.currUser._id}`
  );
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this Listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// Author Validation
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  console.log(
    `Review Author ID : ${review.author._id} \nCurrent user ID : ${res.locals.currUser._id}`
  );
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the Author of this Review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// Listing Validation
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Review Validation
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
