const User = require("../models/User.model");
const hashUtil = require("./hash");
const env = require("../config/env");

const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: "ADMIN" });

        if (!adminExists) {
            console.log("🌱 No admin user found, seeding admin...");

            const adminEmail = env.adminEmail || "admin@fepa.com";
            const adminPassword = env.adminPassword || "AdminPassword123";

            const passwordHash = await hashUtil.hash(adminPassword);

            await User.create({
                email: adminEmail,
                passwordHash,
                fullName: "System Administrator",
                role: "ADMIN",
                isVerified: true
            });

            console.log(`✅ Admin user seeded successfully with email: ${adminEmail}`);
        } else {
            console.log("ℹ️ Admin user already exists, skipping seeding.");
        }
    } catch (error) {
        console.error("❌ Error seeding admin user:", error);
    }
};

module.exports = seedAdmin;
