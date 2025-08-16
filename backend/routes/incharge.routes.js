import { Router } from "express";
import FileItem from "../models/FileItem.js";
import { authRequired } from "../middleware/auth.js";
import { addLog } from "../utils/addLog.js";

const router = Router();
router.use(authRequired(["incharge"]));

/**
 * GET /api/incharge/files
 */
router.get("/files", async (req, res) => {
  const files = await FileItem.find({ assignedTo: req.user.id }).sort("-createdAt");
  res.json(files);
});

/**
 * PUT /api/incharge/files/:id/complete
 */
router.put("/files/:id/complete", async (req, res) => {
  const { id } = req.params;
  const doc = await FileItem.findOne({ _id: id, assignedTo: req.user.id });
  if (!doc) return res.status(404).json({ message: "File not found" });
  if (doc.status !== "completed") {
    doc.status = "completed";
    addLog(doc, "completed", req.user.id, "Marked as completed by incharge");
    await doc.save();
  }
  res.json(doc);
});

export default router;
