const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};



module.exports.showListing = async (req, res, next) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ExpressError(404, "Listing Not Found");
    }

    const listing = await Listing.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }

    res.render("listings/show.ejs", { listing });
};






