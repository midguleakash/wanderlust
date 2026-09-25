const User = require("../models/user.js");
const crypto = require("crypto");

const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");


const OTP = require("../models/otp.js");



const {
  generateOTP,
  hashOTP
} = require("../utils/otpGenerator.js");

const {
  sendEmail
} = require("../services/emailService.js");

module.exports.signupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signUp = async (req, res, next) => {
  try {
    let { username, email, password, role } = req.body;
    email = email.trim().toLowerCase();

    // OTP verification check
    if (req.session.emailVerified !== email) {
      req.flash(
        "error",
        "Please verify your email before creating an account."
      );
      return res.redirect("/signup");
    }

    // Public signup only allows guest or host
    if (!["guest", "host"].includes(role)) {
      req.flash("error", "Invalid role selected!");
      return res.redirect("/signup");
    }

    // 2. Check existing username/email
    const existingUser = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });

    if (existingUser) {

      if (existingUser.username === username) {
        req.flash("error", "Username is already registered!");
      } else if (existingUser.email === email) {
        req.flash("error", "Email is already registered!");
      }

      return res.redirect("/signup");
    }



    const newUser = new User({ email, username, role });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        return next();
      }

      delete req.session.emailVerified;
      
      if (role === "host") {
        req.flash(
          "success",
          "Registration successful! Wait for admin approval."
        );
      } else {
        req.flash(
          "success",
          "Welcome to Wanderlust!"
        );
      }
      res.redirect("/listings");
    });
  } catch (e) {

    // Safety net for race conditions / duplicate-key errors
    if (e.code === 11000) {

      if (e.keyPattern?.email) {
        req.flash("error", "Email is already registered!");
      } else if (e.keyPattern?.username) {
        req.flash("error", "Username is already registered!");
      } else {
        req.flash("error", "User already exists!");
      }

    } else {
      req.flash("error", e.message);
    }

    res.redirect("/signup");
  }
};

module.exports.loginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "login successfully");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "successfully logout");
    res.redirect("/listings");
  });
};


module.exports.generateOTP = async (req, res) => {
  try {
    
    const { email } = req.body;

    // Check email
    if (!email) {
      return res.json({
        success: false,
        message: "Email is required!"
      });
    }

    // Check whether email already registered
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email is already registered!"
      });
    }

    // Generate OTP
    const otp = generateOTP();
    console.log(otp);
    const otpHash = hashOTP(otp);
    

    // OTP expires after 5 minutes
    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Delete previous OTP
    await OTP.deleteMany({ email });

    // Save new OTP
    await OTP.create({
      email,
      otpHash,
      expiresAt
    });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: "Wanderlust Email Verification OTP",
      html: `
                <h2>Wanderlust</h2>

                <p>Your verification OTP is:</p>

                <h1>${otp}</h1>

                <p>This OTP will expire in 5 minutes.</p>

                <p>Do not share this OTP with anyone.</p>
            `
    });

    res.json({
      success: true,
      message: "OTP sent. Please check your email.!"
    });

  } catch (error) {

    console.log(error);

    res.json({
      success: false,
      message: "Unable to send OTP!"
    });
  }
};



module.exports.verifyOTP = async (req, res) => {
    

    try {
        
        const { otp } = req.body;
        const email = req.body.email.trim().toLowerCase();

        console.log(email, otp);

        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord) {
            return res.json({
                success: false,
                message: "OTP not found. Please generate OTP again."
            });
        }

        // Check expiry
        if (otpRecord.expiresAt < new Date()) {

            await OTP.deleteOne({
                _id: otpRecord._id
            });

            return res.json({
                success: false,
                message: "OTP expired. Please generate a new OTP."
            });
        }

        // Hash entered OTP
        const otpHash = hashOTP(otp);

        // Compare hashed OTP
        if (otpRecord.otpHash !== otpHash) {
            return res.json({
                success: false,
                message: "Invalid OTP!"
            });
        }

        // Correct OTP → delete OTP
        await OTP.deleteOne({
            _id: otpRecord._id
        });

        // Mark email as verified
        req.session.emailVerified = email;

        res.json({
            success: true,
            message: "Email verified successfully!"
        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: "Something went wrong!"
        });
    }

    
};

module.exports.profile = async (req, res, next) => {

    try {

      console.log("profile controller me aya");

        // res.render("users/profile", {
        //     user: req.user
        // });
      
    } catch (err) {

        next(err);

    }
};