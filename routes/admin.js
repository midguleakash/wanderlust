const express = require("express");
const router = express.Router();

const { isAdmin } = require("../middleware/admin");
const adminController = require("../controllers/admin");

router.get(
    "/dashboard",
    // isAdmin,
    adminController.dashboard
);

module.exports = router;