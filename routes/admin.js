const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.js");
const { isAdmin } = require("../middleware/admin.js");


// Admin Dashboard
router.get(
    "/dashboard",
    // isAdmin,
    adminController.dashboard
);


// Manage Users
router.get(
    "/users",
    // isAdmin,
    adminController.users
);

// View User Details
router.get(
    "/users/:id",
    // isAdmin,
    adminController.userDetails
);


// Host Approval
router.get(
    "/hosts",
    // isAdmin,
    adminController.hosts
);

// Approve Host
router.patch(
    "/hosts/:id/approve",
    // isAdmin,    
    adminController.approveHost
);


// Reject Host
router.patch(
    "/hosts/:id/reject",
    // isAdmin,
    adminController.rejectHost
);


// Manage Listings
router.get(
    "/listings",
    // isAdmin,
    adminController.listings
);


// Manage Admins
router.get(
    "/admins",
    // isAdmin,
    adminController.admins
);

// Block User
router.patch(
    "/users/:id/block",
    // isAdmin,
    adminController.blockUser
);

// Unblock User
router.patch(
    "/users/:id/unblock",
    // isAdmin,
    adminController.unblockUser
);


module.exports = router;