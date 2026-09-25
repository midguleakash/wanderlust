module.exports.isApprovedHost = (req, res, next) => {

    // // 1. Login check
    // if (!req.isAuthenticated()) {
    //     req.flash("error", "Please login first.");
    //     return res.redirect("/login");
    // }

    // // 2. Role check
    // if (req.user.role !== "host") {
    //     req.flash("error", "Host access required.");
    //     return res.redirect("/listings");
    // }

    // // 3. Approval check
    // if (!req.user.hostApproved) {
    //     req.flash(
    //         "error",
    //         "Your host account is waiting for admin approval."
    //     );

        
    // }

    // Everything is okay
    next();
};