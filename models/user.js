const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },

    role: {
        type: String,
        enum: ["guest", "host", "admin"],
        default: "guest"
    },

    hostApproved: {
        type: Boolean,
        default: false
    },

    hostStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    // Account block status
    isBlocked: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);