const User = require("../models/user.js");
const Listing = require("../models/listing.js");

const OTP = require("../models/otp.js");
const { generateOTP, hashOTP } = require("../utils/otpGenerator.js");
const { sendEmail } = require("../services/emailService.js");


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



// Manage Listings
module.exports.listings = async (req, res, next) => {
    try {
        const { search, location } = req.query;

        let filter = {};

        if (search) {
            filter.title = {
                $regex: search,
                $options: "i"
            };
        }

        if (location) {
            filter.location = {
                $regex: location,
                $options: "i"
            };
        }

        const listings = await Listing.find(filter)
            .populate("owner")
            .sort({ _id: -1 });

        res.render("admin/listings.ejs", {
            listings,
            search: search || "",
            selectedLocation: location || ""
        });

    } catch (err) {
        next(err);
    }
};


module.exports.toggleListing = async (req, res, next) => {
    try {
        const { id } = req.params;

        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/admin/listings");
        }

        listing.isHidden = !listing.isHidden;

        await listing.save();

        if (listing.isHidden) {
            req.flash("success", "Listing hidden successfully!");
        } else {
            req.flash("success", "Listing unhidden successfully!");
        }

        res.redirect("/admin/listings");

    } catch (err) {
        next(err);
    }
};

module.exports.listingDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        const listing = await Listing.findById(id)
            .populate("owner")
            .populate({
                path: "reviews",
                populate: {
                    path: "author"
                }
            });

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/admin/listings");
        }

        res.render("admin/listing-details.ejs", {
            listing
        });

    } catch (err) {
        next(err);
    }
};



// Manage Admins
module.exports.admins = async (req, res, next) => {
    try {

        const admins = await User.find({
            role: "admin"
        }).sort({ _id: -1 });

        res.render("admin/admins.ejs", {
            admins
        });

    } catch (err) {
        next(err);
    }
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






module.exports.createAdmin = async (req, res, next) => {

    try {

        let {
            username,
            email,
            password,
            confirmPassword
        } = req.body;


        username = username.trim();
        email = email.trim().toLowerCase();


        // Check OTP verification

        if (req.session.emailVerified !== email) {

            req.flash(
                "error",
                "Please verify your email before creating admin."
            );

            return res.redirect("/admin/admins/new");
        }


        // Check password

        if (password !== confirmPassword) {

            req.flash(
                "error",
                "Passwords do not match."
            );

            return res.redirect("/admin/admins/new");
        }


        // Check existing username/email

        const existingUser = await User.findOne({
            $or: [
                { username },
                { email }
            ]
        });


        if (existingUser) {

            if (existingUser.username === username) {

                req.flash(
                    "error",
                    "Username is already registered!"
                );

            } else {

                req.flash(
                    "error",
                    "Email is already registered!"
                );

            }

            return res.redirect("/admin/admins/new");
        }


        // Create Admin

        const newAdmin = new User({

            username,
            email,

            role: "admin",

            isVerified: true,

            isBlocked: false

        });


        await User.register(
            newAdmin,
            password
        );


        // Remove OTP verification from session

        delete req.session.emailVerified;


        req.flash(
            "success",
            "New administrator created successfully!"
        );


        res.redirect("/admin/admins");


    } catch (err) {

        next(err);

    }

};

module.exports.addAdminForm = (req, res) => {
    res.render("admin/add-admin.ejs");
};


module.exports.blockAdmin = async (req, res, next) => {
    try {

        const { id } = req.params;

        const admin = await User.findOne({
            _id: id,
            role: "admin"
        });

        if (!admin) {
            req.flash("error", "Admin not found!");
            return res.redirect("/admin/admins");
        }

        admin.isBlocked = true;

        await admin.save();

        req.flash("success", "Admin blocked successfully!");

        res.redirect("/admin/admins");

    } catch (err) {
        next(err);
    }
};


module.exports.unblockAdmin = async (req, res, next) => {
    try {

        const { id } = req.params;

        const admin = await User.findOne({
            _id: id,
            role: "admin"
        });

        if (!admin) {
            req.flash("error", "Admin not found!");
            return res.redirect("/admin/admins");
        }

        admin.isBlocked = false;

        await admin.save();

        req.flash("success", "Admin unblocked successfully!");

        res.redirect("/admin/admins");

    } catch (err) {
        next(err);
    }
};