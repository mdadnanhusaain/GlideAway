// Packages
const express = require("express");
const router = express.Router();
const multer = require("multer");

// Custom Objects
const wrapAsync = require("../utils/wrapAsync.js");
const {
  validateListing,
  isLoggedIn,
  isOwner,
} = require("../middleware/middlewares.js");
const listingController = require("../controllers/listings.js");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  // 1. Index Route
  .get(wrapAsync(listingController.index))
  // 4. Create Route
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

router.get("/", wrapAsync(listingController.index));

// 2. New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  // 3. Show Route
  .get(wrapAsync(listingController.showListing))
  // 6. Update Route
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  // 7. Delete Route
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// 5. Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
