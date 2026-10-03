const PDFDocument = require("pdfkit");

const generateBookingPDF = (booking) => {
    return new Promise((resolve, reject) => {

        const doc = new PDFDocument({
            margin: 50
        });

        const chunks = [];

        doc.on("data", (chunk) => {
            chunks.push(chunk);
        });

        doc.on("end", () => {
            const pdfBuffer = Buffer.concat(chunks);
            resolve(pdfBuffer);
        });

        doc.on("error", reject);

        const listing = booking.listing;
        const guest = booking.guest;

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });
        };

        // =========================
        // HEADER
        // =========================

        doc
            .fontSize(24)
            .font("Helvetica-Bold")
            .text("WANDERLUST", {
                align: "center"
            });

        doc.moveDown();

        doc
            .fontSize(18)
            .font("Helvetica-Bold")
            .text("Booking Confirmation", {
                align: "center"
            });

        doc.moveDown(2);

        // =========================
        // STATUS
        // =========================

        doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .text("Booking Status: CONFIRMED");

        doc
            .fontSize(12)
            .font("Helvetica")
            .text("Payment Status: PAID");

        doc.moveDown(2);

        // =========================
        // BOOKING DETAILS
        // =========================

        doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .text("Booking Details");

        doc.moveDown();

        doc
            .fontSize(12)
            .font("Helvetica")
            .text(`Booking ID: ${booking._id}`);

        doc.text(`Booking Date: ${formatDate(booking.createdAt)}`);

        doc.moveDown();

        // =========================
        // GUEST DETAILS
        // =========================

        doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .text("Guest Details");

        doc.moveDown();

        doc
            .fontSize(12)
            .font("Helvetica")
            .text(`Name: ${guest.username}`);

        doc.text(`Email: ${guest.email}`);

        doc.moveDown();

        // =========================
        // PROPERTY DETAILS
        // =========================

        doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .text("Property Details");

        doc.moveDown();

        doc
            .fontSize(12)
            .font("Helvetica")
            .text(`Property: ${listing.title}`);

        doc.text(`Location: ${listing.location}`);

        doc.text(`Country: ${listing.country}`);

        doc.moveDown();

        // =========================
        // STAY DETAILS
        // =========================

        doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .text("Stay Details");

        doc.moveDown();

        doc
            .fontSize(12)
            .font("Helvetica")
            .text(`Check-in: ${formatDate(booking.checkIn)}`);

        doc.text(`Check-out: ${formatDate(booking.checkOut)}`);

        doc.text(`Guests: ${booking.guests}`);

        doc.text(`Nights: ${booking.nights}`);

        doc.moveDown();

        // =========================
        // PAYMENT DETAILS
        // =========================

        doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .text("Payment Details");

        doc.moveDown();

        doc
            .fontSize(12)
            .font("Helvetica")
            .text(`Total Amount: ₹${booking.totalAmount}`);

        doc.text(`Payment Status: Paid`);

        if (booking.razorpayPaymentId) {
            doc.text(
                `Payment ID: ${booking.razorpayPaymentId}`
            );
        }

        doc.moveDown(3);

        // =========================
        // FOOTER
        // =========================

        doc
            .fontSize(11)
            .font("Helvetica")
            .text(
                "Thank you for booking with Wanderlust!",
                {
                    align: "center"
                }
            );

        doc.moveDown();

        doc
            .fontSize(9)
            .text(
                "This is a computer-generated booking confirmation.",
                {
                    align: "center"
                }
            );

        doc.end();
    });
};

module.exports = generateBookingPDF;