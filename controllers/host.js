const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});

module.exports.dashboard = async (req, res, next) => {
    try {

        // Current host ki total listings
        const listingCount = await Listing.countDocuments({
            owner: req.user._id
        });

        // Booking system abhi develop nahi hua
        const bookingCount = 0;
        const totalEarnings = 0;

        res.render("host/dashboard.ejs", {
            listingCount,
            bookingCount,
            totalEarnings
        });

    } catch (err) {
        next(err);
    }
};

module.exports.bookings = async (req, res, next) => {
    try {

        const bookings = [];

        res.render("host/bookings.ejs", {
            bookings
        });

    } catch (err) {
        next(err);
    }
};



module.exports.myListings = async (req, res, next) => {
    try {

        const listings = await Listing.find({
            owner: req.user._id
        }).sort({ _id: -1 });



        res.render("host/listings.ejs", {
            listings
        });

    } catch (err) {
        next(err);
    }
};



module.exports.showListing = async (req, res, next) => {
    try {

        const { id } = req.params;

        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: {
                    path: "author"
                }
            });

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/host/listings");
        }

        // Make sure this listing belongs to logged-in host
        if (!listing.owner.equals(req.user._id)) {
            req.flash("error", "You are not allowed to view this listing.");
            return res.redirect("/host/listings");
        }

        res.render("host/listing-details.ejs", {
            listing
        });

    } catch (err) {
        next(err);
    }
};

module.exports.renderEditForm = async (req, res, next) => {
    try {

        const { id } = req.params;

        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/host/listings");
        }

        // Only listing owner can edit
        if (!listing.owner.equals(req.user._id)) {
            req.flash("error", "You can only edit your own listing.");
            return res.redirect("/host/listings");
        }

        res.render("host/edit-listing.ejs", {
            listing
        });

    } catch (err) {
        next(err);
    }
};

module.exports.updateListing = async (req, res, next) => {
    try {

        const { id } = req.params;

        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/host/listings");
        }

        // Only owner can update
        if (!listing.owner.equals(req.user._id)) {
            req.flash("error", "You can only update your own listing.");
            return res.redirect("/host/listings");
        }

        listing.title = req.body.listing.title;
        listing.description = req.body.listing.description;
        listing.price = req.body.listing.price;
        listing.location = req.body.listing.location;
        listing.country = req.body.listing.country;

        // Update image only if new image is uploaded
        if (req.file) {

            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };

        }

        await listing.save();

        req.flash("success", "Listing updated successfully!");

        res.redirect(`/host/listings/${listing._id}`);

    } catch (err) {
        next(err);
    }
};

module.exports.deleteListing = async (req, res, next) => {
    try {

        const { id } = req.params;

        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/host/listings");
        }

        // Check ownership
        if (!listing.owner.equals(req.user._id)) {
            req.flash(
                "error",
                "You can only delete your own listing."
            );

            return res.redirect("/host/listings");
        }

        await Listing.findByIdAndDelete(id);

        req.flash(
            "success",
            "Listing deleted successfully!"
        );

        res.redirect("/host/listings");

    } catch (err) {
        next(err);
    }
};


// =========================
// NEW LISTING FORM
// =========================

module.exports.renderNewListingForm = (req, res) => {

    res.render("host/new-listing.ejs");

};


// =========================
// CREATE LISTING
// =========================

module.exports.createListing = async (req, res, next) => {

    try {

        const response = await geocodingClient
            .forwardGeocode({
                query: req.body.listing.location,
                limit: 1
            })
            .send();


        const newListing = new Listing(
            req.body.listing
        );


        // Owner
        newListing.owner = req.user._id;


        // Cloudinary Image
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };


        // Mapbox Geometry
        newListing.geometry =
            response.body.features[0].geometry;


        await newListing.save();


        req.flash(
            "success",
            "New listing created successfully!"
        );


        res.redirect("/host/listings");

    } catch (err) {

        next(err);

    }
};