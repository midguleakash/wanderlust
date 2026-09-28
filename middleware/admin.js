module.exports.isAdmin = (req, res, next) => {

    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in.");
        return res.redirect("/login");
    }

    if (req.user.role !== "admin") {
        req.flash("error", "Access denied.");
        return res.redirect("/listings");
    }

    next();
};


module.exports.isSuperAdmin = (req, res, next) => {

    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in.");
        return res.redirect("/login");
    }

    if (req.user.role !== "superadmin") {
        req.flash("error", "Super Admin access required.");
        return res.redirect("/admin/dashboard");
    }

    next();
};

module.exports.isAdminOrSuperAdmin = (req, res, next) => {

    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in.");
        return res.redirect("/login");
    }

    if (
        req.user.role !== "admin" &&
        req.user.role !== "superadmin"
    ) {
        req.flash("error", "Admin access required.");
        return res.redirect("/listings");
    }

    next();
};