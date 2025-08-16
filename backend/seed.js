import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing users (optional)
    await User.deleteMany();

    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const hashedInchargePassword = await bcrypt.hash("incharge123", 10);

    const users = [
      {
        username: "admin",
        password: hashedAdminPassword,
        role: "admin",
      },
      {
        username: "admin2",
        password: hashedAdminPassword,
        role: "admin",
      },
      {
        username: "incharge1",
        password: hashedInchargePassword,
        role: "incharge",
      },
      {
        username: "incharge2",
        password: hashedInchargePassword,
        role: "incharge",
      },
      {
        username: "incharge3",
        password: hashedInchargePassword,
        role: "incharge",
      },
      {
        username: "incharge4",
        password: hashedInchargePassword,
        role: "incharge",
      },
      {
        username: "incharge5",
        password: hashedInchargePassword,
        role: "incharge",
      },
      {
        username: "incharge6",
        password: hashedInchargePassword,
        role: "incharge",
      },
      {
        username: "incharge7",
        password: hashedInchargePassword,
        role: "incharge",
      },
      {
        username: "incharge8",
        password: hashedInchargePassword,
        role: "incharge",
      }
    ];

    await User.insertMany(users);

    console.log("✅ Seed data inserted successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error inserting seed data:", err);
    process.exit(1);
  }
};

seedUsers();
