const Booking = require("../models/booking.js");

module.exports.canViewBooking = async (req, res, next) => {

    try {

        if (!req.isAuthenticated()) {
            req.flash("error", "Please login first.");
            return res.redirect("/login");
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            req.flash("error", "Booking not found.");
            return res.redirect("/listings");
        }


        // Guest → only their own booking
        if (req.user.role === "guest") {

            if (booking.guest.equals(req.user._id)) {
                req.booking = booking;
                return next();
            }

        }


        // Host → only booking of their own listing
        if (req.user.role === "host") {

            if (booking.host.equals(req.user._id)) {
                req.booking = booking;
                return next();
            }

        }


        // Admin / Super Admin / other users
        req.flash(
            "error",
            "You are not allowed to view this booking."
        );

        return res.redirect("/listings");

    } catch (err) {

        next(err);

    }
};