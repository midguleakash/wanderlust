const express = require("express");

const router = express.Router();

const bookingController = require("../controllers/booking.js");

const { isLoggedIn } = require("../middleware.js");
const { isGuest } = require("../middleware/guest.js");
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


router.get(
    "/my",
    isGuest,
    bookingController.myBookings
);


router.patch(
    "/:id/cancel",
    isGuest,
    bookingController.cancelBooking
);

// =========================
// BOOKING DETAILS
// =========================

router.get("/:id/pay", isGuest, bookingController.createOrder);

router.post(
    "/:id/payment/verify",
    isGuest,
    bookingController.verifyPayment
);

router.get(
    "/:id",
    isLoggedIn,
    canViewBooking,
    bookingController.showBooking
);


module.exports = router;