const User = require("../models/user.js");
const Listing = require("../models/listing.js");


// Admin Dashboard
module.exports.dashboard = async (req, res, next) => {
    try {

        const totalUsers = await User.countDocuments({
            role: { $in: ["guest", "host"] }
        });

        const totalHosts = await User.countDocuments({
            role: "host"
        });

        const pendingHosts = await User.countDocuments({
            role: "host",
            hostApproved: false,
            hostStatus: "pending"
        });

        const totalListings = await Listing.countDocuments();

        res.render("admin/dashboard.ejs", {
            totalUsers,
            totalHosts,
            pendingHosts,
            totalListings
        });

    } catch (err) {
        next(err);
    }
};

// Manage Users
module.exports.users = async (req, res, next) => {
    try {

        const { search, role, status } = req.query;

        let filter = {};

        // Search by username or email
        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        // Role filter
        if (role) {
            filter.role = role;
        }

        // Status filter
        if (status === "verified") {
            filter.isVerified = true;
        }

        if (status === "notVerified") {
            filter.isVerified = false;
        }

        if (status === "pending") {
            filter.role = "host";
            filter.hostStatus = "pending";
        }

        if (status === "approved") {
            filter.role = "host";
            filter.hostStatus = "approved";
        }

        if (status === "rejected") {
            filter.role = "host";
            filter.hostStatus = "rejected";
        }

        const users = await User.find(filter).sort({ _id: -1 });

        res.render("admin/users.ejs", {
            users,
            search: search || "",
            selectedRole: role || "",
            selectedStatus: status || ""
        });

    } catch (err) {
        next(err);
    }
};



module.exports.listings = async (req, res) => {
    res.render("admin/listings.ejs");
};

module.exports.admins = async (req, res) => {
    res.render("admin/admins.ejs");
};


// Host Approval Page
module.exports.hosts = async (req, res, next) => {
    try {

        const hosts = await User.find({
            role: "host"
        }).sort({ _id: -1 });

        res.render("admin/hosts.ejs", {
            hosts
        });

    } catch (err) {
        next(err);
    }
};


// Approve Host
module.exports.approveHost = async (req, res, next) => {
    try {

        const { id } = req.params;

        await User.findOneAndUpdate(
            {
                _id: id,
                role: "host"
            },
            {
                hostApproved: true,
                hostStatus: "approved"
            }
        );

        req.flash("success", "Host approved successfully!");

        res.redirect("/admin/hosts");

    } catch (err) {
        next(err);
    }
};


// Reject Host
module.exports.rejectHost = async (req, res, next) => {
    try {

        const { id } = req.params;

        await User.findOneAndUpdate(
            {
                _id: id,
                role: "host"
            },
            {
                hostApproved: false,
                hostStatus: "rejected"
            }
        );

        req.flash("success", "Host rejected successfully!");

        res.redirect("/admin/hosts");

    } catch (err) {
        next(err);
    }
};

// Block User
module.exports.blockUser = async (req, res, next) => {
    try {

        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            req.flash("error", "User not found!");
            return res.redirect("/admin/users");
        }

        // Don't allow admin to block an admin
        if (user.role === "admin") {
            req.flash("error", "Admin account cannot be blocked!");
            return res.redirect("/admin/users");
        }

        user.isBlocked = true;

        await user.save();

        req.flash("success", "User blocked successfully!");

        res.redirect("/admin/users");

    } catch (err) {
        next(err);
    }
};


// Unblock User
module.exports.unblockUser = async (req, res, next) => {
    try {

        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            req.flash("error", "User not found!");
            return res.redirect("/admin/users");
        }

        user.isBlocked = false;

        await user.save();

        req.flash("success", "User unblocked successfully!");

        res.redirect("/admin/users");

    } catch (err) {
        next(err);
    }
};

// View User Details
module.exports.userDetails = async (req, res, next) => {
    try {

        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            req.flash("error", "User not found!");
            return res.redirect("/admin/users");
        }

        res.render("admin/user-details.ejs", {
            user
        });

    } catch (err) {
        next(err);
    }
};