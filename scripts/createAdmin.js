const mongoose = require("mongoose");
const User = require("../models/user");
require("dotenv").config();

const dbUrl = process.env.MONGO_URL;

async function createAdmin() {
    try {
        await mongoose.connect(dbUrl);

        console.log("Database connected");

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminUsername || !adminPassword) {
            console.log("Admin credentials are missing in .env");
            process.exit(1);
        }

        const existingAdmin = await User.findOne({
            role: "admin"
        });

        if (existingAdmin) {
            console.log("Admin already exists!");
            process.exit(0);
        }

        const existingUser = await User.findOne({
            $or: [
                { email: adminEmail },
                { username: adminUsername }
            ]
        });

        if (existingUser) {
            console.log("Email or username already exists!");
            process.exit(1);
        }

        const admin = new User({
            username: adminUsername,
            email: adminEmail,
            role: "admin",
            hostApproved: false
        });

        const registeredAdmin = await User.register(
            admin,
            adminPassword
        );

        console.log("Admin created successfully!");
        console.log("Username:", registeredAdmin.username);
        console.log("Email:", registeredAdmin.email);

        process.exit(0);

    } catch (error) {
        console.log("Error creating admin:", error);
        process.exit(1);
    }
}

createAdmin();