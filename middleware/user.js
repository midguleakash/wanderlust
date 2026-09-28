module.exports.isNotBlocked = (req, res, next) => {

    if (!req.isAuthenticated()) {
        return next();
    }

    if (req.user.isBlocked) {

        req.logout((err) => {

            if (err) {
                return next(err);
            }

            req.flash(
                "error",
                "Your account has been blocked by the administrator."
            );

            return res.redirect("/login");
        });

        return;
    }

    next();
};