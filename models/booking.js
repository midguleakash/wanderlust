const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookingSchema = new Schema(
    {
        guest: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
            required: true
        },

        host: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        checkIn: {
            type: Date,
            required: true
        },

        checkOut: {
            type: Date,
            required: true
        },

        guests: {
            type: Number,
            required: true,
            min: 1
        },

        nights: {
            type: Number,
            required: true,
            min: 1
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending"
        },

        razorpayOrderId: {
            type: String
        },

        razorpayPaymentId: {
            type: String
        },

        bookingStatus: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Booking", bookingSchema);