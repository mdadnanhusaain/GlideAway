const mongoose = require("mongoose");

const Listing = require("../../models/listing.js");
const Review = require("../../models/review.js");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

main()
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

const listCheck = async () => {
  let result = await Listing.findById("65bdc24613c9fd4a5bfe0569").populate(
    "reviews"
  );
  console.log(result);
};

listCheck();
