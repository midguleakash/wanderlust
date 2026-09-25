module.exports.dashboard = async (req, res, next) => {

    try {

        // Temporary values
        const listingCount = 0;
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