module.exports.isGuest = (req, res, next) => {

    if (!req.isAuthenticated()) {
        req.flash("error", "Please login first.");
        return res.redirect("/login");
    }

    if (req.user.role !== "guest") {

        req.flash(
            "error",
            "Only guests can make bookings."
        );

        // Host
        if (req.user.role === "host") {
            return res.redirect("/host/dashboard");
        }

        // Admin
        if (req.user.role === "admin") {
            return res.redirect("/admin/dashboard");
        }

        // Super Admin
        if (req.user.role === "superadmin") {
            return res.redirect("/admin/dashboard");
        }

        // Unknown role
        return res.redirect("/listings");
    }

    next();
};
