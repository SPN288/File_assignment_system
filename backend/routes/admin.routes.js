import { Router } from "express";
import User from "../models/User.js";
import FileItem from "../models/FileItem.js";
import { authRequired } from "../middleware/auth.js";
import { addLog } from "../utils/addLog.js";
import mongoose from "mongoose";

const router = Router();
router.use(authRequired(["admin"]));

// helper: parse pagination
function parsePage(req) {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.max(Math.min(parseInt(req.query.limit || "10", 10), 100), 1);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * GET /api/admin/incharges?q=&page=&limit=
 * returns: { data: [...], page, pages, total }
 */
router.get("/incharges", async (req, res) => {
  const { q = "" } = req.query;
  const { page, limit, skip } = parsePage(req);
  const matchUsers = {
    role: "incharge",
    ...(q ? { username: { $regex: q, $options: "i" } } : {})
  };

  const total = await User.countDocuments(matchUsers);

  const data = await User.aggregate([
    { $match: matchUsers },
    { $sort: { username: 1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "fileitems",
        localField: "_id",
        foreignField: "assignedTo",
        as: "files"
      }
    },
    { $addFields: { fileCount: { $size: "$files" } } },
    { $project: { username: 1, fileCount: 1 } }
  ]);

  res.json({ data, page, pages: Math.ceil(total / limit), total });
});

/**
 * GET /api/admin/incharges/:id/files?q=&page=&limit=
 * returns: { data: [...], page, pages, total }
 */
router.get("/incharges/:id/files", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

  const { q = "" } = req.query;
  const { page, limit, skip } = parsePage(req);

  const textFilter = q
    ? {
        $or: [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } }
        ]
      }
    : {};

  const where = { assignedTo: id, ...textFilter };

  const total = await FileItem.countDocuments(where);
  const data = await FileItem.find(where)
    .sort("-createdAt")
    .skip(skip)
    .limit(limit)
    .populate("assignedTo", "username role");

  res.json({ data, page, pages: Math.ceil(total / limit), total });
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
  if (changes.length) {
    addLog(doc, "updated", req.user.id, changes.join("; "));
    await doc.save();
  }
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
 * GET /api/admin/logs?q=&action=&userId=&page=&limit=
 * returns: { data: [...], page, pages, total }
 */
router.get("/logs", async (req, res) => {
  const { action, userId, q = "" } = req.query;
  const { page, limit, skip } = parsePage(req);

  const matchStage = [];
  if (action) matchStage.push({ "logs.action": action });
  if (userId && mongoose.isValidObjectId(userId)) matchStage.push({ "logs.by": new mongoose.Types.ObjectId(userId) });

  const base = [
    { $unwind: "$logs" },
    ...(matchStage.length ? [{ $match: { $and: matchStage } }] : []),
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
    }
  ];

  const qStage = q
    ? [
        {
          $match: {
            $or: [
              { title: { $regex: q, $options: "i" } },
              { note: { $regex: q, $options: "i" } },
              { "by.username": { $regex: q, $options: "i" } }
            ]
          }
        }
      ]
    : [];

  const pipeline = [
    ...base,
    ...qStage,
    { $sort: { timestamp: -1 } },
    {
      $facet: {
        meta: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }]
      }
    }
  ];

  const result = await FileItem.aggregate(pipeline);
  const total = result[0]?.meta?.[0]?.total || 0;
  const data = result[0]?.data || [];
  res.json({ data, page, pages: Math.ceil(total / limit), total });
});

export default router;
