const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profile.js");
const { isLoggedIn } = require("../middleware.js");


// Profile
router.get(
    "/", 
    isLoggedIn,   
    profileController.showProfile
);


// Change Password Form
router.get(
    "/change-password",
    isLoggedIn,
    profileController.changePasswordForm
);


// Change Password
router.put(
    "/change-password",
    isLoggedIn,
    profileController.changePassword
);

// Send OTP

router.post(
    "/change-password/send-otp",
    isLoggedIn,
    profileController.sendPasswordChangeOtp
);


// Verify OTP

router.post(
    "/change-password/verify-otp",
    isLoggedIn,
    profileController.verifyPasswordChangeOtp
);



module.exports = router;