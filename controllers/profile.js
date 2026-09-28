const User = require("../models/user.js");
const OTP = require("../models/otp.js");

const { generateOTP, hashOTP } = require("../utils/otpGenerator.js");
const { sendEmail } = require("../services/emailService.js");


// Show Profile

module.exports.showProfile = async (req, res, next) => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {

            req.flash("error", "User not found!");

            return res.redirect("/listings");
        }

        res.render("profile/profile.ejs", { user });

    } catch (err) {

        next(err);

    }
};


// Show Change Password Form

module.exports.changePasswordForm = (req, res) => {

    res.render("profile/change-password.ejs");

};


// Send Password Change OTP

module.exports.sendPasswordChangeOtp = async (req, res, next) => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {

            return res.json({
                success: false,
                message: "User not found!"
            });

        }


        const otp = generateOTP();

        const otpHash = hashOTP(otp);


        await OTP.deleteMany({
            email: user.email
        });


        await OTP.create({
            email: user.email,
            otpHash: otpHash,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });


        await sendEmail({
            to: user.email,

            subject: "Wanderlust - Password Change OTP",

            html: `
                <h2>Password Change Verification</h2>

                <p>
                    Your OTP for changing your Wanderlust password is:
                </p>

                <h1>${otp}</h1>

                <p>
                    This OTP will expire in 5 minutes.
                </p>

                <p>
                    If you did not request this, please ignore this email.
                </p>
            `
        });


        res.json({
            success: true,
            message: "OTP sent successfully!"
        });


    } catch (err) {

        next(err);

    }

};


// Verify Password Change OTP

module.exports.verifyPasswordChangeOtp = async (req, res, next) => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {

            return res.json({
                success: false,
                message: "User not found!"
            });

        }


        const { otp } = req.body;


        if (!otp) {

            return res.json({
                success: false,
                message: "OTP is required!"
            });

        }


        const otpHash = hashOTP(otp);


        const otpRecord = await OTP.findOne({
            email: user.email,
            otpHash: otpHash,
            expiresAt: { $gt: new Date() }
        });


        if (!otpRecord) {

            return res.json({
                success: false,
                message: "Invalid or expired OTP!"
            });

        }


        await OTP.deleteOne({
            _id: otpRecord._id
        });


        req.session.passwordChangeVerified = user.email;


        res.json({
            success: true,
            message: "OTP verified successfully!"
        });


    } catch (err) {

        next(err);

    }

};


// Change Password

module.exports.changePassword = async (req, res, next) => {

    try {

        const { newPassword, confirmPassword } = req.body;


        if (req.session.passwordChangeVerified !== req.user.email) {

            req.flash(
                "error",
                "Please verify your email using OTP first."
            );

            return res.redirect("/profile/change-password");

        }


        if (newPassword !== confirmPassword) {

            req.flash(
                "error",
                "Passwords do not match!"
            );

            return res.redirect("/profile/change-password");

        }


        if (newPassword.length < 3) {

            req.flash(
                "error",
                "Password must be at least 6 characters!"
            );

            return res.redirect("/profile/change-password");

        }


        const user = await User.findById(req.user._id);


        if (!user) {

            req.flash(
                "error",
                "User not found!"
            );

            return res.redirect("/listings");

        }


        await user.setPassword(newPassword);

        await user.save();


        delete req.session.passwordChangeVerified;


        req.flash(
            "success",
            "Password changed successfully!"
        );


        res.redirect("/profile");


    } catch (err) {

        next(err);

    }

};