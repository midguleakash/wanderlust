const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");


// =========================
// BOOKING FORM
// =========================

module.exports.renderBookingForm = async (req, res, next) => {

    try {

        const { listingId } = req.params;

        const listing = await Listing
            .findById(listingId)
            .populate("owner");

        if (!listing) {

            req.flash(
                "error",
                "Listing not found!"
            );

            return res.redirect("/listings");
        }

        res.render(
            "booking/new.ejs",
            { listing }
        );

    } catch (err) {

        next(err);

    }
};


// =========================
// CREATE BOOKING
// =========================

module.exports.createBooking = async (req, res, next) => {

    try {

        const { listingId, checkIn, checkOut, guests } = req.body;


        // =========================
        // FIND LISTING
        // =========================

        const listing = await Listing
            .findById(listingId)
            .populate("owner");


        if (!listing) {

            req.flash(
                "error",
                "Listing not found!"
            );

            return res.redirect("/listings");
        }


        // =========================
        // DATE CONVERSION
        // =========================

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);


        if (
            isNaN(checkInDate.getTime()) ||
            isNaN(checkOutDate.getTime())
        ) {

            req.flash(
                "error",
                "Please select valid dates."
            );

            return res.redirect(
                `/bookings/new/${listingId}`
            );
        }


        // =========================
        // REMOVE TIME
        // =========================

        checkInDate.setHours(0, 0, 0, 0);
        checkOutDate.setHours(0, 0, 0, 0);


        // =========================
        // TODAY
        // =========================

        const today = new Date();

        today.setHours(0, 0, 0, 0);


        // =========================
        // PAST DATE
        // =========================

        if (checkInDate < today) {

            req.flash(
                "error",
                "Check-in date cannot be in the past."
            );

            return res.redirect(
                `/bookings/new/${listingId}`
            );
        }


        // =========================
        // CHECK-OUT
        // =========================

        if (checkOutDate <= checkInDate) {

            req.flash(
                "error",
                "Check-out date must be after check-in date."
            );

            return res.redirect(
                `/bookings/new/${listingId}`
            );
        }


        // =========================
        // GUEST COUNT
        // =========================

        const guestCount = Number(guests);

        if (
            !Number.isInteger(guestCount) ||
            guestCount < 1 ||
            guestCount > 4
        ) {
            req.flash(
                "error",
                "Number of guests must be between 1 and 4."
            );

            return res.redirect(
                `/bookings/new/${listingId}`
            );
        }


        // =========================
        // CHECK DOUBLE BOOKING
        // =========================

        const conflictingBooking =
            await Booking.findOne({

                listing: listing._id,

                bookingStatus: {
                    $in: ["pending", "confirmed"]
                },

                checkIn: {
                    $lt: checkOutDate
                },

                checkOut: {
                    $gt: checkInDate
                }

            });


        if (conflictingBooking) {

            req.flash(
                "error",
                "This listing is already booked for the selected dates."
            );

            return res.redirect(
                `/bookings/new/${listingId}`
            );
        }


        // =========================
        // CALCULATE NIGHTS
        // =========================

        const difference =
            checkOutDate.getTime() -
            checkInDate.getTime();


        const nights =
            Math.ceil(
                difference /
                (1000 * 60 * 60 * 24)
            );


        // =========================
        // CALCULATE TOTAL
        // =========================

        const totalAmount =
            nights * listing.price;


        // =========================
        // CREATE BOOKING
        // =========================

        const booking = new Booking({

            guest: req.user._id,

            listing: listing._id,

            host: listing.owner._id,

            checkIn: checkInDate,

            checkOut: checkOutDate,

            guests: guestCount,

            nights: nights,

            totalAmount: totalAmount

        });


        await booking.save();


        // =========================
        // SUCCESS
        // =========================

        req.flash(
            "success",
            "Booking created successfully!"
        );


        res.redirect(
            `/bookings/${booking._id}`
        );


    } catch (err) {

        next(err);

    }
};


// =========================
// BOOKING DETAILS
// =========================

module.exports.showBooking = async (req, res, next) => {

    try {

        const { id } = req.params;

        const booking = await Booking
            .findById(id)
            .populate("listing")
            .populate("guest")
            .populate("host");


        if (!booking) {

            req.flash(
                "error",
                "Booking not found!"
            );

            return res.redirect("/listings");
        }


        // Guest or Host can view booking

        if (
            !booking.guest._id.equals(req.user._id) &&
            !booking.host._id.equals(req.user._id)
        ) {

            req.flash(
                "error",
                "You are not allowed to view this booking."
            );

            return res.redirect("/listings");
        }


        res.render(
            "booking/details.ejs",
            { booking }
        );

    } catch (err) {

        next(err);

    }
};


module.exports.myBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({
            guest: req.user._id
        })
        .populate("listing")
        .populate("host")
        .sort({ createdAt: -1 });

        res.render("booking/my-bookings.ejs", {
            bookings
        });

    } catch (err) {
        next(err);
    }
};