const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const defaultLink =
  "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=1769&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const ListingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    url: {
      type: String,
      default: defaultLink,
      set: (v) => (v === "" ? defaultLink : v),
    },
    filename: {
      type: String,
      default: "listingimage",
    },
  },
  price: {
    type: Number,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  filter: [
    {
      type: String,
      required: true,
    },
  ],
});

ListingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    let result = await Review.deleteMany({ _id: { $in: listing.reviews } });
    console.log(`Listing ${listing} deleted\nReviews Deleted:-  ${result}`);
  }
});

const Listing = mongoose.model("Listing", ListingSchema);

module.exports = Listing;
