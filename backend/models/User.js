import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "incharge"], required: true }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
