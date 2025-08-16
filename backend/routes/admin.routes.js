import { Router } from "express";
import User from "../models/User.js";
import FileItem from "../models/FileItem.js";
import { authRequired } from "../middleware/auth.js";
import { addLog } from "../utils/addLog.js";
import mongoose from "mongoose";

const router = Router();
router.use(authRequired(["admin"]));

/**
 * GET /api/admin/incharges
 * returns [{ _id, username, fileCount }]
 */
router.get("/incharges", async (_req, res) => {
  const incharges = await User.aggregate([
    { $match: { role: "incharge" } },
    {
      $lookup: {
        from: "fileitems",
        localField: "_id",
        foreignField: "assignedTo",
        as: "files"
      }
    },
    {
      $project: {
        username: 1,
        fileCount: { $size: "$files" }
      }
    },
    { $sort: { username: 1 } }
  ]);
  res.json(incharges);
});

/**
 * GET /api/admin/incharges/:id/files
 */
router.get("/incharges/:id/files", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
  const files = await FileItem.find({ assignedTo: id })
    .populate("assignedTo", "username role")
    .sort("-createdAt");
  res.json(files);
});

/**
 * POST /api/admin/files
 * body: { title, description, assignedTo }
 */
router.post("/files", async (req, res) => {
  const { title, description = "", assignedTo } = req.body;
  if (!title || !assignedTo) return res.status(400).json({ message: "title & assignedTo required" });

  const doc = await FileItem.create({
    title,
    description,
    assignedTo,
    status: "in-progress",
    logs: []
  });
  addLog(doc, "assigned", req.user.id, `Assigned to ${assignedTo}`);
  await doc.save();
  const populated = await doc.populate("assignedTo", "username role");
  res.status(201).json(populated);
});

/**
 * PUT /api/admin/files/:id
 * body: any of { title, description, assignedTo, status }
 */
router.put("/files/:id", async (req, res) => {
  const { id } = req.params;
  const payload = req.body || {};
  const doc = await FileItem.findById(id);
  if (!doc) return res.status(404).json({ message: "File not found" });

  const changes = [];
  for (const key of ["title", "description", "assignedTo", "status"]) {
    if (payload[key] !== undefined && payload[key] !== doc[key]?.toString()) {
      changes.push(`${key}: ${doc[key]} -> ${payload[key]}`);
      doc[key] = payload[key];
    }
  }
  addLog(doc, "updated", req.user.id, changes.join("; "));
  await doc.save();
  const populated = await FileItem.findById(doc._id).populate("assignedTo", "username role");
  res.json(populated);
});

/**
 * DELETE /api/admin/files/:id
 */
router.delete("/files/:id", async (req, res) => {
  const { id } = req.params;
  const doc = await FileItem.findById(id);
  if (!doc) return res.status(404).json({ message: "File not found" });
  await FileItem.findByIdAndDelete(id);
  res.json({ message: "Deleted" });
});

/**
 * GET /api/admin/logs
 * optional query: userId, action, limit
 */
router.get("/logs", async (req, res) => {
  const { userId, action, limit = 50 } = req.query;
  const match = {};
  if (action) match["logs.action"] = action;
  if (userId) match["logs.by"] = new mongoose.Types.ObjectId(userId);

  const pipeline = [
    { $unwind: "$logs" },
    ...(action || userId ? [{ $match: match }] : []),
    {
      $lookup: {
        from: "users",
        localField: "logs.by",
        foreignField: "_id",
        as: "byUser"
      }
    },
    { $unwind: "$byUser" },
    {
      $project: {
        fileId: "$_id",
        title: 1,
        action: "$logs.action",
        note: "$logs.note",
        by: { _id: "$byUser._id", username: "$byUser.username", role: "$byUser.role" },
        timestamp: "$logs.timestamp"
      }
    },
    { $sort: { timestamp: -1 } },
    { $limit: Number(limit) }
  ];

  const logs = await FileItem.aggregate(pipeline);
  res.json(logs);
});

export default router;
