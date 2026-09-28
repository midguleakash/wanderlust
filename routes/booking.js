const express = require("express");

const router = express.Router();

const bookingController =require("../controllers/booking.js");

const { isLoggedIn} = require("../middleware.js");
const { isGuest} = require("../middleware/guest.js");
const {
    canViewBooking
} = require("../middleware/booking.js");


// =========================
// BOOKING FORM
// =========================

router.get(
    "/new/:listingId",
    isLoggedIn,
    isGuest,
    bookingController.renderBookingForm
);


// =========================
// CREATE BOOKING
// =========================

router.post(
    "/",
    isLoggedIn,
    isGuest,
    bookingController.createBooking
);


// =========================
// BOOKING DETAILS
// =========================

router.get(
    "/:id",
    isLoggedIn,
    canViewBooking,
    bookingController.showBooking
);


module.exports = router;