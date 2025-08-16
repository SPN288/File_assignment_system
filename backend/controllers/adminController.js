import User from "../models/User.js";
import File from "../models/File.js";

export const getIncharges = async (req, res) => {
  const incharges = await User.find({ role: "incharge" });
  const result = await Promise.all(
    incharges.map(async (inc) => {
      const count = await File.countDocuments({ assignedTo: inc._id });
      return { _id: inc._id, username: inc.username, fileCount: count };
    })
  );
  res.json(result);
};

export const getFilesForIncharge = async (req, res) => {
  const files = await File.find({ assignedTo: req.params.id });
  res.json(files);
};

export const assignFile = async (req, res) => {
  const { title, description, inchargeId } = req.body;
  const file = new File({
    title,
    description,
    assignedTo: inchargeId,
    logs: [{ action: "assigned", by: req.user.id }]
  });
  await file.save();
  res.json(file);
};

export const updateFile = async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ message: "File not found" });

  Object.assign(file, req.body);
  file.logs.push({ action: "updated", by: req.user.id });
  await file.save();
  res.json(file);
};

export const deleteFile = async (req, res) => {
  await File.findByIdAndDelete(req.params.id);
  res.json({ message: "File deleted" });
};

export const getLogs = async (req, res) => {
  const files = await File.find().populate("logs.by", "username");
  res.json(files.map(f => ({ title: f.title, logs: f.logs })));
};
