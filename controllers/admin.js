const User = require("../models/user");
// const Listing = require("../models/listing");

module.exports.dashboard = async (req, res, next) => {

    try {

        // Total users
        const totalUsers = await User.countDocuments({
            role: { $in: ["guest", "host"] }
        });

        // Total hosts
        const totalHosts = await User.countDocuments({
            role: "host"
        });

        // Hosts waiting for approval
        const pendingHosts = await User.countDocuments({
            role: "host",
            hostApproved: false
        });

        // Total listings
        // Abhi listing logic baad mein add karenge
        const totalListings = 0;

        res.render("admin/dashboard", {
            totalUsers,
            totalHosts,
            pendingHosts,
            totalListings
        });

    } catch (err) {
        next(err);
    }
};