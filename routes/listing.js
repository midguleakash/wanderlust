const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listings.js");

const { canViewListings } = require("../middleware.js");


// Home / All Listings
router.get(
    "/",
    canViewListings,
    wrapAsync(listingController.index)
);


// Particular Listing - Public
router.get(
    "/:id",
    wrapAsync(listingController.showListing)
);

module.exports = router;