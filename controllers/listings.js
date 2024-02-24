const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// 1. Index Route
module.exports.index = async (req, res) => {
  let listings = await Listing.find({});
  res.render("listings/index.ejs", { listings });
};

// 2. New Route
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// 3. Show Route
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  console.log(
    `Listing Requested :- ${listing.title} \nObject ID:- ${listing._id}\n`
  );
  res.render("listings/show.ejs", { listing });
};

// 4. Create Route
module.exports.createListing = async (req, res, next) => {
  let listing = req.body.listing;
  let newListing = new Listing(listing);

  let url = req.file.path;
  let filename = req.file.filename;
  let response = await geocodingClient
    .forwardGeocode({
      query: `${req.body.listing.location}, ${req.body.listing.country}`,
      limit: 1,
    })
    .send();

  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.body.features[0].geometry;

  let savedListing = await newListing.save();
  console.log(savedListing);

  req.flash("success", "New Listing Created!");
  res.redirect(`/listings/${newListing._id}`);
};

// 5. Edit Route
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_500");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// 6. Update Route
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = req.body.listing;
  let newListing = await Listing.findByIdAndUpdate(id, { ...listing });

  // Check if new image is uploaded
  // If yes, then change the link to the new image.
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    newListing.image = { url, filename };
    await newListing.save();
  }

  req.flash("update", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// 7. Delete Route
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(`Listing Deleted from Database\n\n${deletedListing}`);
  req.flash("deleted", "Listing Deleted");
  res.redirect("/listings");
};
