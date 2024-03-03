const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const database = "GlideAway";

async function main() {
  await mongoose.connect(`mongodb://127.0.0.1:27017/${database}`);
}

main()
  .then((res) => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.log(err);
  });

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "65c71e81d4daee8bb140d989",
  }));
  await Listing.insertMany(initData.data);
  console.log("Data is initialized successfully");
};

initDB();
