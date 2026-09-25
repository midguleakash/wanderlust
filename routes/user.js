const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

router
  .route("/signup")
  .get(userController.signupForm)
  .post(wrapAsync(userController.signUp));

// Generate OTP
router.post(
  "/generate-otp",
  wrapAsync(userController.generateOTP)
); 

// Verify OTP
router.post(
  "/verify-otp",
  wrapAsync(userController.verifyOTP)
);

router
  .route("/login")
  .get(userController.loginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

router.get("/logout", userController.logout);

// Profile
router.get(
    "/profile",
    // isLoggedIn,
    userController.profile
);

module.exports = router;
