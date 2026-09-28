const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.js");
const { isAdmin , isAdminOrSuperAdmin , isSuperAdmin} = require("../middleware/admin.js");


// Admin Dashboard
router.get(
    "/dashboard",
    isAdminOrSuperAdmin,
    adminController.dashboard
);


// Manage Users
router.get(
    "/users",
    isAdminOrSuperAdmin,
    adminController.users
);

// View User Details
router.get(
    "/users/:id",
    isAdminOrSuperAdmin,
    adminController.userDetails
);


// Host Approval
router.get(
    "/hosts",
    isAdminOrSuperAdmin,
    adminController.hosts
);

// Approve Host
router.patch(
    "/hosts/:id/approve",
    isAdminOrSuperAdmin,    
    adminController.approveHost
);


// Reject Host
router.patch(
    "/hosts/:id/reject",
    isAdminOrSuperAdmin,
    adminController.rejectHost
);





// Manage Admins
router.get(
    "/admins",
    isSuperAdmin,
    adminController.admins
);

// Block User
router.patch(
    "/users/:id/block",
    isAdminOrSuperAdmin,
    adminController.blockUser
);

// Unblock User
router.patch(
    "/users/:id/unblock",
    isAdminOrSuperAdmin,
    adminController.unblockUser
);

// Manage Listings
router.get(
    "/listings",
    isAdminOrSuperAdmin,
    adminController.listings
);

router.patch(
    "/listings/:id/toggle",
    isAdminOrSuperAdmin,
    adminController.toggleListing
);

router.get(
    "/listings/:id",
    isAdminOrSuperAdmin,
    adminController.listingDetails
);

router.get(
    "/admins/new",
    isSuperAdmin,
    adminController.addAdminForm
);



router.post(
    "/admins/create",
    isSuperAdmin,
    adminController.createAdmin
);

router.patch(
    "/admins/:id/block",
    isSuperAdmin,
    adminController.blockAdmin
);

router.patch(
    "/admins/:id/unblock",
    isSuperAdmin,
    adminController.unblockAdmin
);

module.exports = router;