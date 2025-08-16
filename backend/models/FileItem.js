import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const fileLogSchema = new mongoose.Schema(
  {
    action: { type: String, enum: ["assigned", "updated", "completed"], required: true },
    by: { type: ObjectId, ref: "User", required: true },
    note: { type: String }
  },
  { timestamps: { createdAt: "timestamp", updatedAt: false } }
);

const fileItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
    logs: [fileLogSchema]
  },
  { timestamps: true }
);
fileItemSchema.index({ assignedTo: 1, createdAt: -1 });
fileItemSchema.index({ title: "text", description: "text" });


export default mongoose.model("FileItem", fileItemSchema);
