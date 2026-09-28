const express = require("express");
const router = express.Router();

const hostController = require("../controllers/host");
const { isApprovedHost ,isHost } = require("../middleware/host");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const {validateListing } = require("../middleware.js");



router.get(
    "/dashboard",
    isHost,
    hostController.dashboard);

router.get(
    "/listings",
    isApprovedHost,
    hostController.myListings
);

// =========================
// NEW LISTING
// =========================

router.get(
    "/listings/new",
    isApprovedHost,
    hostController.renderNewListingForm
);

router.get(
    "/listings/:id",
    isApprovedHost,
    hostController.showListing
);

router.get(
    "/bookings",
    isApprovedHost,
    hostController.bookings
);



router.get(
    "/listings/:id/edit",
    isApprovedHost,
    hostController.renderEditForm
);

router.put(
    "/listings/:id",
    isApprovedHost,
    upload.single("listing[image]"),
    validateListing,
    hostController.updateListing
);

router.delete(
    "/listings/:id",
    isApprovedHost,
    hostController.deleteListing
);




// =========================
// CREATE LISTING
// =========================

router.post(
    "/listings",
    isApprovedHost,
    upload.single("listing[image]"),
    validateListing,
    hostController.createListing
);

module.exports = router;