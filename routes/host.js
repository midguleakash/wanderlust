const express = require("express");
const router = express.Router();

const hostController = require("../controllers/host");
const { isApprovedHost } = require("../middleware/host");

router.get(
    "/dashboard",
    isApprovedHost,
    hostController.dashboard
);

module.exports = router;