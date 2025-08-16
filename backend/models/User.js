import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "incharge"], required: true }
  },
  { timestamps: true }
);
userSchema.index({ role: 1, username: 1 });
userSchema.index({ username: 1 }, { unique: true });


export default mongoose.model("User", userSchema);
